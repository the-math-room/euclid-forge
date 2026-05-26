import {
  applyGraphEdit,
  circleConstruction,
  deleteNodesDisabledReason,
  isConstructiblePointNode,
  lineConstruction,
  midpointNode,
  parallelSegmentConstruction,
  perpendicularSegmentConstruction,
  planFreePoint,
  screenToWorld,
  segmentConstruction,
  triangleConstruction,
} from "@euclid-forge/core";
import type { Graph, GraphNode, NodeId } from "@euclid-forge/core";
import { pointerDownIntent } from "./pointerIntent";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  activeToolIsReadyToCommit,
  appendActiveToolInput,
  resetActiveToolInputs,
} from "./activeTool";
import type {
  ActiveTool,
  ParallelTool,
  PerpendicularTool,
  PointInputTool,
} from "./activeTool";
import { changed, preventOnly, transition, unchanged } from "./appTransition";
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

    case "lasso":
      return handleLassoToolPointerDown(state, input);

    case "point":
      return handlePointToolPointerDown(state, input);

    case "segment":
    case "line":
    case "circle":
    case "triangle":
    case "midpoint":
      return handlePointInputToolPointerDown(state, input);

    case "parallel":
    case "perpendicular":
      return handleLinearConstrainedToolPointerDown(state, input);

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

function handleLassoToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  return transition({
    state: appState(
      state.graph,
      state.viewState,
      {
        kind: "LASSO",
        points: [input.point],
        viewport: input.viewport,
      },
      state.activeTool,
    ),
    shouldRender: false,
    shouldPreventDefault: true,
    effects: [
      {
        kind: "SET_POINTER_CAPTURE",
        pointerId: input.pointerId,
      },
    ],
  });
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

function handleLinearConstrainedToolPointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  if (
    state.activeTool.kind !== "parallel" &&
    state.activeTool.kind !== "perpendicular"
  ) {
    return unchanged(state);
  }

  const toolLabel =
    state.activeTool.kind === "parallel" ? "parallel" : "perpendicular";

  const hit = selectablePointerHit(state, input);
  const existingInputs = state.activeTool.inputs;
  const inputNode =
    hit === null
      ? createLinearConstrainedAnchorPointInput(state, input, existingInputs)
      : { graph: state.graph, id: hit, createdPoint: false };

  if (!inputNode) {
    return changed(
      state,
      "ignore",
      "Choose a reference segment or line before creating the anchor point.",
    );
  }

  const candidate = inputNode.graph.byId.get(inputNode.id);

  if (!candidate || !isLinearConstrainedToolCandidate(candidate)) {
    return changed(
      state,
      "ignore",
      `Choose one segment or line and one point for the ${toolLabel} tool.`,
    );
  }

  const stateWithInput = appState(
    inputNode.graph,
    state.viewState,
    null,
    state.activeTool,
  );
  const activeTool = appendActiveToolInput(state.activeTool, inputNode.id);

  if (!activeToolIsReadyToCommit(activeTool)) {
    return changed(
      appState(
        stateWithInput.graph,
        stateWithInput.viewState,
        null,
        activeTool,
      ),
      inputNode.createdPoint ? "commit" : "ignore",
    );
  }

  if (activeTool.kind !== "parallel" && activeTool.kind !== "perpendicular") {
    return changed(
      stateWithInput,
      "ignore",
      `Choose one segment or line and one point for the ${toolLabel} tool.`,
    );
  }

  const constrainedInputs = linearConstrainedToolInputs(
    stateWithInput.graph,
    activeTool,
  );

  if (!constrainedInputs) {
    return changed(
      stateWithInput,
      "ignore",
      `Choose one segment or line and one point for the ${toolLabel} tool.`,
    );
  }

  const [reference, anchor] = constrainedInputs;
  const nodes =
    activeTool.kind === "parallel"
      ? parallelSegmentConstruction(stateWithInput.graph, reference, anchor)
      : perpendicularSegmentConstruction(
          stateWithInput.graph,
          reference,
          anchor,
        );

  if (nodes.length === 0) {
    return changed(
      stateWithInput,
      "ignore",
      `${capitalize(toolLabel)} segment already exists.`,
    );
  }

  return changed(
    appState(
      applyGraphEdit(stateWithInput.graph, {
        kind: "ADD_NODES",
        nodes,
      }),
      clearSelection(stateWithInput.viewState),
      null,
      resetActiveToolInputs(activeTool),
    ),
    "commit",
  );
}

function createLinearConstrainedAnchorPointInput(
  state: AppState,
  input: PointerInput,
  existingInputs: readonly NodeId[],
): {
  readonly graph: Graph;
  readonly id: NodeId;
  readonly createdPoint: boolean;
} | null {
  if (!existingInputs.some((id) => isLinearNode(state.graph.byId.get(id)))) {
    return null;
  }

  const created = createFreePointInput(state, input);

  return {
    ...created,
    createdPoint: true,
  };
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
): readonly GraphNode[] {
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

    case "midpoint": {
      const [a, b] = requiredInputs(activeTool, 2);
      const segment = findSegmentBetween(state.graph.nodes, a, b);

      if (!segment) {
        return [];
      }

      const existing = state.graph.nodes.find(
        (node) => node.kind === "MIDPOINT" && node.segment === segment.id,
      );

      if (existing) {
        return [];
      }

      return [midpointNode(`M_${segment.id}`, segment.id, "M")];
    }
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

    case "parallel":
    case "perpendicular":
    case "select":
    case "lasso":
    case "point":
    case "delete":
    case "intersection":
      return false;
  }
}

function linearConstrainedToolInputs(
  graph: Graph,
  tool: ParallelTool | PerpendicularTool,
): readonly [NodeId, NodeId] | null {
  if (tool.inputs.length !== 2) {
    return null;
  }

  const [first, second] = tool.inputs;
  const firstNode = first ? graph.byId.get(first) : null;
  const secondNode = second ? graph.byId.get(second) : null;

  if (first && second && isLinearNode(firstNode) && isPointNode(secondNode)) {
    return [first, second];
  }

  if (first && second && isPointNode(firstNode) && isLinearNode(secondNode)) {
    return [second, first];
  }

  return null;
}

function isLinearConstrainedToolCandidate(node: GraphNode): boolean {
  return isLinearNode(node) || isPointNode(node);
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function isLinearNode(node: GraphNode | null | undefined): boolean {
  return node?.kind === "SEGMENT" || node?.kind === "LINE";
}

function isPointNode(node: GraphNode | null | undefined): boolean {
  return !!node && isConstructiblePointNode(node);
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

function findSegmentBetween(
  nodes: readonly GraphNode[],
  a: NodeId,
  b: NodeId,
): Extract<GraphNode, { kind: "SEGMENT" }> | null {
  const found = nodes.find(
    (node): node is Extract<GraphNode, { kind: "SEGMENT" }> =>
      node.kind === "SEGMENT" &&
      ((node.a === a && node.b === b) || (node.a === b && node.b === a)),
  );

  return found ?? null;
}
