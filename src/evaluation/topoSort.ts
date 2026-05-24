import { dependenciesOf } from "../representation/dependencies";
import type { GeometryNode, NodeId } from "../representation/node";

export function topoSort(nodes: readonly GeometryNode[]): readonly GeometryNode[] {
  const byId = new Map<NodeId, GeometryNode>();
  const indegree = new Map<NodeId, number>();
  const dependents = new Map<NodeId, NodeId[]>();

  for (const node of nodes) {
    if (byId.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`);
    }

    byId.set(node.id, node);
    indegree.set(node.id, 0);
    dependents.set(node.id, []);
  }

  for (const node of nodes) {
    const dependencies = dependenciesOf(node);

    indegree.set(node.id, dependencies.length);

    for (const dependency of dependencies) {
      if (!byId.has(dependency)) {
        throw new Error(`Missing dependency: ${node.id} depends on ${dependency}`);
      }

      const dependencyDependents = dependents.get(dependency);

      if (!dependencyDependents) {
        throw new Error(`Internal dependency map error for node: ${dependency}`);
      }

      dependencyDependents.push(node.id);
    }
  }

  const queue: NodeId[] = [];

  for (const node of nodes) {
    if (indegree.get(node.id) === 0) {
      queue.push(node.id);
    }
  }

  const ordered: GeometryNode[] = [];

  while (queue.length > 0) {
    const id = queue.shift();

    if (!id) {
      throw new Error("Internal topological sort queue error");
    }

    const node = byId.get(id);

    if (!node) {
      throw new Error(`Internal topological sort node error: ${id}`);
    }

    ordered.push(node);

    const nodeDependents = dependents.get(id);

    if (!nodeDependents) {
      throw new Error(`Internal dependents lookup error: ${id}`);
    }

    for (const dependent of nodeDependents) {
      const previousIndegree = indegree.get(dependent);

      if (previousIndegree === undefined) {
        throw new Error(`Internal indegree lookup error: ${dependent}`);
      }

      const nextIndegree = previousIndegree - 1;
      indegree.set(dependent, nextIndegree);

      if (nextIndegree === 0) {
        queue.push(dependent);
      }
    }
  }

  if (ordered.length !== nodes.length) {
    throw new Error("Cycle detected in scene graph");
  }

  return Object.freeze(ordered);
}
