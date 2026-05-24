import type { EvaluatedGeometry } from "../../evaluation/evaluated";
import type { EvaluatedTriangle } from "../../evaluation/evaluated";
import { renderTriangle } from "../../rendering/triangleRenderer";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryRenderContext } from "../renderingContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";

export const triangleDefinition: GeometryDefinition<"TRIANGLE"> =
  Object.freeze({
    kind: "TRIANGLE",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"TRIANGLE">) => [node.a, node.b, node.c],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"TRIANGLE">,
        context: EvaluationContext,
      ): EvaluatedTriangle => {
        const a = context.getPoint(node.a);
        const b = context.getPoint(node.b);
        const c = context.getPoint(node.c);

        return {
          kind: "TRIANGLE",
          id: node.id,
          a: a.point,
          b: b.point,
          c: c.point,
        };
      },
    }),

    rendering: Object.freeze({
      render: (value: EvaluatedGeometry, context: GeometryRenderContext): void => {
        if (value.kind !== "TRIANGLE") {
          throw new Error(
            `Expected TRIANGLE evaluated value for TRIANGLE, got ${value.kind}`,
          );
        }

        renderTriangle(context.ctx, context.viewport, value, context.options);
      },
    }),
  });
