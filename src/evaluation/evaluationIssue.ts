import type { NodeId } from "../representation/node";

export class GeometryEvaluationIssueError extends Error {
  readonly nodeId: NodeId;

  constructor(nodeId: NodeId, message: string) {
    super(message);
    this.name = "GeometryEvaluationIssueError";
    this.nodeId = nodeId;
  }
}
