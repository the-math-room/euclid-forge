import type { EvaluatedSegment } from "../../evaluation/evaluated";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";

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
        id: node.id,
        a: a.point,
        b: b.point,
      };
    },
  }),
});
