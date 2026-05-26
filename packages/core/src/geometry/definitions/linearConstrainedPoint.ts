import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import { vec2 } from "../../meaning/vec2";
import type { Vec2 } from "../../meaning/vec2";
import type { LinearConstraintMode } from "../../representation/node";
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

export function constrainedDirectionForLinearGeometry(
  value: EvaluatedGeometry,
  mode: LinearConstraintMode,
): Vec2 | null {
  const direction = unitDirectionForLinearGeometry(value);

  if (!direction) {
    return null;
  }

  switch (mode) {
    case "PARALLEL":
      return direction;

    case "PERPENDICULAR":
      return vec2(-direction.y, direction.x);
  }
}

function unitDirectionForLinearGeometry(value: EvaluatedGeometry): Vec2 | null {
  switch (value.kind) {
    case "SEGMENT":
    case "LINE": {
      const dx = value.b.x - value.a.x;
      const dy = value.b.y - value.a.y;
      const length = Math.hypot(dx, dy);

      if (length <= 1e-9) {
        return null;
      }

      return vec2(dx / length, dy / length);
    }

    case "POINT":
    case "CIRCLE":
    case "TRIANGLE":
      return null;
  }
}
