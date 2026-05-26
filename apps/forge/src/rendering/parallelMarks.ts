import type { GeometryNode, Graph, NodeId } from "@euclid-forge/core";

export type ParallelMarkCount = 1 | 2 | 3;
export type ParallelMarkCounts = ReadonlyMap<NodeId, ParallelMarkCount>;

export type ParallelMarkInput = Readonly<{
  graph: Graph;
  hiddenNodeIds?: ReadonlySet<NodeId>;
}>;

export function parallelMarkCountsForGraph({
  graph,
  hiddenNodeIds,
}: ParallelMarkInput): ParallelMarkCounts {
  const linearIds = graph.nodes
    .filter((node) => isVisibleLinearNode(node, hiddenNodeIds))
    .map((node) => node.id);

  if (linearIds.length === 0) {
    return new Map();
  }

  const unionFind = new UnionFind(linearIds);

  for (const node of graph.nodes) {
    if (
      node.kind !== "LINEAR_CONSTRAINED_POINT" ||
      node.mode !== "PARALLEL" ||
      hiddenNodeIds?.has(node.id)
    ) {
      continue;
    }

    if (hiddenNodeIds?.has(node.reference) || hiddenNodeIds?.has(node.anchor)) {
      continue;
    }

    const constrainedSegment = segmentForParallelPoint(
      graph.nodes,
      node,
      hiddenNodeIds,
    );

    if (!constrainedSegment) {
      continue;
    }

    if (
      !unionFind.has(node.reference) ||
      !unionFind.has(constrainedSegment.id)
    ) {
      continue;
    }

    unionFind.union(node.reference, constrainedSegment.id);
  }

  const families = [...unionFind.groups()]
    .map((ids) => [...ids].sort(compareGraphOrder(graph)))
    .filter((ids) => ids.length >= 2)
    .sort((left, right) =>
      compareGraphOrder(graph)(left[0] ?? "", right[0] ?? ""),
    );

  const counts = new Map<NodeId, ParallelMarkCount>();

  families.forEach((family, index) => {
    const markCount = Math.min(index + 1, 3) as ParallelMarkCount;

    for (const id of family) {
      counts.set(id, markCount);
    }
  });

  return counts;
}

function isVisibleLinearNode(
  node: GeometryNode,
  hiddenNodeIds: ReadonlySet<NodeId> | undefined,
): boolean {
  return (
    (node.kind === "SEGMENT" || node.kind === "LINE") &&
    !(hiddenNodeIds?.has(node.id) ?? false)
  );
}

function segmentForParallelPoint(
  nodes: readonly GeometryNode[],
  point: Extract<GeometryNode, { kind: "LINEAR_CONSTRAINED_POINT" }>,
  hiddenNodeIds: ReadonlySet<NodeId> | undefined,
): Extract<GeometryNode, { kind: "SEGMENT" }> | null {
  const found = nodes.find(
    (node): node is Extract<GeometryNode, { kind: "SEGMENT" }> =>
      node.kind === "SEGMENT" &&
      !(hiddenNodeIds?.has(node.id) ?? false) &&
      ((node.a === point.anchor && node.b === point.id) ||
        (node.a === point.id && node.b === point.anchor)),
  );

  return found ?? null;
}

function compareGraphOrder(
  graph: Graph,
): (left: NodeId, right: NodeId) => number {
  const order = new Map<NodeId, number>();

  graph.nodes.forEach((node, index) => {
    order.set(node.id, index);
  });

  return (left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0);
}

class UnionFind {
  private readonly parent = new Map<NodeId, NodeId>();

  constructor(ids: readonly NodeId[]) {
    for (const id of ids) {
      this.parent.set(id, id);
    }
  }

  has(id: NodeId): boolean {
    return this.parent.has(id);
  }

  union(left: NodeId, right: NodeId): void {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);

    if (!leftRoot || !rightRoot || leftRoot === rightRoot) {
      return;
    }

    this.parent.set(rightRoot, leftRoot);
  }

  groups(): Iterable<readonly NodeId[]> {
    const groups = new Map<NodeId, NodeId[]>();

    for (const id of this.parent.keys()) {
      const root = this.find(id);

      if (!root) {
        continue;
      }

      const group = groups.get(root) ?? [];
      group.push(id);
      groups.set(root, group);
    }

    return groups.values();
  }

  private find(id: NodeId): NodeId | null {
    const parent = this.parent.get(id);

    if (!parent) {
      return null;
    }

    if (parent === id) {
      return id;
    }

    const root = this.find(parent);

    if (!root) {
      return null;
    }

    this.parent.set(id, root);

    return root;
  }
}
