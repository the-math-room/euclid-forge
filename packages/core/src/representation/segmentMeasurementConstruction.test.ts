import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import {
  freePoint,
  segmentMeasurementNode,
  segmentNode,
} from "./node";
import { segmentMeasurementConstruction } from "./constructions";

describe("representation/segmentMeasurementConstruction", () => {
  test("creates a segment measurement for a segment", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    expect(segmentMeasurementConstruction(graph, "AB")).toEqual([
      segmentMeasurementNode("M_AB", "AB"),
    ]);
  });

  test("does not duplicate an existing segment measurement", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
      segmentMeasurementNode("M_AB", "AB"),
    ]);

    expect(segmentMeasurementConstruction(graph, "AB")).toEqual([]);
  });
});
