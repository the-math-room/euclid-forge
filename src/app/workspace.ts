import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import type { GeometryNode, NodeId } from "../representation/node";
import { vec2 } from "../meaning/vec2";
import type { Vec2 } from "../meaning/vec2";
import { appState } from "./appState";
import type { AppState } from "./appState";
import type { ViewState } from "./viewState";

export type SerializedWorkspace = Readonly<{
  version: 1;
  nodes: readonly GeometryNode[];
  view: SerializedWorkspaceView;
}>;

export type SerializedWorkspaceView = Readonly<{
  selectedNodeIds: readonly NodeId[];
  hiddenNodeIds: readonly NodeId[];
  viewportCenter: Vec2;
  viewportZoom: number;
  viewportRotation: number;
}>;

export function serializeWorkspace(state: AppState): SerializedWorkspace {
  return Object.freeze({
    version: 1,
    nodes: Object.freeze([...state.graph.nodes]),
    view: serializeWorkspaceView(state.viewState),
  });
}

export function deserializeWorkspace(
  workspace: SerializedWorkspace,
): AppState {
  if (workspace.version !== 1) {
    throw new Error(`Unsupported workspace version: ${workspace.version}`);
  }

  const graph = createGraph(workspace.nodes);
  const viewState = deserializeWorkspaceView(workspace.view);

  return appState(graph, viewState, null);
}

function serializeWorkspaceView(
  viewState: ViewState,
): SerializedWorkspaceView {
  return Object.freeze({
    selectedNodeIds: Object.freeze([...viewState.selectedNodeIds]),
    hiddenNodeIds: Object.freeze([...viewState.hiddenNodeIds]),
    viewportCenter: viewState.viewportCenter,
    viewportZoom: viewState.viewportZoom,
    viewportRotation: viewState.viewportRotation,
  });
}

function deserializeWorkspaceView(
  view: SerializedWorkspaceView,
): ViewState {
  return Object.freeze({
    selectedNodeIds: new Set<NodeId>(view.selectedNodeIds),
    hiddenNodeIds: new Set<NodeId>(view.hiddenNodeIds),
    hoveredNodeId: null,
    viewportCenter: vec2(view.viewportCenter.x, view.viewportCenter.y),
    viewportZoom: view.viewportZoom,
    viewportRotation: view.viewportRotation,
  });
}

/**
 * Runtime guard for unknown parsed JSON.
 *
 * This is intentionally shallow and structural: graph validity is delegated to
 * createGraph, which remains the construction authority.
 */
export function parseSerializedWorkspace(value: unknown): SerializedWorkspace {
  if (!isRecord(value)) {
    throw new Error("Workspace must be an object");
  }

  if (value.version !== 1) {
    throw new Error(`Unsupported workspace version: ${String(value.version)}`);
  }

  if (!Array.isArray(value.nodes)) {
    throw new Error("Workspace nodes must be an array");
  }

  if (!isRecord(value.view)) {
    throw new Error("Workspace view must be an object");
  }

  const view = value.view;

  if (!Array.isArray(view.selectedNodeIds)) {
    throw new Error("Workspace selectedNodeIds must be an array");
  }

  if (!Array.isArray(view.hiddenNodeIds)) {
    throw new Error("Workspace hiddenNodeIds must be an array");
  }

  if (!isVec2Like(view.viewportCenter)) {
    throw new Error("Workspace viewportCenter must be a vector");
  }

  if (typeof view.viewportZoom !== "number") {
    throw new Error("Workspace viewportZoom must be a number");
  }

  if (typeof view.viewportRotation !== "number") {
    throw new Error("Workspace viewportRotation must be a number");
  }

  if (!view.selectedNodeIds.every((id) => typeof id === "string")) {
    throw new Error("Workspace selectedNodeIds must contain only strings");
  }

  if (!view.hiddenNodeIds.every((id) => typeof id === "string")) {
    throw new Error("Workspace hiddenNodeIds must contain only strings");
  }

  return Object.freeze({
    version: 1,
    nodes: Object.freeze(value.nodes as readonly GeometryNode[]),
    view: Object.freeze({
      selectedNodeIds: Object.freeze([...view.selectedNodeIds]),
      hiddenNodeIds: Object.freeze([...view.hiddenNodeIds]),
      viewportCenter: vec2(
        view.viewportCenter.x,
        view.viewportCenter.y,
      ),
      viewportZoom: view.viewportZoom,
      viewportRotation: view.viewportRotation,
    }),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isVec2Like(value: unknown): value is Vec2 {
  return (
    isRecord(value) &&
    typeof value.x === "number" &&
    typeof value.y === "number"
  );
}
