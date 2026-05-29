import type { GeometryNode, GraphNode } from "./node";

export type ConstructibleCurveNode = Extract<
  GeometryNode,
  {
    kind: "SEGMENT" | "LINE" | "CIRCLE";
  }
>;

export function isConstructibleCurveNode(
  node: GraphNode,
): node is ConstructibleCurveNode {
  switch (node.kind) {
    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
      return true;

    case "FREE_POINT":
    case "TRIANGLE":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "LINEAR_CONSTRAINED_POINT":
    case "POINT_ON_LINEAR":
    case "SEGMENT_MEASUREMENT":
      return false;
  }
}
