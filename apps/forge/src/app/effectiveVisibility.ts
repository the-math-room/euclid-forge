import type { Graph } from "@euclid-forge/core/representation/graph";
import type { NodeId } from "@euclid-forge/core/representation/node";
import { transitiveDependentsOf } from "@euclid-forge/core/representation/dependencies";
import type { ViewState } from "./viewState";

export function effectiveHiddenNodeIds(
  graph: Graph,
  viewState: ViewState,
): ReadonlySet<NodeId> {
  if (viewState.hiddenNodeIds.size === 0) {
    return viewState.hiddenNodeIds;
  }

  const hiddenNodeIds = new Set<NodeId>(viewState.hiddenNodeIds);

  for (const dependent of transitiveDependentsOf(
    graph,
    viewState.hiddenNodeIds,
  )) {
    hiddenNodeIds.add(dependent);
  }

  return hiddenNodeIds;
}

export function clearEffectivelyHiddenSelection(
  graph: Graph,
  viewState: ViewState,
): ViewState {
  if (viewState.selectedNodeIds.size === 0) {
    return viewState;
  }

  const hiddenNodeIds = effectiveHiddenNodeIds(graph, viewState);
  const selectedNodeIds = new Set<NodeId>();

  for (const id of viewState.selectedNodeIds) {
    if (!hiddenNodeIds.has(id)) {
      selectedNodeIds.add(id);
    }
  }

  if (selectedNodeIds.size === viewState.selectedNodeIds.size) {
    return viewState;
  }

  return Object.freeze({
    ...viewState,
    selectedNodeIds,
  });
}

