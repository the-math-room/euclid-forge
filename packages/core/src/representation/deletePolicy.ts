import type { Graph } from "./graph";
import type { NodeId } from "./node";
import { transitiveDependentsOf } from "./dependencies";

export function canDeleteNodes(graph: Graph, ids: Iterable<NodeId>): boolean {
  return deleteNodesDisabledReason(graph, ids) === null;
}

export function deleteNodesDisabledReason(
  graph: Graph,
  ids: Iterable<NodeId>,
): string | null {
  const idSet = new Set(ids);

  if (idSet.size === 0) {
    return "Select one or more nodes to delete.";
  }

  for (const id of idSet) {
    if (!graph.byId.has(id)) {
      return `Cannot delete missing node: ${id}.`;
    }
  }

  return null;
}

export function cascadingDeleteIds(
  graph: Graph,
  ids: Iterable<NodeId>,
): ReadonlySet<NodeId> {
  const roots = new Set(ids);
  const cascade = new Set<NodeId>(roots);

  for (const dependent of transitiveDependentsOf(graph, roots)) {
    cascade.add(dependent);
  }

  return cascade;
}
