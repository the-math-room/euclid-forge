import type { EvaluatedSegment } from "../../evaluation/evaluated";
import {
  segmentNode,
  type GeometryNode,
  type GraphNode,
  type NodeId,
} from "../../representation/node";
import { isConstructiblePointNode } from "../../representation/pointNode";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";
export const segmentDefinition: GeometryDefinition<"SEGMENT"> = Object.freeze({
  kind: "SEGMENT",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"SEGMENT">) => [node.a, node.b],
  }),

  evaluation: Object.freeze({
    evaluate: (
      node: NodeByKind<"SEGMENT">,
      context: EvaluationContext,
    ): EvaluatedSegment => {
      const a = context.getPoint(node.a);
      const b = context.getPoint(node.b);

      return {
        kind: "SEGMENT",
        sourceKind: node.kind,
        ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
        id: node.id,
        a: a.point,
        b: b.point,
      };
    },
  }),
  construction: Object.freeze({
    factories: Object.freeze({
      segment: (
        { graph }: ConstructionContext,
        a: NodeId,
        b: NodeId,
      ): readonly GeometryNode[] => segmentConstructionNodes(graph, a, b),
    }),
  }),
});

function segmentConstructionNodes(
  graph: Readonly<{
    nodes: readonly GraphNode[];
    byId: ReadonlyMap<NodeId, GraphNode>;
  }>,
  a: NodeId,
  b: NodeId,
): readonly GeometryNode[] {
  if (a === b) {
    throw new Error("Cannot create segment from duplicate endpoints");
  }

  for (const id of [a, b]) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create segment with missing endpoint: ${id}`);
    }

    if (!isConstructiblePointNode(node)) {
      throw new Error(`Cannot create segment with constrained endpoint: ${id}`);
    }
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "SEGMENT" &&
      ((candidate.a === a && candidate.b === b) ||
        (candidate.a === b && candidate.b === a)),
  );

  if (existing) {
    return Object.freeze([]);
  }

  return Object.freeze([segmentNode(nextSegmentId(graph, a, b), a, b)]);
}

function endpointKey(a: NodeId, b: NodeId): string {
  return [a, b].sort().join("_");
}

function nextSegmentId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GraphNode> }>,
  a: NodeId,
  b: NodeId,
): NodeId {
  const base = `S_${endpointKey(a, b)}`;

  if (!graph.byId.has(base)) {
    return base;
  }

  let index = 1;

  while (graph.byId.has(`${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
}
