import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { createGraph } from "../representation/graph";
import { freePoint, segmentMeasurementNode, segmentNode } from "../representation/node";

describe("geometry/segmentMeasurement", () => {
  test("evaluates a segment measurement label from segment length", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 3, 4, "B"),
      segmentNode("AB", "A", "B"),
      segmentMeasurementNode("M_AB", "AB"),
    ]);

    expect(evaluateGraph(graph).values.get("M_AB")).toEqual({
      kind: "SEGMENT_MEASUREMENT",
      sourceKind: "SEGMENT_MEASUREMENT",
      id: "M_AB",
      segment: "AB",
      a: {
        x: 0,
        y: 0,
      },
      b: {
        x: 3,
        y: 4,
      },
      length: 5,
      label: "5",
    });
  });

  test("keeps non-integer lengths visible in auto format", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1.01, 0, "B"),
      segmentNode("AB", "A", "B"),
      segmentMeasurementNode("M_AB", "AB"),
    ]);

    expect(evaluateGraph(graph).values.get("M_AB")).toMatchObject({
      kind: "SEGMENT_MEASUREMENT",
      length: 1.01,
      label: "1.01",
    });
  });
});
