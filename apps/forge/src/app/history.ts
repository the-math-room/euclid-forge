import { appState } from "./appState";
import type { AppState } from "./appState";
import type { Graph } from "@euclid-forge/core/representation/graph";
import type { ViewState } from "./viewState";
import { setHoveredNode } from "./viewState";

export type AppStateSnapshot = Readonly<{
  graph: Graph;
  viewState: ViewState;
}>;

export type HistoryState = Readonly<{
  past: readonly AppStateSnapshot[];
  present: AppStateSnapshot;
  future: readonly AppStateSnapshot[];
}>;

export function initialHistory(state: AppState): HistoryState {
  return Object.freeze({
    past: Object.freeze([]),
    present: snapshotFromAppState(state),
    future: Object.freeze([]),
  });
}

export function commitHistory(
  history: HistoryState,
  state: AppState,
): HistoryState {
  const snapshot = snapshotFromAppState(state);

  if (snapshotsEqual(history.present, snapshot)) {
    return history;
  }

  return Object.freeze({
    past: Object.freeze([...history.past, history.present]),
    present: snapshot,
    future: Object.freeze([]),
  });
}

export function undoHistory(history: HistoryState): HistoryState {
  const previous = history.past.at(-1);

  if (!previous) {
    return history;
  }

  return Object.freeze({
    past: Object.freeze(history.past.slice(0, -1)),
    present: previous,
    future: Object.freeze([history.present, ...history.future]),
  });
}

export function redoHistory(history: HistoryState): HistoryState {
  const [next, ...rest] = history.future;

  if (!next) {
    return history;
  }

  return Object.freeze({
    past: Object.freeze([...history.past, history.present]),
    present: next,
    future: Object.freeze(rest),
  });
}

export function appStateFromHistory(
  history: HistoryState,
  dragState: AppState["dragState"] = null,
): AppState {
  return appState(history.present.graph, history.present.viewState, dragState);
}

export function snapshotFromAppState(state: AppState): AppStateSnapshot {
  return Object.freeze({
    graph: state.graph,
    viewState: setHoveredNode(state.viewState, null),
  });
}

function snapshotsEqual(
  a: AppStateSnapshot,
  b: AppStateSnapshot,
): boolean {
  return a.graph === b.graph && a.viewState === b.viewState;
}
