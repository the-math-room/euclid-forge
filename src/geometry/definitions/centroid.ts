import { hitPointValue } from "../hitGeometry";
import type { EvaluatedGeometry } from "../../evaluation/evaluated";
import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { centroid } from "../../meaning/vec2";
import { renderPoint } from "../../rendering/pointRenderer";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryHitCandidate, GeometryHitContext } from "../interactionContext";
import type { GeometryRenderContext } from "../renderingContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";

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
              hitClass: "POINT" as const,
              target,
            }
          : null;
      },
    }),

    rendering: Object.freeze({
      render: (value: EvaluatedGeometry, context: GeometryRenderContext): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for CENTROID, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),
  });
