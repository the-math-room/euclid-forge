import type {
  AnnotationNode,
  GeometryNode,
  GraphNode,
  LineNode,
  SegmentNode,
} from "./node";

export function isGeometryNode(node: GraphNode): node is GeometryNode {
  return !isAnnotationNode(node);
}

export function isAnnotationNode(node: GraphNode): node is AnnotationNode {
  switch (node.kind) {
    case "SEGMENT_MEASUREMENT":
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
    case "LINEAR_CONSTRAINED_POINT":
      return false;
  }
}

export function isSegmentNode(node: GraphNode): node is SegmentNode {
  return node.kind === "SEGMENT";
}

export function isLinearNode(node: GraphNode): node is SegmentNode | LineNode {
  return node.kind === "SEGMENT" || node.kind === "LINE";
}
