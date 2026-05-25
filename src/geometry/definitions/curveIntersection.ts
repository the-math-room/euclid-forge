import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import {
  curveIntersectionNode,
  type NodeId,
} from "../../representation/node";
import { renderPoint } from "../../rendering/pointRenderer";
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
import type { GeometryRenderContext } from "../renderingContext";
import { curveIntersectionCandidatesForValues } from "../curveIntersectionCandidates";

export const curveIntersectionDefinition: GeometryDefinition<"CURVE_INTERSECTION"> =
  Object.freeze({
    kind: "CURVE_INTERSECTION",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"CURVE_INTERSECTION">) => [
        node.curveA,
        node.curveB,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"CURVE_INTERSECTION">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const curveA = context.getGeometry(node.curveA);
        const curveB = context.getGeometry(node.curveB);
        const result = curveIntersectionCandidatesForValues(curveA, curveB);

        if (result.issue) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; ${result.issue}`,
          );
        }

        const candidate = result.candidates.find(
          (current) => current.branchKey === node.branchKey,
        );

        if (!candidate) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; branch ${node.branchKey} is not currently defined`,
          );
        }

        return {
          kind: "POINT",
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          point: candidate.point,
          label: node.label,
          role: "INTERSECTION",
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

    rendering: Object.freeze({
      layer: "POINT",
      render: (
        value: EvaluatedGeometry,
        context: GeometryRenderContext,
      ): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for CURVE_INTERSECTION, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),
  });

export function curveIntersectionConstructionNode(
  id: NodeId,
  curveA: NodeId,
  curveB: NodeId,
  branchKey: string,
  label = id,
) {
  return curveIntersectionNode(id, curveA, curveB, branchKey, label);
}
