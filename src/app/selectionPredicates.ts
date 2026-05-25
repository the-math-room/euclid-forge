import type { NodeId } from "../representation/node";
import { isConstructiblePointNode } from "../representation/pointNode";
import type { AppState } from "./appState";

export function selectedConstructiblePointTuple<const N extends number>(
  state: AppState,
  count: N,
): TupleOf<NodeId, N> | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== count) {
    return null;
  }

  for (const id of selected) {
    const node = state.graph.byId.get(id);

    if (!node || !isConstructiblePointNode(node)) {
      return null;
    }
  }

  return selected as TupleOf<NodeId, N>;
}

export function requireSelectedConstructiblePointTuple<const N extends number>(
  state: AppState,
  count: N,
  message: string,
): TupleOf<NodeId, N> {
  const tuple = selectedConstructiblePointTuple(state, count);

  if (!tuple) {
    throw new Error(message);
  }

  return tuple;
}

export function selectedSegmentEndpoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  return selectedConstructiblePointTuple(state, 2);
}

export function requireSelectedSegmentEndpoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  return requireSelectedConstructiblePointTuple(
    state,
    2,
    "Cannot run create-segment while disabled",
  );
}

export function selectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  return selectedConstructiblePointTuple(state, 2);
}

export function requireSelectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  return requireSelectedConstructiblePointTuple(
    state,
    2,
    "Cannot run create-circle while disabled",
  );
}

export function selectedTriangleVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] | null {
  return selectedConstructiblePointTuple(state, 3);
}

export function requireSelectedTriangleVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] {
  return requireSelectedConstructiblePointTuple(
    state,
    3,
    "Cannot run create-triangle while disabled",
  );
}

// Backward-compatible aliases for existing command/test code. These are now
// construction-input predicates, not editability predicates.
export const selectedFreePointTuple = selectedConstructiblePointTuple;
export const requireSelectedFreePointTuple = requireSelectedConstructiblePointTuple;
export const selectedFreePointVertices = selectedTriangleVertices;
export const requireSelectedFreePointVertices = requireSelectedTriangleVertices;

export function selectedSegmentTuple<const N extends number>(
  state: AppState,
  count: N,
): TupleOf<NodeId, N> | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== count) {
    return null;
  }

  for (const id of selected) {
    if (state.graph.byId.get(id)?.kind !== "SEGMENT") {
      return null;
    }
  }

  return selected as TupleOf<NodeId, N>;
}

export function requireSelectedSegmentTuple<const N extends number>(
  state: AppState,
  count: N,
  message: string,
): TupleOf<NodeId, N> {
  const tuple = selectedSegmentTuple(state, count);

  if (!tuple) {
    throw new Error(message);
  }

  return tuple;
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

type TupleOf<T, N extends number, R extends readonly T[] = readonly []> =
  R["length"] extends N ? R : TupleOf<T, N, readonly [...R, T]>;
