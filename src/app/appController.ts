import { evaluateGraph } from "../evaluation/evaluateGraph";
import { visibleEvaluatedScene } from "../evaluation/visibleScene";
import {
  hitTestFreePoint,
  hitTestPoint,
  hitTestSegmentSelection,
  hitTestTriangleInterior,
  hitTestTriangleSelection,
} from "../interaction/hitTest";
import { deltaBetween, vec2 } from "../meaning/vec2";
import { applyGraphEdit } from "../representation/edit";
import type { NodeId } from "../representation/node";
import type { ScreenPoint, Viewport } from "../rendering/viewport";
import { screenToWorld } from "../rendering/viewport";
import { appCommandForKey } from "./commands";
import { appState } from "./appState";
import {
  effectiveHiddenNodeIds,
} from "./effectiveVisibility";
import type { AppState } from "./appState";
import {
  clearSelection,
  setHoveredNode,
  toggleSelectedNode,
} from "./viewState";

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

export type AppTransitionHistoryPolicy = "commit" | "ignore";

export type AppTransition = Readonly<{
  state: AppState;
  shouldRender: boolean;
  shouldPreventDefault: boolean;
  history: AppTransitionHistoryPolicy;
  pointerCapture?: PointerCaptureEffect;
}>;

type AppTransitionInit = Omit<AppTransition, "history"> &
  Readonly<{
    history?: AppTransitionHistoryPolicy;
  }>;

export type KeyInput = Readonly<{
  key: string;
}>;

export type PointerInput = Readonly<{
  pointerId: number;
  point: ScreenPoint;
  viewport: Viewport;
  shiftKey: boolean;
}>;

export function handleKeyDown(
  state: AppState,
  input: KeyInput,
): AppTransition {
  const command = appCommandForKey(input.key);

  if (!command) {
    return unchanged(state);
  }

  const result = command.run(state);

  if (!result) {
    return unchanged(state);
  }

  return changed(result.state, result.history);
}

export function handlePointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const viewState = setHoveredNode(state.viewState, null);
  const evaluated = visibleEvaluatedSceneForState(
    appState(state.graph, viewState, state.dragState),
  );

  if (input.shiftKey) {
    const pointSelectionHit = hitTestPoint(
      evaluated,
      input.viewport,
      input.point,
    );

    if (pointSelectionHit) {
      return changed(
        appState(
          state.graph,
          toggleSelectedNode(viewState, pointSelectionHit),
          null,
        ),
        "commit",
      );
    }

    const segmentSelectionHit = hitTestSegmentSelection(
      evaluated,
      input.viewport,
      input.point,
    );

    if (segmentSelectionHit) {
      return changed(
        appState(
          state.graph,
          toggleSelectedNode(viewState, segmentSelectionHit),
          null,
        ),
        "commit",
      );
    }

    const triangleSelectionHit = hitTestTriangleSelection(
      evaluated,
      input.viewport,
      input.point,
    );

    if (triangleSelectionHit) {
      return changed(
        appState(
          state.graph,
          toggleSelectedNode(viewState, triangleSelectionHit.id),
          null,
        ),
        "commit",
      );
    }

    return preventOnly(appState(state.graph, viewState, null));
  }

  const pointHit = hitTestFreePoint(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (pointHit) {
    return transition({
      state: appState(state.graph, viewState, {
        kind: "FREE_POINT",
        nodeId: pointHit,
      }),
      shouldRender: false,
      shouldPreventDefault: true,
      pointerCapture: {
        kind: "SET_POINTER_CAPTURE",
        pointerId: input.pointerId,
      },
    });
  }

  const triangleHit = hitTestTriangleInterior(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (triangleHit) {
    return transition({
      state: appState(state.graph, viewState, {
        kind: "TRIANGLE",
        vertexIds: triangleHit.vertexIds,
        initialPointerWorld: screenToWorld(input.viewport, input.point),
        initialVertexPositions: initialVertexPositions(
          state.graph,
          triangleHit.vertexIds,
        ),
      }),
      shouldRender: false,
      shouldPreventDefault: true,
      pointerCapture: {
        kind: "SET_POINTER_CAPTURE",
        pointerId: input.pointerId,
      },
    });
  }

  return changed(
    appState(
      applyGraphEdit(state.graph, {
        kind: "ADD_FREE_POINT",
        point: screenToWorld(input.viewport, input.point),
      }),
      clearSelection(viewState),
      null,
    ),
    "commit",
  );
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

    return changed(appState(state.graph, viewState, null));
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

    case "TRIANGLE": {
      const delta = deltaBetween(state.dragState.initialPointerWorld, world);

      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_FREE_POINT_POSITIONS",
            positions: translatedVertexPositions(
              state.dragState.initialVertexPositions,
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

  return changed(appState(state.graph, viewState, state.dragState));
}

export function handlePointerUp(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (!state.dragState) {
    return unchanged(state);
  }

  return transition({
    state: appState(state.graph, state.viewState, null),
    shouldRender: false,
    shouldPreventDefault: true,
    history: "commit",
    pointerCapture: {
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId,
    },
  });
}

export function handlePointerCancel(
  state: AppState,
  pointerId: number,
): AppTransition {
  return handlePointerUp(state, pointerId);
}




function visibleEvaluatedSceneForState(state: AppState) {
  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);

  return visibleEvaluatedScene(
    evaluateGraph(state.graph),
    hiddenNodeIds.size > 0
      ? {
          hiddenNodeIds,
        }
      : {},
  );
}

function hitTestHoverTarget(
  state: AppState,
  input: PointerInput,
): NodeId | null {
  const evaluated = visibleEvaluatedSceneForState(state);

  if (input.shiftKey) {
    const pointHit = hitTestPoint(evaluated, input.viewport, input.point);

    if (pointHit) {
      return pointHit;
    }

    const segmentHit = hitTestSegmentSelection(
      evaluated,
      input.viewport,
      input.point,
    );

    if (segmentHit) {
      return segmentHit;
    }

    const triangleHit = hitTestTriangleSelection(
      evaluated,
      input.viewport,
      input.point,
    );

    return triangleHit?.id ?? null;
  }

  const freePointHit = hitTestFreePoint(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (freePointHit) {
    return freePointHit;
  }

  const triangleHit = hitTestTriangleInterior(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  return triangleHit?.id ?? null;
}

function initialVertexPositions(
  graph: AppState["graph"],
  vertexIds: readonly NodeId[],
): ReadonlyMap<NodeId, ReturnType<typeof vec2>> {
  const positions = new Map<NodeId, ReturnType<typeof vec2>>();

  for (const id of vertexIds) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot start triangle drag with missing vertex: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(
        `Cannot start triangle drag with constrained vertex: ${id}`,
      );
    }

    positions.set(id, vec2(node.x, node.y));
  }

  return positions;
}

function translatedVertexPositions(
  initialPositions: ReadonlyMap<NodeId, ReturnType<typeof vec2>>,
  delta: ReturnType<typeof vec2>,
): ReadonlyMap<NodeId, ReturnType<typeof vec2>> {
  const positions = new Map<NodeId, ReturnType<typeof vec2>>();

  for (const [id, point] of initialPositions) {
    positions.set(id, vec2(point.x + delta.x, point.y + delta.y));
  }

  return positions;
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
): AppTransition {
  return transition({
    state,
    shouldRender: true,
    shouldPreventDefault: true,
    history,
  });
}

function transition(value: AppTransitionInit): AppTransition {
  return Object.freeze({
    history: "ignore",
    ...value,
  });
}
