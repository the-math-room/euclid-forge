import { deltaBetween } from "@euclid-forge/core";
import { applyGraphEdit } from "@euclid-forge/core";
import type { NodeId } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";
import { screenToWorld } from "@euclid-forge/core";
import {
  circleConstruction,
  deleteNodesDisabledReason,
  isConstructiblePointNode,
  lineConstruction,
  segmentConstruction,
  triangleConstruction,
} from "@euclid-forge/core";
import { appCommandDisabledReason, appCommandForKey } from "./commands";
import { hoverIntent, pointerDownIntent } from "./pointerIntent";
import { appState } from "./appState";
import type { GeometryNode } from "@euclid-forge/core";
import type { AppState } from "./appState";
import {
  activeToolIsReadyToCommit,
  appendActiveToolInput,
  resetActiveToolInputs,
} from "./activeTool";
import type { ActiveTool } from "./activeTool";

import {
  clearSelection,
  setHoveredNode,
  toggleSelectedNode,
} from "./viewState";
import {
  initialFreePointPositions,
  translatedFreePointPositions,
} from "./freePointDrag";

export type PointerCaptureEffect = Readonly<
  | {
      kind: "SET_POINTER_CAPTURE";
      pointerId: number;
    }
  | {
      kind: "RELEASE_POINTER_CAPTURE";
      pointerId: number;
    }
>;

export type StatusEffect = Readonly<{
  kind: "SHOW_STATUS";
  message: string;
}>;

export type AppEffect = PointerCaptureEffect | StatusEffect;

export type AppTransitionHistoryPolicy = "commit" | "ignore";

export type AppTransition = Readonly<{
  state: AppState;
  shouldRender: boolean;
  shouldPreventDefault: boolean;
  history: AppTransitionHistoryPolicy;
  effects: readonly AppEffect[];
}>;

type AppTransitionInit = Omit<AppTransition, "history" | "effects"> &
  Readonly<{
    history?: AppTransitionHistoryPolicy;
    effects?: readonly AppEffect[];
  }>;

export type KeyInput = Readonly<{
  key: string;
  shiftKey?: boolean;
}>;

export type PointerInput = Readonly<{
  pointerId: number;
  point: ScreenPoint;
  viewport: Viewport;
  shiftKey: boolean;
}>;

export function handleKeyDown(state: AppState, input: KeyInput): AppTransition {
  const command = appCommandForKey(input.key, {
    shiftKey: input.shiftKey ?? false,
  });

  if (!command) {
    return unchanged(state);
  }

  const disabledReason = appCommandDisabledReason(command, state);

  if (disabledReason !== null) {
    return disabledReason
      ? changed(state, "ignore", disabledReason)
      : unchanged(state);
  }

  const result = command.run(state);

  return changed(result.state, result.history, result.statusMessage);
}

export function handlePointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const viewState = setHoveredNode(state.viewState, null);

  if (state.activeTool.kind !== "select") {
    return handleActiveToolPointerDown(
      appState(state.graph, viewState, state.dragState, state.activeTool),
      input,
    );
  }
  const intent = pointerDownIntent(
    appState(state.graph, viewState, state.dragState, state.activeTool),
    input,
  );

  switch (intent.kind) {
    case "SELECT_NODE":
      return changed(
        appState(state.graph, toggleSelectedNode(viewState, intent.id), null),
        "commit",
      );

    case "DRAG_FREE_POINT":
      return transition({
        state: appState(state.graph, viewState, {
          kind: "FREE_POINT",
          nodeId: intent.id,
        }),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });

    case "DRAG_BODY":
      return transition({
        state: appState(state.graph, viewState, {
          kind: "BODY",
          nodeId: intent.id,
          sourcePointIds: intent.sourcePointIds,
          initialPointerWorld: screenToWorld(input.viewport, input.point),
          initialSourcePointPositions: initialFreePointPositions(
            state.graph,
            intent.sourcePointIds,
            "body drag",
          ),
        }),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });

    case "ADD_FREE_POINT":
      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_FREE_POINT",
            point: intent.point,
          }),
          clearSelection(viewState),
          null,
          state.activeTool,
        ),
        "commit",
      );

    case "NONE":
      return preventOnly(
        appState(state.graph, viewState, null, state.activeTool),
      );
  }
}

export function handlePointerMove(
  state: AppState,
  input: PointerInput,
): AppTransition {
  if (!state.dragState) {
    const hoveredNodeId = hitTestHoverTarget(state, input);
    const viewState = setHoveredNode(state.viewState, hoveredNodeId);

    if (viewState === state.viewState) {
      return unchanged(state);
    }

    return changed(appState(state.graph, viewState, null, state.activeTool));
  }

  const world = screenToWorld(input.viewport, input.point);
  const viewState = setHoveredNode(state.viewState, null);

  switch (state.dragState.kind) {
    case "FREE_POINT":
      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "MOVE_FREE_POINT",
            id: state.dragState.nodeId,
            point: world,
          }),
          viewState,
          state.dragState,
        ),
      );

    case "BODY": {
      const delta = deltaBetween(state.dragState.initialPointerWorld, world);

      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_FREE_POINT_POSITIONS",
            positions: translatedFreePointPositions(
              state.dragState.initialSourcePointPositions,
              delta,
            ),
          }),
          viewState,
          state.dragState,
        ),
      );
    }
  }
}

export function handlePointerLeave(state: AppState): AppTransition {
  const viewState = setHoveredNode(state.viewState, null);

  if (viewState === state.viewState) {
    return unchanged(state);
  }

  return changed(
    appState(state.graph, viewState, state.dragState, state.activeTool),
  );
}

export function handlePointerUp(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (!state.dragState) {
    return unchanged(state);
  }

  return transition({
    state: appState(state.graph, state.viewState, null, state.activeTool),
    shouldRender: false,
    shouldPreventDefault: true,
    history: "commit",
    effects: [
      {
        kind: "RELEASE_POINTER_CAPTURE",
        pointerId,
      },
    ],
  });
}

export function handlePointerCancel(
  state: AppState,
  pointerId: number,
): AppTransition {
  return handlePointerUp(state, pointerId);
}

function handleActiveToolPointerDown(
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

  if (!hit) {
    return changed(state, "ignore", "Choose an existing point for this tool.");
  }

  const node = state.graph.byId.get(hit);

  if (!node || !isConstructiblePointNode(node)) {
    return changed(state, "ignore", "Choose a point for this tool.");
  }

  const activeTool = appendActiveToolInput(state.activeTool, hit);

  if (!activeToolIsReadyToCommit(activeTool)) {
    return changed(
      appState(state.graph, state.viewState, null, activeTool),
      "ignore",
    );
  }

  const nodes = constructionNodesForPointTool(state, activeTool);

  return changed(
    appState(
      applyGraphEdit(state.graph, {
        kind: "ADD_NODES",
        nodes,
      }),
      clearSelection(state.viewState),
      null,
      resetActiveToolInputs(activeTool),
    ),
    "commit",
  );
}

function constructionNodesForPointTool(
  state: AppState,
  activeTool: ActiveTool,
): readonly GeometryNode[] {
  if (!("inputs" in activeTool)) {
    return [];
  }

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
    case "intersection":
      return [];
  }

  return [];
}

function requiredInputs(
  activeTool: Extract<ActiveTool, { inputs: readonly NodeId[] }>,
  count: 2,
): readonly [NodeId, NodeId];
function requiredInputs(
  activeTool: Extract<ActiveTool, { inputs: readonly NodeId[] }>,
  count: 3,
): readonly [NodeId, NodeId, NodeId];
function requiredInputs(
  activeTool: Extract<ActiveTool, { inputs: readonly NodeId[] }>,
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

function hitTestHoverTarget(
  state: AppState,
  input: PointerInput,
): NodeId | null {
  const intent = hoverIntent(state, input);

  switch (intent.kind) {
    case "HOVER_NODE":
      return intent.id;

    case "NONE":
      return null;
  }
}

function unchanged(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: false,
  });
}

function preventOnly(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: true,
  });
}

function changed(
  state: AppState,
  history: AppTransitionHistoryPolicy = "ignore",
  statusMessage?: string,
): AppTransition {
  const effects: readonly AppEffect[] | undefined = statusMessage
    ? [
        {
          kind: "SHOW_STATUS",
          message: statusMessage,
        },
      ]
    : undefined;

  return transition({
    state,
    shouldRender: true,
    shouldPreventDefault: true,
    history,
    ...(effects ? { effects } : {}),
  });
}

function transition(value: AppTransitionInit): AppTransition {
  return Object.freeze({
    history: "ignore",
    ...value,
    effects: Object.freeze([...(value.effects ?? [])]),
  });
}
