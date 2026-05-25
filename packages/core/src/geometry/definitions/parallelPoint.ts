import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import { vec2 } from "../../meaning/vec2";
import type { Vec2 } from "../../meaning/vec2";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const parallelPointDefinition: GeometryDefinition<"PARALLEL_POINT"> =
  Object.freeze({
    kind: "PARALLEL_POINT",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"PARALLEL_POINT">) => [
        node.reference,
        node.anchor,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"PARALLEL_POINT">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const reference = context.getGeometry(node.reference);
        const anchor = context.getPoint(node.anchor);
        const direction = unitDirectionForLinearGeometry(reference);

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
