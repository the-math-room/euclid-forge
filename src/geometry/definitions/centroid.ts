import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { centroid } from "../../meaning/vec2";
import {
  centroidNode,
  type GeometryNode,
  type NodeId,
} from "../../representation/node";
import { renderPoint } from "../../rendering/pointRenderer";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";
import { hitPointValue } from "../hitGeometry";
import type {
  GeometryHitCandidate,
  GeometryHitContext,
} from "../interactionContext";
import type { GeometryRenderContext } from "../renderingContext";

export const centroidDefinition: GeometryDefinition<"CENTROID"> =
  Object.freeze({
    kind: "CENTROID",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"CENTROID">) => [node.triangle],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"CENTROID">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const triangle = context.getTriangle(node.triangle);

        return {
          kind: "POINT",
          id: node.id,
          point: centroid(triangle.a, triangle.b, triangle.c),
          label: node.label,
          role: "CENTROID",
        };
      },
    }),

    interaction: Object.freeze({
      hitClass: "POINT",
      hitTest: (
        value: EvaluatedGeometry,
        context: GeometryHitContext,
      ): GeometryHitCandidate | null => {
        if (value.kind !== "POINT") {
          return null;
        }

        const target = hitPointValue(value, context);

        return target
          ? {
              hitClass: "POINT",
              target,
            }
          : null;
      },
    }),

    rendering: Object.freeze({
      render: (
        value: EvaluatedGeometry,
        context: GeometryRenderContext,
      ): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for CENTROID, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),

    construction: Object.freeze({
      factories: Object.freeze({
        centroid: (
          { graph }: ConstructionContext,
          triangle: NodeId,
        ): readonly GeometryNode[] => centroidConstructionNodes(graph, triangle),
      }),
    }),
  });

function centroidConstructionNodes(
  graph: Readonly<{
    nodes: readonly GeometryNode[];
    byId: ReadonlyMap<NodeId, GeometryNode>;
  }>,
  triangle: NodeId,
): readonly GeometryNode[] {
  const node = graph.byId.get(triangle);

  if (!node) {
    throw new Error(`Cannot create centroid for missing triangle: ${triangle}`);
  }

  if (node.kind !== "TRIANGLE") {
    throw new Error(`Cannot create centroid for non-triangle node: ${triangle}`);
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "CENTROID" && candidate.triangle === triangle,
  );

  if (existing) {
    return Object.freeze([]);
  }

  const id = nextCentroidId(graph);

  return Object.freeze([centroidNode(id, triangle, id)]);
}

function nextCentroidId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`G${index}`)) {
    index += 1;
  }

  return `G${index}`;
}
