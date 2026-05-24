import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import { transitiveDependentsOf } from "../representation/dependencies";
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
