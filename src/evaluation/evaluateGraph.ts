import { centroid, midpoint, vec2 } from "../meaning/vec2";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import type {
  EvaluatedGeometry,
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "./evaluated";

export type EvaluatedScene = Readonly<{
  values: ReadonlyMap<NodeId, EvaluatedGeometry>;
  ordered: readonly EvaluatedGeometry[];
}>;

export function evaluateGraph(graph: Graph): EvaluatedScene {
  const values = new Map<NodeId, EvaluatedGeometry>();

  for (const node of graph.nodes) {
    switch (node.kind) {
      case "FREE_POINT": {
        values.set(node.id, {
          kind: "POINT",
          id: node.id,
          point: vec2(node.x, node.y),
          label: node.label,
          source: "FREE",
        });
        break;
      }

      case "SEGMENT": {
        const a = requireEvaluatedPoint(values, node.a);
        const b = requireEvaluatedPoint(values, node.b);

        values.set(node.id, {
          kind: "SEGMENT",
          id: node.id,
          a: a.point,
          b: b.point,
        });
        break;
      }

      case "TRIANGLE": {
        const a = requireEvaluatedPoint(values, node.a);
        const b = requireEvaluatedPoint(values, node.b);
        const c = requireEvaluatedPoint(values, node.c);

        values.set(node.id, {
          kind: "TRIANGLE",
          id: node.id,
          a: a.point,
          b: b.point,
          c: c.point,
        });
        break;
      }

      case "MIDPOINT": {
        const segment = requireEvaluatedSegment(values, node.segment);

        values.set(node.id, {
          kind: "POINT",
          id: node.id,
          point: midpoint(segment.a, segment.b),
          label: node.label,
          source: "CONSTRAINED",
        });
        break;
      }

      case "CENTROID": {
        const triangle = requireEvaluatedTriangle(values, node.triangle);

        values.set(node.id, {
          kind: "POINT",
          id: node.id,
          point: centroid(triangle.a, triangle.b, triangle.c),
          label: node.label,
          source: "CONSTRAINED",
        });
        break;
      }
    }
  }

  return Object.freeze({
    values,
    ordered: Object.freeze([...values.values()]),
  });
}

function requireEvaluatedPoint(
  values: ReadonlyMap<NodeId, EvaluatedGeometry>,
  id: NodeId,
): EvaluatedPoint {
  return requireEvaluated(values, id, "POINT");
}

function requireEvaluatedSegment(
  values: ReadonlyMap<NodeId, EvaluatedGeometry>,
  id: NodeId,
): EvaluatedSegment {
  return requireEvaluated(values, id, "SEGMENT");
}

function requireEvaluatedTriangle(
  values: ReadonlyMap<NodeId, EvaluatedGeometry>,
  id: NodeId,
): EvaluatedTriangle {
  return requireEvaluated(values, id, "TRIANGLE");
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
    throw new Error(`Expected ${kind} dependency: ${id}`);
  }

  return value as Extract<EvaluatedGeometry, { kind: K }>;
}
