import { evaluateGraph } from "../evaluation/evaluateGraph";
import {
  hitTestFreePoint,
  hitTestPoint,
  hitTestTriangleInterior,
  hitTestTriangleSelection,
} from "../interaction/hitTest";
import { deltaBetween } from "../meaning/vec2";
import { applyGraphEdit } from "../representation/edit";
import type { NodeId } from "../representation/node";
import type { ScreenPoint, Viewport } from "../rendering/viewport";
import { screenToWorld } from "../rendering/viewport";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  clearSelection,
  hideSelectedNodes,
  toggleSelectedNode,
  unhideAllNodes,
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

export type AppTransition = Readonly<{
  state: AppState;
  shouldRender: boolean;
  shouldPreventDefault: boolean;
  pointerCapture?: PointerCaptureEffect;
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
  const key = input.key.toLowerCase();

  if (key === "t") {
    const vertices = selectedFreePointVertices(state);

    if (!vertices) {
      return unchanged(state);
    }

    return changed(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_TRIANGLE",
          vertices,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }

  if (key === "g") {
    const triangle = selectedTriangle(state);

    if (!triangle) {
      return unchanged(state);
    }

    return changed(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_CENTROID",
          triangle,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }

  if (key === "h") {
    const viewState = hideSelectedNodes(state.viewState);

    if (viewState === state.viewState) {
      return unchanged(state);
    }

    return changed(appState(state.graph, viewState, state.dragState));
  }

  if (key === "u") {
    const viewState = unhideAllNodes(state.viewState);

    if (viewState === state.viewState) {
      return unchanged(state);
    }

    return changed(appState(state.graph, viewState, state.dragState));
  }

  return unchanged(state);
}

export function handlePointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const evaluated = evaluateGraph(state.graph);

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
          toggleSelectedNode(state.viewState, pointSelectionHit),
          null,
        ),
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
          toggleSelectedNode(state.viewState, triangleSelectionHit.id),
          null,
        ),
      );
    }

    return preventOnly(appState(state.graph, state.viewState, null));
  }

  const pointHit = hitTestFreePoint(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (pointHit) {
    return transition({
      state: appState(state.graph, state.viewState, {
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
      state: appState(state.graph, state.viewState, {
        kind: "TRIANGLE",
        vertexIds: triangleHit.vertexIds,
        previousWorldPoint: screenToWorld(input.viewport, input.point),
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
      clearSelection(state.viewState),
      null,
    ),
  );
}

export function handlePointerMove(
  state: AppState,
  input: PointerInput,
): AppTransition {
  if (!state.dragState) {
    return unchanged(state);
  }

  const world = screenToWorld(input.viewport, input.point);

  switch (state.dragState.kind) {
    case "FREE_POINT":
      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "MOVE_FREE_POINT",
            id: state.dragState.nodeId,
            point: world,
          }),
          state.viewState,
          state.dragState,
        ),
      );

    case "TRIANGLE": {
      const delta = deltaBetween(state.dragState.previousWorldPoint, world);

      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "TRANSLATE_FREE_POINTS",
            ids: state.dragState.vertexIds,
            delta,
          }),
          state.viewState,
          {
            ...state.dragState,
            previousWorldPoint: world,
          },
        ),
      );
    }
  }
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

function selectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 3) {
    return null;
  }

  const [a, b, c] = selected;

  if (!a || !b || !c) {
    return null;
  }

  if (
    state.graph.byId.get(a)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(b)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(c)?.kind !== "FREE_POINT"
  ) {
    return null;
  }

  return [a, b, c];
}

function selectedTriangle(state: AppState): NodeId | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 1) {
    return null;
  }

  const [triangle] = selected;

  if (!triangle || state.graph.byId.get(triangle)?.kind !== "TRIANGLE") {
    return null;
  }

  return triangle;
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

function changed(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: true,
    shouldPreventDefault: true,
  });
}

function transition(value: AppTransition): AppTransition {
  return Object.freeze(value);
}
