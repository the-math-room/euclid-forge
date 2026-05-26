import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { centroid } from "../../meaning/vec2";
import {
  centroidNode,
  type GeometryNode,
  type GraphNode,
  type NodeId,
} from "../../representation/node";
import { nextPointLabel } from "../../representation/pointLabelPlanning";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";
export const centroidDefinition: GeometryDefinition<"CENTROID"> = Object.freeze(
  {
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
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          point: centroid(triangle.a, triangle.b, triangle.c),
          label: node.label,
          role: "CENTROID",
        };
      },
    }),
    construction: Object.freeze({
      factories: Object.freeze({
        centroid: (
          { graph }: ConstructionContext,
          triangle: NodeId,
        ): readonly GeometryNode[] =>
          centroidConstructionNodes(graph, triangle),
      }),
    }),
  },
);

function centroidConstructionNodes(
  graph: Readonly<{
    nodes: readonly GraphNode[];
    byId: ReadonlyMap<NodeId, GraphNode>;
  }>,
  triangle: NodeId,
): readonly GeometryNode[] {
  const node = graph.byId.get(triangle);

  if (!node) {
    throw new Error(`Cannot create centroid for missing triangle: ${triangle}`);
  }

  if (node.kind !== "TRIANGLE") {
    throw new Error(
      `Cannot create centroid for non-triangle node: ${triangle}`,
    );
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "CENTROID" && candidate.triangle === triangle,
  );

  if (existing) {
    return Object.freeze([]);
  }

  const id = nextCentroidId(graph);

  return Object.freeze([centroidNode(id, triangle, nextPointLabel(graph))]);
}

function nextCentroidId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GraphNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`G${index}`)) {
    index += 1;
  }

  return `G${index}`;
}
