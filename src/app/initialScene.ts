import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";

export function initialScene(): Graph {
  return createGraph([
    freePoint("A", -2, -1, "A"),
    freePoint("B", 2, -1, "B"),
    freePoint("C", 0, 2, "C"),

    triangleNode("ABC", "A", "B", "C"),
    segmentNode("AB", "A", "B"),
    midpointNode("M_AB", "AB", "M"),

    centroidNode("G", "ABC", "G"),
  ]);
}
