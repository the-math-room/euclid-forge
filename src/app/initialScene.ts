import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import { freePoint, midpointNode, segmentNode } from "../representation/node";

export function initialScene(): Graph {
  return createGraph([
    freePoint("A", -2, -1, "A"),
    freePoint("B", 2, -1, "B"),
    freePoint("C", 0, 2, "C"),

    segmentNode("AB", "A", "B"),
    segmentNode("BC", "B", "C"),
    segmentNode("CA", "C", "A"),

    midpointNode("M_AB", "AB", "M"),
  ]);
}
