import type { Graph } from "./graph";
import type { NodeId } from "./node";
import { dependenciesOf } from "./dependencies";

export function canDeleteNodes(
  graph: Graph,
  ids: Iterable<NodeId>,
): boolean {
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

  const blockedBy = new Map<NodeId, NodeId[]>();

  for (const node of graph.nodes) {
    if (idSet.has(node.id)) {
      continue;
    }

    for (const dependency of dependenciesOf(node)) {
      if (!idSet.has(dependency)) {
        continue;
      }

      const dependents = blockedBy.get(dependency) ?? [];
      dependents.push(node.id);
      blockedBy.set(dependency, dependents);
    }
  }

  if (blockedBy.size === 0) {
    return null;
  }

  const [source, dependents] = [...blockedBy][0] ?? [];

  if (!source || !dependents || dependents.length === 0) {
    return "Cannot delete nodes with unselected dependents.";
  }

  const sortedDependents = [...dependents].sort();
  const dependentList = sortedDependents.slice(0, 3).join(", ");
  const suffix = sortedDependents.length > 3 ? ", ..." : "";

  return `Cannot delete ${source}; ${dependentList}${suffix} depends on it. Select dependents too, or hide instead.`;
}
