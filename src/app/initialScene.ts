import type { Scene } from "../evaluation/evaluateScene";
import { freePoint, midpointNode, segmentNode } from "../representation/node";

export function initialScene(): Scene {
  return {
    nodes: [
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ],
  };
}
