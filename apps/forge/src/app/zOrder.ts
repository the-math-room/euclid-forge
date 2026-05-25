import type { Graph } from "@euclid-forge/core/representation/graph";
import type { GeometryNode, NodeId } from "@euclid-forge/core/representation/node";

export type ZIndexUpdates = ReadonlyMap<NodeId, number>;

type OrderedNode = Readonly<{
  node: GeometryNode;
  originalIndex: number;
}>;

export function bringNodesForward(
  graph: Graph,
  ids: Iterable<NodeId>,
): ZIndexUpdates {
  const selected = new Set(ids);

  if (selected.size === 0) {
    return new Map();
  }

  const ordered = orderedNodes(graph);

  for (let index = ordered.length - 2; index >= 0; index -= 1) {
    const current = ordered[index];
    const next = ordered[index + 1];

    if (!current || !next) {
      continue;
    }

    if (selected.has(current.node.id) && !selected.has(next.node.id)) {
      ordered[index] = next;
      ordered[index + 1] = current;
    }
  }

  return zIndexUpdatesForOrder(graph, ordered);
}

export function sendNodesBackward(
  graph: Graph,
  ids: Iterable<NodeId>,
): ZIndexUpdates {
  const selected = new Set(ids);

  if (selected.size === 0) {
    return new Map();
  }

  const ordered = orderedNodes(graph);

  for (let index = 1; index < ordered.length; index += 1) {
    const current = ordered[index];
    const previous = ordered[index - 1];

    if (!current || !previous) {
      continue;
    }

    if (selected.has(current.node.id) && !selected.has(previous.node.id)) {
      ordered[index] = previous;
      ordered[index - 1] = current;
    }
  }

  return zIndexUpdatesForOrder(graph, ordered);
}

export function bringNodesToFront(
  graph: Graph,
  ids: Iterable<NodeId>,
): ZIndexUpdates {
  const selected = new Set(ids);

  if (selected.size === 0) {
    return new Map();
  }

  const ordered = orderedNodes(graph);
  const next = [
    ...ordered.filter((entry) => !selected.has(entry.node.id)),
    ...ordered.filter((entry) => selected.has(entry.node.id)),
  ];

  return zIndexUpdatesForOrder(graph, next);
}

export function sendNodesToBack(
  graph: Graph,
  ids: Iterable<NodeId>,
): ZIndexUpdates {
  const selected = new Set(ids);

  if (selected.size === 0) {
    return new Map();
  }

  const ordered = orderedNodes(graph);
  const next = [
    ...ordered.filter((entry) => selected.has(entry.node.id)),
    ...ordered.filter((entry) => !selected.has(entry.node.id)),
  ];

  return zIndexUpdatesForOrder(graph, next);
}

function orderedNodes(graph: Graph): OrderedNode[] {
  return graph.nodes
    .map((node, originalIndex) => ({ node, originalIndex }))
    .sort(
      (a, b) =>
        zIndexOf(a.node) - zIndexOf(b.node) ||
        a.originalIndex - b.originalIndex,
    );
}

function zIndexUpdatesForOrder(
  graph: Graph,
  ordered: readonly OrderedNode[],
): ZIndexUpdates {
  const updates = new Map<NodeId, number>();

  ordered.forEach((entry, zIndex) => {
    if (zIndexOf(entry.node) !== zIndex) {
      updates.set(entry.node.id, zIndex);
    }
  });

  // Keep the operation explicit even if all nodes already had normalized
  // z-index values. This gives the graph edit a stable, compact z-order basis.
  if (updates.size === 0) {
    return new Map(
      graph.nodes.map((node) => [node.id, zIndexOf(node)] as const),
    );
  }

  return updates;
}

function zIndexOf(node: GeometryNode): number {
  return node.zIndex ?? 0;
}
