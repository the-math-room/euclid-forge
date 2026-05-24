import type { EvaluatedGeometry } from "../../evaluation/evaluated";
import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { midpoint } from "../../meaning/vec2";
import { renderPoint } from "../../rendering/pointRenderer";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryRenderContext } from "../renderingContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";

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

    rendering: Object.freeze({
      render: (value: EvaluatedGeometry, context: GeometryRenderContext): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for MIDPOINT, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),
  });
