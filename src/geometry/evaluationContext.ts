import type {
  EvaluatedGeometry,
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";
import type { NodeId } from "../representation/node";

export type EvaluationContext = Readonly<{
  getPoint: (id: NodeId) => EvaluatedPoint;
  getSegment: (id: NodeId) => EvaluatedSegment;
  getTriangle: (id: NodeId) => EvaluatedTriangle;
}>;

export function createEvaluationContext(
  values: ReadonlyMap<NodeId, EvaluatedGeometry>,
): EvaluationContext {
  return Object.freeze({
    getPoint(id: NodeId): EvaluatedPoint {
      return requireEvaluated(values, id, "POINT");
    },

    getSegment(id: NodeId): EvaluatedSegment {
      return requireEvaluated(values, id, "SEGMENT");
    },

    getTriangle(id: NodeId): EvaluatedTriangle {
      return requireEvaluated(values, id, "TRIANGLE");
    },
  });
}

function requireEvaluated<K extends EvaluatedGeometry["kind"]>(
  values: ReadonlyMap<NodeId, EvaluatedGeometry>,
  id: NodeId,
  kind: K,
): Extract<EvaluatedGeometry, { kind: K }> {
  const value = values.get(id);

  if (!value) {
    throw new Error(`Missing evaluated dependency: ${id}`);
  }

  if (value.kind !== kind) {
    throw new Error(`Expected ${id} to evaluate to ${kind}, got ${value.kind}`);
  }

  return value as Extract<EvaluatedGeometry, { kind: K }>;
}
