import type { GeometryNode, NodeId } from "./node";

export function dependenciesOf(node: GeometryNode): readonly NodeId[] {
  switch (node.kind) {
    case "FREE_POINT":
      return [];

    case "SEGMENT":
      return [node.a, node.b];

    case "TRIANGLE":
      return [node.a, node.b, node.c];

    case "MIDPOINT":
      return [node.segment];

    case "TRIANGLE_SIDE_MIDPOINT":
      return [node.triangle];

    case "CENTROID":
      return [node.triangle];
  }
}
