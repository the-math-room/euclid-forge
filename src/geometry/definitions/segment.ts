import type {
  EvaluatedGeometry,
  EvaluatedSegment,
} from "../../evaluation/evaluated";
import { renderSegment } from "../../rendering/segmentRenderer";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";
import { hitSegmentValue } from "../hitGeometry";
import type {
  GeometryHitCandidate,
  GeometryHitContext,
} from "../interactionContext";
import type { GeometryRenderContext } from "../renderingContext";

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

  interaction: Object.freeze({
    hitClass: "LINEAR",
    hitTest: (
      value: EvaluatedGeometry,
      context: GeometryHitContext,
    ): GeometryHitCandidate | null => {
      if (value.kind !== "SEGMENT") {
        return null;
      }

      const target = hitSegmentValue(value, context);

      return target
        ? {
            hitClass: "LINEAR",
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
      if (value.kind !== "SEGMENT") {
        throw new Error(
          `Expected SEGMENT evaluated value for SEGMENT, got ${value.kind}`,
        );
      }

      renderSegment(context.ctx, context.viewport, value, context.options);
    },
  }),
});
