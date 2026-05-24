import { dependenciesForGeometryNode } from "../geometry/geometryRegistry";
import type { Graph } from "./graph";
import type { GeometryNode, NodeId } from "./node";

export function dependenciesOf(node: GeometryNode): readonly NodeId[] {
  return dependenciesForGeometryNode(node);
}

export function dependentsOf(graph: Graph, id: NodeId): readonly NodeId[] {
  return graph.nodes
    .filter((node) => dependenciesOf(node).includes(id))
    .map((node) => node.id);
}

export function transitiveDependentsOf(
  graph: Graph,
  ids: Iterable<NodeId>,
): ReadonlySet<NodeId> {
  const roots = new Set(ids);
  const dependents = new Set<NodeId>();
  const queue = [...roots];

  while (queue.length > 0) {
    const id = queue.shift();

    if (!id) {
      continue;
    }

    for (const dependent of dependentsOf(graph, id)) {
      if (roots.has(dependent) || dependents.has(dependent)) {
        continue;
      }

      dependents.add(dependent);
      queue.push(dependent);
    }
  }

  return dependents;
}
