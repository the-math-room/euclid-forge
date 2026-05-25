import type {
  EvaluatedGeometry,
  EvaluatedTriangle,
} from "../../evaluation/evaluated";
import {
  triangleNode,
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
import { hitTriangleValue } from "../hitGeometry";
import type {
  GeometryBodyDragContext,
  GeometryHitCandidate,
  GeometryHitContext,
} from "../interactionContext";

export const triangleDefinition: GeometryDefinition<"TRIANGLE"> =
  Object.freeze({
    kind: "TRIANGLE",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"TRIANGLE">) => [node.a, node.b, node.c],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"TRIANGLE">,
        context: EvaluationContext,
      ): EvaluatedTriangle => {
        const a = context.getPoint(node.a);
        const b = context.getPoint(node.b);
        const c = context.getPoint(node.c);

        return {
          kind: "TRIANGLE",
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          a: a.point,
          b: b.point,
          c: c.point,
        };
      },
    }),

    interaction: Object.freeze({
      hitClass: "AREA",
      hitTest: (
        value: EvaluatedGeometry,
        context: GeometryHitContext,
      ): GeometryHitCandidate | null => {
        if (value.kind !== "TRIANGLE") {
          return null;
        }

        const target = hitTriangleValue(value, context);

        return target
          ? {
              hitClass: "AREA",
              target,
            }
          : null;
      },

      bodyDrag: Object.freeze({
        sourcePointIds: (
          node: NodeByKind<"TRIANGLE">,
          context: GeometryBodyDragContext,
        ): readonly NodeId[] | null => {
          const sourcePointIds = [node.a, node.b, node.c];

          return context.areFreePoints(sourcePointIds) ? sourcePointIds : null;
        },
      }),
    }),


    construction: Object.freeze({
      factories: Object.freeze({
        triangle: (
          { graph }: ConstructionContext,
          a: NodeId,
          b: NodeId,
          c: NodeId,
        ): readonly GeometryNode[] =>
          triangleConstructionNodes(graph, [a, b, c]),
      }),
    }),
  });

function triangleConstructionNodes(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
  vertices: readonly [NodeId, NodeId, NodeId],
): readonly GeometryNode[] {
  const uniqueVertices = new Set(vertices);

  if (uniqueVertices.size !== 3) {
    throw new Error("Cannot create triangle from duplicate vertices");
  }

  for (const id of vertices) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create triangle with missing vertex: ${id}`);
    }

    if (!isConstructiblePointNode(node)) {
      throw new Error(`Cannot create triangle with constrained vertex: ${id}`);
    }
  }

  return Object.freeze([
    triangleNode(nextTriangleId(graph), vertices[0], vertices[1], vertices[2]),
  ]);
}

function nextTriangleId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`T${index}`)) {
    index += 1;
  }

  return `T${index}`;
}
