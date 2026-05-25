import { describe, expect, test } from "vitest";
import { lineIntersectionConstruction } from "./constructions";
import { createGraph } from "./graph";
import {
  freePoint,
  lineIntersectionNode,
  segmentNode,
  triangleNode,
} from "./node";

describe("representation/line intersection construction", () => {
  test("creates a line intersection from two segments", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
    ]);

    expect(lineIntersectionConstruction(graph, "AB", "CD")).toEqual([
      lineIntersectionNode("X1", "AB", "CD", "X1"),
    ]);
  });

  test("does not duplicate reversed segment pairs", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
      lineIntersectionNode("X1", "CD", "AB", "X1"),
    ]);

    expect(lineIntersectionConstruction(graph, "AB", "CD")).toEqual([]);
  });

  test("rejects invalid line intersection inputs", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() => lineIntersectionConstruction(graph, "AB", "AB")).toThrow(
      "Cannot create line intersection from duplicate segments",
    );
    expect(() => lineIntersectionConstruction(graph, "AB", "missing")).toThrow(
      "Cannot create line intersection with missing segment: missing",
    );
    expect(() => lineIntersectionConstruction(graph, "AB", "ABC")).toThrow(
      "Cannot create line intersection with non-segment: ABC",
    );
  });
});
