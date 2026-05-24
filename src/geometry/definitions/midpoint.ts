import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { midpoint } from "../../meaning/vec2";
import { renderPoint } from "../../rendering/pointRenderer";
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

export const midpointDefinition: GeometryDefinition<"MIDPOINT"> =
  Object.freeze({
    kind: "MIDPOINT",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"MIDPOINT">) => [node.segment],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"MIDPOINT">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const segment = context.getSegment(node.segment);

        return {
          kind: "POINT",
          id: node.id,
          point: midpoint(segment.a, segment.b),
          label: node.label,
          role: "MIDPOINT",
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
            `Expected POINT evaluated value for MIDPOINT, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),
  });
