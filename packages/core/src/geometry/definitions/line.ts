import type { EvaluatedLine } from "../../evaluation/evaluated";
import {
  lineNode,
  type GeometryNode,
  type NodeId,
} from "../../representation/node";
import { isConstructiblePointNode } from "../../representation/pointNode";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const lineDefinition: GeometryDefinition<"LINE"> = Object.freeze({
  kind: "LINE",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"LINE">) => [node.a, node.b],
  }),

  evaluation: Object.freeze({
    evaluate: (
      node: NodeByKind<"LINE">,
      context: EvaluationContext,
    ): EvaluatedLine => {
      const a = context.getPoint(node.a);
      const b = context.getPoint(node.b);

      return {
        kind: "LINE",
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
      line: (
        { graph }: ConstructionContext,
        a: NodeId,
        b: NodeId,
      ): readonly GeometryNode[] => lineConstructionNodes(graph, a, b),
    }),
  }),
});

function lineConstructionNodes(
  graph: Readonly<{
    nodes: readonly GeometryNode[];
    byId: ReadonlyMap<NodeId, GeometryNode>;
  }>,
  a: NodeId,
  b: NodeId,
): readonly GeometryNode[] {
  if (a === b) {
    throw new Error("Cannot create line from duplicate points");
  }

  for (const id of [a, b]) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create line with missing point: ${id}`);
    }

    if (!isConstructiblePointNode(node)) {
      throw new Error(`Cannot create line with constrained point: ${id}`);
    }
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "LINE" &&
      ((candidate.a === a && candidate.b === b) ||
        (candidate.a === b && candidate.b === a)),
  );

  if (existing) {
    return Object.freeze([]);
  }

  return Object.freeze([lineNode(nextLineId(graph, a, b), a, b)]);
}

function endpointKey(a: NodeId, b: NodeId): string {
  return [a, b].sort().join("_");
}

function nextLineId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
  a: NodeId,
  b: NodeId,
): NodeId {
  const base = `L_${endpointKey(a, b)}`;

  if (!graph.byId.has(base)) {
    return base;
  }

  let index = 1;

  while (graph.byId.has(`${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
}
