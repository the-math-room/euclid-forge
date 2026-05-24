import type { Graph } from "./graph";
import type { GeometryNode, NodeId } from "./node";

export function dependenciesOf(node: GeometryNode): readonly NodeId[] {
  switch (node.kind) {
    case "FREE_POINT":
      return [];

    case "SEGMENT":
      return [node.a, node.b];

    case "TRIANGLE":
      return [node.a, node.b, node.c];

    case "MIDPOINT":
      return [node.segment];

    case "CENTROID":
      return [node.triangle];
  }
}

export function dependentsOf(graph: Graph, id: NodeId): readonly NodeId[] {
  const dependents: NodeId[] = [];

  for (const node of graph.nodes) {
    if (dependenciesOf(node).includes(id)) {
      dependents.push(node.id);
    }
  }

  return Object.freeze(dependents);
}

export function transitiveDependentsOf(
  graph: Graph,
  ids: Iterable<NodeId>,
): readonly NodeId[] {
  const roots = new Set(ids);
  const visited = new Set<NodeId>(roots);
  const dependents: NodeId[] = [];
  const queue = [...roots];

  let head = 0;

  while (head < queue.length) {
    const id = queue[head];

    if (!id) {
      throw new Error("Internal dependent traversal queue error");
    }

    head += 1;

    for (const dependent of dependentsOf(graph, id)) {
      if (visited.has(dependent)) {
        continue;
      }

      visited.add(dependent);
      dependents.push(dependent);
      queue.push(dependent);
    }
  }

  return Object.freeze(dependents);
}
