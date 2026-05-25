import type { GeometryNode } from "./node";

export function isConstructiblePointNode(node: GeometryNode): boolean {
  switch (node.kind) {
    case "FREE_POINT":
    case "MIDPOINT":
    case "CENTROID":
    case "LINE_INTERSECTION":
      return true;

    default:
      return false;
  }
}
