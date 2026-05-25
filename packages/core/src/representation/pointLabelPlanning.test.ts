import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import { freePoint, midpointNode, segmentNode } from "./node";
import {
  alphabeticLabelForIndex,
  nextAlphabeticLabel,
  nextPointLabel,
  nextPointLabels,
} from "./pointLabelPlanning";

describe("representation/pointLabelPlanning", () => {
  test("maps zero-based indices to geometry labels", () => {
    expect(alphabeticLabelForIndex(0)).toBe("A");
    expect(alphabeticLabelForIndex(1)).toBe("B");
    expect(alphabeticLabelForIndex(25)).toBe("Z");
    expect(alphabeticLabelForIndex(26)).toBe("AA");
    expect(alphabeticLabelForIndex(27)).toBe("AB");
  });

  test("chooses the first unused point label", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "A"),
      freePoint("P2", 1, 0, "B"),
    ]);

    expect(nextPointLabel(graph)).toBe("C");
  });

  test("counts derived point labels as used", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "C"),
    ]);

    expect(nextPointLabel(graph)).toBe("D");
  });

  test("ignores non-point geometry ids when choosing labels", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("C", "A", "B"),
    ]);

    expect(nextPointLabel(graph)).toBe("C");
  });

  test("allocates multiple labels without repeating within the batch", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(nextPointLabels(graph, 3)).toEqual(["B", "C", "D"]);
  });

  test("can allocate from an arbitrary used-label set", () => {
    expect(nextAlphabeticLabel(new Set(["A", "B", "D"]))).toBe("C");
  });
});
