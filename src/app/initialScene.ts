import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  triangleNode,
  triangleSideMidpointNode,
} from "../representation/node";

export function initialScene(): Graph {
  return createGraph([
    freePoint("A", -2, -1, "A"),
    freePoint("B", 2, -1, "B"),
    freePoint("C", 0, 2, "C"),

    triangleNode("ABC", "A", "B", "C"),
    triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),

    centroidNode("G", "ABC", "G"),
  ]);
}
