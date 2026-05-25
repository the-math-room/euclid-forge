import { createEvaluationContext } from "../geometry/evaluationContext";
import { evaluateGeometryNode } from "../geometry/geometryRegistry";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import type { EvaluatedGeometry } from "./evaluated";

export type EvaluationIssue = Readonly<{
  nodeId: NodeId;
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

  for (const node of graph.nodes) {
    const evaluated = evaluateGeometryNode(
      node,
      createEvaluationContext(values),
    );

    values.set(node.id, evaluated);
    ordered.push(evaluated);
  }

  return Object.freeze({
    values,
    ordered: Object.freeze(ordered),
    issues: Object.freeze([]),
  });
}
