import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";
import type { Graph } from "@euclid-forge/core";
import type { GeometryNode, NodeId } from "@euclid-forge/core";
import {
  hitCircleValue,
  hitLineValue,
  hitPointValue,
  hitSegmentValue,
  hitTriangleValue,
} from "./hitGeometry";
import type {
  GeometryBodyDrag,
  GeometryHitCandidate,
  GeometryHitContext,
} from "./geometryInteractionContext";

export function hitGeometryValue(
  value: EvaluatedGeometry,
  context: GeometryHitContext,
): GeometryHitCandidate | null {
  switch (value.kind) {
    case "POINT": {
      const target = hitPointValue(value, context);

      return target
        ? {
            hitClass: "POINT",
            target,
          }
        : null;
    }

    case "SEGMENT": {
      const target = hitSegmentValue(value, context);

      return target
        ? {
            hitClass: "LINEAR",
            target,
          }
        : null;
    }

    case "LINE": {
      const target = hitLineValue(value, context);

      return target
        ? {
            hitClass: "LINEAR",
            target,
          }
        : null;
    }

    case "CIRCLE": {
      const target = hitCircleValue(value, context);

      return target
        ? {
            hitClass: "AREA",
            target,
          }
        : null;
    }

    case "TRIANGLE": {
      const target = hitTriangleValue(value, context);

      return target
        ? {
            hitClass: "AREA",
            target,
          }
        : null;
    }
  }
}

export function bodyDragForGeometryNode(
  graph: Graph,
  nodeId: NodeId,
): GeometryBodyDrag | null {
  const node = graph.byId.get(nodeId);

  if (!node) {
    return null;
  }

  const sourcePointIds = bodyDragSourcePointIds(node);

  if (!sourcePointIds || !areFreePoints(graph, sourcePointIds)) {
    return null;
  }

  return Object.freeze({ sourcePointIds });
}

function bodyDragSourcePointIds(node: GeometryNode): readonly NodeId[] | null {
  switch (node.kind) {
    case "LINE":
      return Object.freeze([node.a, node.b]);

    case "CIRCLE":
      return Object.freeze([node.center, node.through]);

    case "TRIANGLE":
      return Object.freeze([node.a, node.b, node.c]);

    default:
      return null;
  }
}

function areFreePoints(graph: Graph, ids: readonly NodeId[]): boolean {
  return ids.every((id) => graph.byId.get(id)?.kind === "FREE_POINT");
}
