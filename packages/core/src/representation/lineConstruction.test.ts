import { describe, expect, test } from "vitest";
import { lineConstruction } from "./constructions";
import { createGraph } from "./graph";
import { freePoint, lineNode, triangleNode } from "./node";

describe("representation/line construction", () => {
  test("creates a line from two constructible points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);

    expect(lineConstruction(graph, "A", "B")).toEqual([
      lineNode("L_A_B", "A", "B"),
    ]);
  });

  test("does not duplicate an existing line in reverse endpoint order", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      lineNode("AB", "B", "A"),
    ]);

    expect(lineConstruction(graph, "A", "B")).toEqual([]);
  });

  test("rejects invalid line endpoints", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() => lineConstruction(graph, "A", "A")).toThrow(
      "Cannot create line from duplicate points",
    );
    expect(() => lineConstruction(graph, "A", "missing")).toThrow(
      "Cannot create line with missing point: missing",
    );
    expect(() => lineConstruction(graph, "A", "ABC")).toThrow(
      "Cannot create line with constrained point: ABC",
    );
  });
});
