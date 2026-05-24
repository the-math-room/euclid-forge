import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import { freePoint, midpointNode, segmentNode } from "../representation/node";

export function initialScene(): Graph {
  return createGraph([
    freePoint("A", -2, 0, "A"),
    freePoint("B", 2, 0, "B"),
    segmentNode("AB", "A", "B"),
    midpointNode("M", "AB", "M"),
  ]);
}
