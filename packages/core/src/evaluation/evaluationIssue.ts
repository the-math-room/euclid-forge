import type { NodeId } from "../representation/node";

export type EvaluationIssueCode =
  | "MISSING_DEPENDENCY"
  | "NO_REAL_INTERSECTION"
  | "NO_UNIQUE_INTERSECTION"
  | "STALE_INTERSECTION_BRANCH"
  | "UNDEFINED_GEOMETRY";

export class GeometryEvaluationIssueError extends Error {
  readonly nodeId: NodeId;
  readonly code: EvaluationIssueCode;

  constructor(
    nodeId: NodeId,
    message: string,
    code: EvaluationIssueCode = "UNDEFINED_GEOMETRY",
  ) {
    super(message);
    this.name = "GeometryEvaluationIssueError";
    this.nodeId = nodeId;
    this.code = code;
  }
}
