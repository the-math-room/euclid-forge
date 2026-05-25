import {
  applyGraphEdit,
  circleConstruction,
  deleteNodesDisabledReason,
  isConstructiblePointNode,
  lineConstruction,
  planFreePoint,
  screenToWorld,
  segmentConstruction,
  triangleConstruction,
} from "@euclid-forge/core";
import type { GeometryNode, Graph, NodeId } from "@euclid-forge/core";
import { pointerDownIntent } from "./pointerIntent";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  activeToolIsReadyToCommit,
  appendActiveToolInput,
  resetActiveToolInputs,
} from "./activeTool";
import type { ActiveTool, PointInputTool } from "./activeTool";
import { changed, preventOnly, unchanged } from "./appTransition";
import type { AppTransition } from "./appTransition";
import type { PointerInput } from "./appController";
import { clearSelection } from "./viewState";

export function handleActiveToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  switch (state.activeTool.kind) {
    case "select":
      return unchanged(state);

    case "point":
      return handlePointToolPointerDown(state, input);

    case "segment":
    case "line":
    case "circle":
    case "triangle":
    case "midpoint":
      return handlePointInputToolPointerDown(state, input);

    case "intersection":
      return changed(
        state,
        "ignore",
        "Intersection tool is not wired yet. Use Shift-select two curves and press I for now.",
      );

    case "delete":
      return handleDeleteToolPointerDown(state, input);
  }
}

function handlePointToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const intent = pointerDownIntent(
    appState(state.graph, state.viewState, state.dragState, state.activeTool),
    {
      ...input,
      shiftKey: false,
    },
  );

  if (intent.kind !== "ADD_FREE_POINT") {
    return preventOnly(state);
  }

  return changed(
    appState(
      applyGraphEdit(state.graph, {
        kind: "ADD_FREE_POINT",
        point: intent.point,
      }),
      clearSelection(state.viewState),
      null,
      state.activeTool,
    ),
    "commit",
  );
}

function handlePointInputToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const hit = selectablePointerHit(state, input);
  const pointInput =
    hit === null
      ? createFreePointInput(state, input)
      : { graph: state.graph, id: hit };

  const node = pointInput.graph.byId.get(pointInput.id);

  if (!node || !isConstructiblePointNode(node)) {
    return changed(state, "ignore", "Choose a point for this tool.");
  }

  const stateWithPoint = appState(
    pointInput.graph,
    state.viewState,
    null,
    state.activeTool,
  );
  const activeTool = appendActiveToolInput(state.activeTool, pointInput.id);

  if (!activeToolIsReadyToCommit(activeTool)) {
    return changed(
      appState(
        stateWithPoint.graph,
        stateWithPoint.viewState,
        null,
        activeTool,
      ),
      hit === null ? "commit" : "ignore",
    );
  }

  if (!isPointInputTool(activeTool)) {
    return changed(stateWithPoint, "ignore", "Choose a point for this tool.");
  }

  const nodes = constructionNodesForPointTool(stateWithPoint, activeTool);

  return changed(
    appState(
      applyGraphEdit(stateWithPoint.graph, {
        kind: "ADD_NODES",
        nodes,
      }),
      clearSelection(stateWithPoint.viewState),
      null,
      resetActiveToolInputs(activeTool),
    ),
    "commit",
  );
}

function createFreePointInput(
  state: AppState,
  input: PointerInput,
): { readonly graph: Graph; readonly id: NodeId } {
  const point = screenToWorld(input.viewport, input.point);
  const planned = planFreePoint(state.graph, point);

  return {
    graph: applyGraphEdit(state.graph, {
      kind: "ADD_NODES",
      nodes: [planned.node],
    }),
    id: planned.id,
  };
}

function constructionNodesForPointTool(
  state: AppState,
  activeTool: PointInputTool,
): readonly GeometryNode[] {
  switch (activeTool.kind) {
    case "segment": {
      const [a, b] = requiredInputs(activeTool, 2);

      return segmentConstruction(state.graph, a, b);
    }

    case "line": {
      const [a, b] = requiredInputs(activeTool, 2);

      return lineConstruction(state.graph, a, b);
    }

    case "circle": {
      const [center, through] = requiredInputs(activeTool, 2);

      return circleConstruction(state.graph, center, through);
    }

    case "triangle":
      return triangleConstruction(state.graph, requiredInputs(activeTool, 3));

    case "midpoint":
      return [];
  }
}

function isPointInputTool(tool: ActiveTool): tool is PointInputTool {
  switch (tool.kind) {
    case "segment":
    case "line":
    case "circle":
    case "triangle":
    case "midpoint":
      return true;

    case "select":
    case "point":
    case "delete":
    case "intersection":
      return false;
  }
}

function requiredInputs(
  activeTool: PointInputTool,
  count: 2,
): readonly [NodeId, NodeId];
function requiredInputs(
  activeTool: PointInputTool,
  count: 3,
): readonly [NodeId, NodeId, NodeId];
function requiredInputs(
  activeTool: PointInputTool,
  count: 2 | 3,
): readonly NodeId[] {
  if (activeTool.inputs.length !== count) {
    throw new Error(`Expected ${count} inputs for ${activeTool.kind}`);
  }

  return activeTool.inputs;
}

function handleDeleteToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const hit = selectablePointerHit(state, input);

  if (!hit) {
    return preventOnly(state);
  }

  const disabledReason = deleteNodesDisabledReason(state.graph, [hit]);

  if (disabledReason) {
    return changed(state, "ignore", disabledReason);
  }

  return changed(
    appState(
      applyGraphEdit(state.graph, {
        kind: "DELETE_NODES",
        ids: [hit],
      }),
      clearSelection(state.viewState),
      null,
      state.activeTool,
    ),
    "commit",
  );
}

function selectablePointerHit(
  state: AppState,
  input: PointerInput,
): NodeId | null {
  const intent = pointerDownIntent(
    appState(state.graph, state.viewState, state.dragState, state.activeTool),
    {
      ...input,
      shiftKey: true,
    },
  );

  return intent.kind === "SELECT_NODE" ? intent.id : null;
}
