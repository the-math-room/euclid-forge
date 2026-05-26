import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import { vec2 } from "../../meaning/vec2";
import { constrainedDirectionForLinearGeometry } from "../linearConstraint";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const linearConstrainedPointDefinition: GeometryDefinition<"LINEAR_CONSTRAINED_POINT"> =
  Object.freeze({
    kind: "LINEAR_CONSTRAINED_POINT",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"LINEAR_CONSTRAINED_POINT">) => [
        node.reference,
        node.anchor,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"LINEAR_CONSTRAINED_POINT">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const reference = context.getGeometry(node.reference);
        const anchor = context.getPoint(node.anchor);
        const direction = constrainedDirectionForLinearGeometry(
          reference,
          node.mode,
        );

        if (!direction) {
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
          point: vec2(
            anchor.point.x + direction.x * node.offset,
            anchor.point.y + direction.y * node.offset,
          ),
          label: node.label,
          role: "INTERSECTION",
        };
      },
    }),
  });
