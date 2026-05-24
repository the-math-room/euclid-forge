import type { Graph } from "../representation/graph";
import type { DragState } from "./dragState";
import { initialScene } from "./initialScene";
import { emptyViewState } from "./viewState";
import type { ViewState } from "./viewState";

export type AppState = Readonly<{
  graph: Graph;
  viewState: ViewState;
  dragState: DragState | null;
}>;

export function initialAppState(): AppState {
  return appState(initialScene(), emptyViewState(), null);
}

export function appState(
  graph: Graph,
  viewState: ViewState,
  dragState: DragState | null,
): AppState {
  return Object.freeze({
    graph,
    viewState,
    dragState,
  });
}
