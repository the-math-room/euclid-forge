import type { EvaluatedPoint } from "../../evaluation/evaluated";
import { vec2 } from "../../meaning/vec2";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";
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
        ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
        id: node.id,
        point: vec2(node.x, node.y),
        label: node.label,
        role: "FREE",
      }),
    }),
  });
