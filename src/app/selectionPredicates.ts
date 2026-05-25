import type { NodeId } from "../representation/node";
import type { AppState } from "./appState";

export function selectedFreePointTuple<const N extends number>(
  state: AppState,
  count: N,
): TupleOf<NodeId, N> | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== count) {
    return null;
  }

  for (const id of selected) {
    if (state.graph.byId.get(id)?.kind !== "FREE_POINT") {
      return null;
    }
  }

  return selected as TupleOf<NodeId, N>;
}

export function requireSelectedFreePointTuple<const N extends number>(
  state: AppState,
  count: N,
  message: string,
): TupleOf<NodeId, N> {
  const tuple = selectedFreePointTuple(state, count);

  if (!tuple) {
    throw new Error(message);
  }

  return tuple;
}

export function selectedSegmentEndpoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  return selectedFreePointTuple(state, 2);
}

export function requireSelectedSegmentEndpoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  return requireSelectedFreePointTuple(
    state,
    2,
    "Cannot run create-segment while disabled",
  );
}

export function selectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  return selectedFreePointTuple(state, 2);
}

export function requireSelectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  return requireSelectedFreePointTuple(
    state,
    2,
    "Cannot run create-circle while disabled",
  );
}

export function selectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] | null {
  return selectedFreePointTuple(state, 3);
}

export function requireSelectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] {
  return requireSelectedFreePointTuple(
    state,
    3,
    "Cannot run create-triangle while disabled",
  );
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
