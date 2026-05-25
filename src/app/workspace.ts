import { appState, type AppState } from "./appState";
import {
  deserializeWorkspace as deserializeCoreWorkspace,
  type SerializedWorkspace,
} from "../core";

export function deserializeWorkspace(
  workspace: SerializedWorkspace,
): AppState {
  const state = deserializeCoreWorkspace(workspace);

  return appState(state.graph, state.viewState, null);
}
