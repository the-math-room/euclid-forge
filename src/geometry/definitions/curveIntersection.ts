import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import {
  curveIntersectionNode,
  type NodeId,
} from "../../representation/node";
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
            curveIntersectionIssueCode(result.issue),
          );
        }

        const candidate = result.candidates.find(
          (current) => current.branchKey === node.branchKey,
        );

        if (!candidate) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; branch ${node.branchKey} is not currently defined`,
            "STALE_INTERSECTION_BRANCH",
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


function curveIntersectionIssueCode(
  issue: string,
):
  | "NO_REAL_INTERSECTION"
  | "NO_UNIQUE_INTERSECTION"
  | "UNDEFINED_GEOMETRY" {
  if (
    issue.includes("do not intersect") ||
    issue.includes("does not intersect") ||
    issue.includes("contained within") ||
    issue.includes("outside bounded curve domains")
  ) {
    return "NO_REAL_INTERSECTION";
  }

  if (
    issue.includes("coincident") ||
    issue.includes("parallel") ||
    issue.includes("no unique")
  ) {
    return "NO_UNIQUE_INTERSECTION";
  }

  return "UNDEFINED_GEOMETRY";
}
