import {
  isEvaluatedGeometry,
  type EvaluatedGeometry,
  type EvaluatedSceneItem,
  type EvaluatedPoint,
  type EvaluatedSegment,
  type EvaluatedTriangle,
} from "../evaluation/evaluated";
import type { NodeId } from "../representation/node";

export type EvaluationContext = Readonly<{
  getGeometry: (id: NodeId) => EvaluatedSceneItem;
  getEvaluatedGeometry: (id: NodeId) => EvaluatedGeometry;
  getPoint: (id: NodeId) => EvaluatedPoint;
  getSegment: (id: NodeId) => EvaluatedSegment;
  getTriangle: (id: NodeId) => EvaluatedTriangle;
}>;

export function createEvaluationContext(
  values: ReadonlyMap<NodeId, EvaluatedSceneItem>,
): EvaluationContext {
  return Object.freeze({
    getGeometry(id: NodeId): EvaluatedSceneItem {
      return requireEvaluatedSceneItem(values, id);
    },

    getEvaluatedGeometry(id: NodeId): EvaluatedGeometry {
      const value = requireEvaluatedSceneItem(values, id);

      if (!isEvaluatedGeometry(value)) {
        throw new Error(
          `Expected evaluated geometry for ${id}; got ${value.kind}`,
        );
      }

      return value;
    },

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

function requireEvaluatedSceneItem(
  values: ReadonlyMap<NodeId, EvaluatedSceneItem>,
  id: NodeId,
): EvaluatedSceneItem {
  const value = values.get(id);

  if (!value) {
    throw new Error(`Missing evaluated dependency: ${id}`);
  }

  return value;
}

function requireEvaluated<K extends EvaluatedSceneItem["kind"]>(
  values: ReadonlyMap<NodeId, EvaluatedSceneItem>,
  id: NodeId,
  kind: K,
): Extract<EvaluatedSceneItem, { kind: K }> {
  const value = requireEvaluatedSceneItem(values, id);

  if (value.kind !== kind) {
    throw new Error(`Expected ${id} to evaluate to ${kind}, got ${value.kind}`);
  }

  return value as Extract<EvaluatedSceneItem, { kind: K }>;
}
