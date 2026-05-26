import type { GeometryNode } from "./node";

export function isConstructiblePointNode(node: GeometryNode): boolean {
  switch (node.kind) {
    case "FREE_POINT":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "LINEAR_CONSTRAINED_POINT":
      return true;

    default:
      return false;
  }
}
