import type { GeometryNode, GraphNode } from "./node";

export type ConstructiblePointNode = Extract<
  GeometryNode,
  {
    kind:
      | "FREE_POINT"
      | "MIDPOINT"
      | "CENTROID"
      | "SEGMENT_INTERSECTION"
      | "CURVE_INTERSECTION"
      | "LINEAR_CONSTRAINED_POINT";
  }
>;

export function isConstructiblePointNode(
  node: GraphNode,
): node is ConstructiblePointNode {
  switch (node.kind) {
    case "FREE_POINT":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "LINEAR_CONSTRAINED_POINT":
      return true;

    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
    case "TRIANGLE":
    case "SEGMENT_MEASUREMENT":
      return false;
  }
}
