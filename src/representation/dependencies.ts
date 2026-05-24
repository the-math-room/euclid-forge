import type { GeometryNode, NodeId } from "./node";

export function dependenciesOf(node: GeometryNode): readonly NodeId[] {
  switch (node.kind) {
    case "FREE_POINT":
      return [];

    case "SEGMENT":
      return [node.a, node.b];

    case "MIDPOINT":
      return [node.segment];
  }
}