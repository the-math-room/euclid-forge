import { describe, expect, test } from "vitest";
import { segmentIntersectionConstruction } from "./constructions";
import { createGraph } from "./graph";
import {
  freePoint,
  segmentIntersectionNode,
  segmentNode,
  triangleNode,
} from "./node";

describe("representation/segment intersection construction", () => {
  test("creates a segment intersection from two segments", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
    ]);

    expect(segmentIntersectionConstruction(graph, "AB", "CD")).toEqual([
      segmentIntersectionNode("X1", "AB", "CD", "E"),
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
      segmentIntersectionNode("X1", "CD", "AB", "X1"),
    ]);

    expect(segmentIntersectionConstruction(graph, "AB", "CD")).toEqual([]);
  });

  test("rejects invalid segment intersection inputs", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() => segmentIntersectionConstruction(graph, "AB", "AB")).toThrow(
      "Cannot create segment intersection from duplicate segments",
    );
    expect(() =>
      segmentIntersectionConstruction(graph, "AB", "missing"),
    ).toThrow(
      "Cannot create segment intersection with missing segment: missing",
    );
    expect(() => segmentIntersectionConstruction(graph, "AB", "ABC")).toThrow(
      "Cannot create segment intersection with non-segment: ABC",
    );
  });
});
