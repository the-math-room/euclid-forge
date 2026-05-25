import type { Graph } from "@euclid-forge/core";
import { emptyActiveTool } from "./activeTool";
import type { ActiveTool } from "./activeTool";
import type { DragState } from "./dragState";
import { initialScene } from "./initialScene";
import { emptyViewState } from "./viewState";
import type { ViewState } from "./viewState";

export type AppState = Readonly<{
  graph: Graph;
  viewState: ViewState;
  dragState: DragState | null;
  activeTool: ActiveTool;
}>;

export function initialAppState(): AppState {
  return appState(initialScene(), emptyViewState(), null);
}

export function appState(
  graph: Graph,
  viewState: ViewState,
  dragState: DragState | null,
  activeTool: ActiveTool = emptyActiveTool(),
): AppState {
  return Object.freeze({
    graph,
    viewState,
    dragState,
    activeTool,
  });
}
