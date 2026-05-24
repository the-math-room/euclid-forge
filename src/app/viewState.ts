import { vec2 } from "../meaning/vec2";
import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";

const DEFAULT_VIEWPORT_CENTER = vec2(0, 0);
const DEFAULT_VIEWPORT_ZOOM = 80;
const VIEWPORT_MIN_ZOOM = 10;
const VIEWPORT_MAX_ZOOM = 640;

export type ViewState = Readonly<{
  selectedNodeIds: ReadonlySet<NodeId>;
  hiddenNodeIds: ReadonlySet<NodeId>;
  hoveredNodeId: NodeId | null;
  viewportCenter: Vec2;
  viewportZoom: number;
}>;

export function emptyViewState(): ViewState {
  return Object.freeze({
    selectedNodeIds: new Set<NodeId>(),
    hiddenNodeIds: new Set<NodeId>(),
    hoveredNodeId: null,
    viewportCenter: DEFAULT_VIEWPORT_CENTER,
    viewportZoom: DEFAULT_VIEWPORT_ZOOM,
  });
}

export function clearSelection(viewState: ViewState): ViewState {
  if (viewState.selectedNodeIds.size === 0) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    selectedNodeIds: new Set<NodeId>(),
  });
}

export function toggleSelectedNode(
  viewState: ViewState,
  id: NodeId,
): ViewState {
  const selectedNodeIds = new Set(viewState.selectedNodeIds);

  if (selectedNodeIds.has(id)) {
    selectedNodeIds.delete(id);
  } else {
    selectedNodeIds.add(id);
  }

  return Object.freeze({
    ...viewState,
    selectedNodeIds,
  });
}

export function hideSelectedNodes(viewState: ViewState): ViewState {
  if (viewState.selectedNodeIds.size === 0) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    selectedNodeIds: new Set<NodeId>(),
    hiddenNodeIds: new Set([
      ...viewState.hiddenNodeIds,
      ...viewState.selectedNodeIds,
    ]),
  });
}

export function unhideAllNodes(viewState: ViewState): ViewState {
  if (viewState.hiddenNodeIds.size === 0) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    hiddenNodeIds: new Set<NodeId>(),
  });
}

export function setViewportCenter(
  viewState: ViewState,
  viewportCenter: Vec2,
): ViewState {
  if (
    viewState.viewportCenter.x === viewportCenter.x &&
    viewState.viewportCenter.y === viewportCenter.y
  ) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    viewportCenter,
  });
}

export function setViewportZoom(
  viewState: ViewState,
  viewportZoom: number,
): ViewState {
  if (viewState.viewportZoom === viewportZoom) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    viewportZoom,
  });
}

export function panViewport(
  viewState: ViewState,
  deltaWorld: Vec2,
): ViewState {
  if (deltaWorld.x === 0 && deltaWorld.y === 0) {
    return viewState;
  }

  return setViewportCenter(
    viewState,
    vec2(
      viewState.viewportCenter.x + deltaWorld.x,
      viewState.viewportCenter.y + deltaWorld.y,
    ),
  );
}

export function zoomViewport(
  viewState: ViewState,
  factor: number,
): ViewState {
  if (factor <= 0) {
    throw new Error(`Viewport zoom factor must be positive: ${factor}`);
  }

  return setViewportZoom(
    viewState,
    clampZoom(viewState.viewportZoom * factor),
  );
}

export function resetViewport(viewState: ViewState): ViewState {
  const withCenter = setViewportCenter(viewState, DEFAULT_VIEWPORT_CENTER);

  return setViewportZoom(withCenter, DEFAULT_VIEWPORT_ZOOM);
}

function clampZoom(zoom: number): number {
  return Math.max(VIEWPORT_MIN_ZOOM, Math.min(VIEWPORT_MAX_ZOOM, zoom));
}

export function setHoveredNode(
  viewState: ViewState,
  hoveredNodeId: NodeId | null,
): ViewState {
  if (viewState.hoveredNodeId === hoveredNodeId) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    hoveredNodeId,
  });
}

