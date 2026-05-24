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
import { appState } from "./appState";
import {
  clearEffectivelyHiddenSelection,
  effectiveHiddenNodeIds,
} from "./effectiveVisibility";
import type { AppState } from "./appState";
import {
  clearSelection,
  hideSelectedNodes,
  panViewport,
  resetViewport,
  setHoveredNode,
  toggleSelectedNode,
  unhideAllNodes,
  zoomViewport,
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

  if (key === "arrowleft") {
    return changed(
      appState(
        state.graph,
        panViewport(state.viewState, { x: -viewportPanStep(state), y: 0 }),
        state.dragState,
      ),
    );
  }

  if (key === "arrowright") {
    return changed(
      appState(
        state.graph,
        panViewport(state.viewState, { x: viewportPanStep(state), y: 0 }),
        state.dragState,
      ),
    );
  }

  if (key === "arrowup") {
    return changed(
      appState(
        state.graph,
        panViewport(state.viewState, { x: 0, y: viewportPanStep(state) }),
        state.dragState,
      ),
    );
  }

  if (key === "arrowdown") {
    return changed(
      appState(
        state.graph,
        panViewport(state.viewState, { x: 0, y: -viewportPanStep(state) }),
        state.dragState,
      ),
    );
  }

  if (key === "+" || key === "=") {
    return changed(
      appState(
        state.graph,
        zoomViewport(state.viewState, 1.25),
        state.dragState,
      ),
    );
  }

  if (key === "-" || key === "_") {
    return changed(
      appState(
        state.graph,
        zoomViewport(state.viewState, 0.8),
        state.dragState,
      ),
    );
  }

  if (key === "0") {
    return changed(
      appState(
        state.graph,
        resetViewport(state.viewState),
        state.dragState,
      ),
    );
  }

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

  if (key === "m") {
    const triangle = selectedTriangle(state);

    if (!triangle) {
      return unchanged(state);
    }

    return changed(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_MIDPOINTS",
          triangle,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }

  if (key === "h") {
    const viewState = clearEffectivelyHiddenSelection(
      state.graph,
      hideSelectedNodes(state.viewState),
    );

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
  const viewState = setHoveredNode(state.viewState, null);
  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, viewState);
  const evaluated = visibleEvaluatedScene(
    evaluateGraph(state.graph),
    hiddenNodeIds.size > 0
      ? {
          hiddenNodeIds,
        }
      : {},
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



function hitTestHoverTarget(
  state: AppState,
  input: PointerInput,
): NodeId | null {
  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);
  const evaluated = visibleEvaluatedScene(
    evaluateGraph(state.graph),
    hiddenNodeIds.size > 0
      ? {
          hiddenNodeIds,
        }
      : {},
  );

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

function viewportPanStep(state: AppState): number {
  return 40 / state.viewState.viewportZoom;
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
