import type { GeometryNode } from "./node";

export function isConstructiblePointNode(node: GeometryNode): boolean {
  switch (node.kind) {
    case "FREE_POINT":
    case "MIDPOINT":
    case "CENTROID":
      return true;

    default:
      return false;
  }
}
