import type { EvaluatedCircle } from "../../evaluation/evaluated";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";

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
        id: node.id,
        center: center.point,
        radius,
      };
    },
  }),
});
