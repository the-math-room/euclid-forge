import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import {
  linearCarrierForEvaluatedGeometry,
  pointOnLinearCarrier,
} from "../linearCarrier";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const pointOnLinearDefinition: GeometryDefinition<"POINT_ON_LINEAR"> =
  Object.freeze({
    kind: "POINT_ON_LINEAR",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"POINT_ON_LINEAR">) => [node.reference],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"POINT_ON_LINEAR">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const reference = context.getEvaluatedGeometry(node.reference);
        const carrier = linearCarrierForEvaluatedGeometry(reference);

        if (!carrier) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; reference ${node.reference} is not a non-degenerate line or segment`,
            "UNDEFINED_GEOMETRY",
          );
        }

        return {
          kind: "POINT",
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          point: pointOnLinearCarrier(carrier, node.parameter),
          label: node.label,
          ...(node.labelOffsetPx === undefined
            ? {}
            : { labelOffsetPx: node.labelOffsetPx }),
          role: "INTERSECTION",
        };
      },
    }),
  });
