import type { EvaluatedGeometry } from "../../evaluation/evaluated";
import type { EvaluatedSegment } from "../../evaluation/evaluated";
import { renderSegment } from "../../rendering/segmentRenderer";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryRenderContext } from "../renderingContext";
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

  rendering: Object.freeze({
    render: (value: EvaluatedGeometry, context: GeometryRenderContext): void => {
      if (value.kind !== "SEGMENT") {
        throw new Error(
          `Expected SEGMENT evaluated value for SEGMENT, got ${value.kind}`,
        );
      }

      renderSegment(context.ctx, context.viewport, value, context.options);
    },
  }),
});
