import type { GeometryNode, GraphNode } from "./node";

export type DraggablePointNode = Extract<
  GeometryNode,
  {
    kind: "FREE_POINT" | "LINEAR_CONSTRAINED_POINT" | "POINT_ON_LINEAR";
  }
>;

export type ConstrainedMovablePointNode = Extract<
  GeometryNode,
  {
    kind: "LINEAR_CONSTRAINED_POINT" | "POINT_ON_LINEAR";
  }
>;

export function isDraggablePointNode(
  node: GraphNode | undefined,
): node is DraggablePointNode {
  if (!node) {
    return false;
  }

  switch (node.kind) {
    case "FREE_POINT":
    case "LINEAR_CONSTRAINED_POINT":
    case "POINT_ON_LINEAR":
      return true;

    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
    case "TRIANGLE":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "SEGMENT_MEASUREMENT":
      return false;
  }
}

export function isConstrainedMovablePointNode(
  node: GraphNode | undefined,
): node is ConstrainedMovablePointNode {
  if (!node) {
    return false;
  }

  switch (node.kind) {
    case "LINEAR_CONSTRAINED_POINT":
    case "POINT_ON_LINEAR":
      return true;

    case "FREE_POINT":
    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
    case "TRIANGLE":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "SEGMENT_MEASUREMENT":
      return false;
  }
}
