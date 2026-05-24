import type { NodeId } from "../representation/node";

export type ViewState = Readonly<{
  selectedNodeIds: ReadonlySet<NodeId>;
  hiddenNodeIds: ReadonlySet<NodeId>;
}>;

export function emptyViewState(): ViewState {
  return Object.freeze({
    selectedNodeIds: new Set<NodeId>(),
    hiddenNodeIds: new Set<NodeId>(),
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
