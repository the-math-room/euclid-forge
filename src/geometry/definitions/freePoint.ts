import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { vec2 } from "../../meaning/vec2";
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

export const freePointDefinition: GeometryDefinition<"FREE_POINT"> =
  Object.freeze({
    kind: "FREE_POINT",

    representation: Object.freeze({
      dependencies: () => [],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"FREE_POINT">,
        _context: EvaluationContext,
      ): EvaluatedPoint => ({
        kind: "POINT",
        sourceKind: node.kind,
        id: node.id,
        point: vec2(node.x, node.y),
        label: node.label,
        role: "FREE",
      }),
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
      layer: "POINT",
      render: (
        value: EvaluatedGeometry,
        context: GeometryRenderContext,
      ): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for FREE_POINT, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),
  });
