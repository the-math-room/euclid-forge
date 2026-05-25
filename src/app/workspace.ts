import { appState, type AppState } from "./appState";
import type {
  GeometryWorkspace,
  SerializedWorkspace,
  WorkspaceState,
} from "../core/workspace";
import {
  deserializeWorkspace as deserializeCoreWorkspace,
  geometryWorkspaceFromJsonText,
  parseGeometryWorkspace,
  parseSerializedWorkspace,
  serializeWorkspace,
} from "../core/workspace";

export {
  geometryWorkspaceFromJsonText,
  parseGeometryWorkspace,
  parseSerializedWorkspace,
  serializeWorkspace,
  type GeometryWorkspace,
  type SerializedWorkspace,
  type WorkspaceState,
};

export function deserializeWorkspace(
  workspace: SerializedWorkspace,
): AppState {
  const state = deserializeCoreWorkspace(workspace);

  return appState(state.graph, state.viewState, null);
}
