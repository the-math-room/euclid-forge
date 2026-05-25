import type { NodeId } from "../representation/node";
import type { AppState } from "./appState";

export function selectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 2) {
    return null;
  }

  const [center, through] = selected;

  if (!center || !through) {
    return null;
  }

  if (
    state.graph.byId.get(center)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(through)?.kind !== "FREE_POINT"
  ) {
    return null;
  }

  return [center, through];
}

export function requireSelectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  const points = selectedCirclePoints(state);

  if (!points) {
    throw new Error("Cannot run create-circle while disabled");
  }

  return points;
}

export function selectedFreePointVertices(
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

export function requireSelectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] {
  const vertices = selectedFreePointVertices(state);

  if (!vertices) {
    throw new Error("Cannot run create-triangle while disabled");
  }

  return vertices;
}

export function selectedTriangle(state: AppState): NodeId | null {
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

export function requireSelectedTriangle(state: AppState): NodeId {
  const triangle = selectedTriangle(state);

  if (!triangle) {
    throw new Error("Cannot run triangle command while disabled");
  }

  return triangle;
}
