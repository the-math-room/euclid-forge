import type {
  EvaluatedCircle,
  EvaluatedGeometry,
} from "../../evaluation/evaluated";
import {
  circleNode,
  type GeometryNode,
  type NodeId,
} from "../../representation/node";
import { isConstructiblePointNode } from "../../representation/pointNode";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";
import { hitCircleValue } from "../hitGeometry";
import type {
  GeometryBodyDragContext,
  GeometryHitCandidate,
  GeometryHitContext,
} from "../interactionContext";

export const circleDefinition: GeometryDefinition<"CIRCLE"> = Object.freeze({
  kind: "CIRCLE",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"CIRCLE">) => [node.center, node.through],
  }),

  evaluation: Object.freeze({
    evaluate: (
      node: NodeByKind<"CIRCLE">,
      context: EvaluationContext,
    ): EvaluatedCircle => {
      const center = context.getPoint(node.center);
      const through = context.getPoint(node.through);
      const radius = Math.hypot(
        through.point.x - center.point.x,
        through.point.y - center.point.y,
      );

      return {
        kind: "CIRCLE",
        sourceKind: node.kind,
        ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
        id: node.id,
        center: center.point,
        radius,
      };
    },
  }),

  interaction: Object.freeze({
    hitClass: "AREA",
    hitTest: (
      value: EvaluatedGeometry,
      context: GeometryHitContext,
    ): GeometryHitCandidate | null => {
      if (value.kind !== "CIRCLE") {
        return null;
      }

      const target = hitCircleValue(value, context);

      return target
        ? {
            hitClass: "AREA",
            target,
          }
        : null;
    },

    bodyDrag: Object.freeze({
      sourcePointIds: (
        node: NodeByKind<"CIRCLE">,
        context: GeometryBodyDragContext,
      ): readonly NodeId[] | null => {
        const sourcePointIds = [node.center, node.through];

        return context.areFreePoints(sourcePointIds) ? sourcePointIds : null;
      },
    }),
  }),

  construction: Object.freeze({
    factories: Object.freeze({
      circle: (
        { graph }: ConstructionContext,
        center: NodeId,
        through: NodeId,
      ): readonly GeometryNode[] =>
        circleConstructionNodes(graph, center, through),
    }),
  }),
});

function circleConstructionNodes(
  graph: Readonly<{
    nodes: readonly GeometryNode[];
    byId: ReadonlyMap<NodeId, GeometryNode>;
  }>,
  center: NodeId,
  through: NodeId,
): readonly GeometryNode[] {
  if (center === through) {
    throw new Error("Cannot create circle from duplicate points");
  }

  for (const id of [center, through]) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create circle with missing point: ${id}`);
    }

    if (!isConstructiblePointNode(node)) {
      throw new Error(`Cannot create circle with constrained point: ${id}`);
    }
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "CIRCLE" &&
      candidate.center === center &&
      candidate.through === through,
  );

  if (existing) {
    return Object.freeze([]);
  }

  const id = nextCircleId(graph);

  return Object.freeze([circleNode(id, center, through)]);
}

function nextCircleId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`C${index}`)) {
    index += 1;
  }

  return `C${index}`;
}
