import { createEvaluationContext } from "../geometry/evaluationContext";
import { evaluateGeometryNode } from "../geometry/geometryRegistry";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import type { EvaluatedGeometry } from "./evaluated";
import type { EvaluationIssueCode } from "./evaluationIssue";
import { GeometryEvaluationIssueError } from "./evaluationIssue";

export type EvaluationIssueSeverity = "warning";

export type EvaluationIssue = Readonly<{
  nodeId: NodeId;
  severity: EvaluationIssueSeverity;
  code: EvaluationIssueCode;
  message: string;
}>;

export type EvaluatedScene = Readonly<{
  values: ReadonlyMap<NodeId, EvaluatedGeometry>;
  ordered: readonly EvaluatedGeometry[];
  issues: readonly EvaluationIssue[];
}>;

export function evaluateGraph(graph: Graph): EvaluatedScene {
  const values = new Map<NodeId, EvaluatedGeometry>();
  const ordered: EvaluatedGeometry[] = [];
  const issues: EvaluationIssue[] = [];

  for (const node of graph.nodes) {
    try {
      const evaluated = evaluateGeometryNode(
        node,
        createEvaluationContext(values),
      );

      values.set(node.id, evaluated);
      ordered.push(evaluated);
    } catch (error) {
      const issue = evaluationIssueForError(node.id, error);

      if (!issue) {
        throw error;
      }

      issues.push(issue);
    }
  }

  return Object.freeze({
    values,
    ordered: Object.freeze(ordered),
    issues: Object.freeze(issues),
  });
}

function evaluationIssueForError(
  nodeId: NodeId,
  error: unknown,
): EvaluationIssue | null {
  if (error instanceof GeometryEvaluationIssueError) {
    return Object.freeze({
      nodeId: error.nodeId,
      severity: "warning",
      code: error.code,
      message: error.message,
    });
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Missing evaluated dependency: ")
  ) {
    return Object.freeze({
      nodeId,
      severity: "warning",
      code: "MISSING_DEPENDENCY",
      message: `Cannot evaluate ${nodeId}; ${error.message}`,
    });
  }

  return null;
}
