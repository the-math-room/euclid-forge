import type { EvaluatedPolygon } from "../../evaluation/evaluated";
import type { NodeId } from "../../representation/node";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const polygonDefinition: GeometryDefinition<"POLYGON"> = Object.freeze({
  kind: "POLYGON",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"POLYGON">) => node.vertices,
  }),

  evaluation: Object.freeze({
    evaluate: (
      node: NodeByKind<"POLYGON">,
      context: EvaluationContext,
    ): EvaluatedPolygon => {
      return {
        kind: "POLYGON",
        sourceKind: node.kind,
        ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
        id: node.id,
        points: Object.freeze(
          node.vertices.map((vertex: NodeId) => context.getPoint(vertex).point),
        ),
      };
    },
  }),
});
