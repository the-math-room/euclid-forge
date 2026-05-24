import { centroid } from "../../meaning/vec2";
import type { EvaluatedPoint } from "../../evaluation/evaluated";
import type { EvaluationContext } from "../evaluationContext";
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
  });
