import type { EvaluatedTriangle } from "../../evaluation/evaluated";
import type { EvaluationContext } from "../evaluationContext";
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
  });
