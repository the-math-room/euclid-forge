import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { midpoint } from "../../meaning/vec2";
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
        sourceKind: node.kind,
        ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
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

  });
