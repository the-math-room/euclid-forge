import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import { freePoint, segmentNode } from "./node";
import { parallelSegmentConstruction } from "./constructions";

describe("representation/parallelSegmentConstruction", () => {
  test("creates a constrained endpoint and ordinary segment", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
    ]);

    expect(parallelSegmentConstruction(graph, "AB", "C", 2)).toEqual([
      {
        kind: "LINEAR_CONSTRAINED_POINT",
        id: "LP_AB_C",
        reference: "AB",
        anchor: "C",
        mode: "PARALLEL",
        offset: 2,
        label: "D",
      },
      {
        kind: "SEGMENT",
        id: "S_C_LP_AB_C",
        a: "C",
        b: "LP_AB_C",
      },
    ]);
  });

  test("does not duplicate an existing constrained endpoint and segment", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
      ...parallelSegmentConstruction(
        createGraph([
          freePoint("A", 0, 0, "A"),
          freePoint("B", 2, 0, "B"),
          freePoint("C", 0, 1, "C"),
          segmentNode("AB", "A", "B"),
        ]),
        "AB",
        "C",
        2,
      ),
    ]);

    expect(parallelSegmentConstruction(graph, "AB", "C", 2)).toEqual([]);
  });
});
