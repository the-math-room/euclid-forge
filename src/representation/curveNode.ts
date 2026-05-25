import type { GeometryNode } from "./node";

export function isConstructibleCurveNode(node: GeometryNode): boolean {
  switch (node.kind) {
    case "SEGMENT":
    case "CIRCLE":
      return true;

    default:
      return false;
  }
}
