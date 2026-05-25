import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "./graph";
import { freePoint, segmentNode } from "./node";
import { nextFreePointId, planFreePoint } from "./freePointPlanning";

describe("representation/freePointPlanning", () => {
  test("chooses P1 for an empty graph", () => {
    const graph = createGraph([]);

    expect(nextFreePointId(graph)).toBe("P1");
  });

  test("chooses the first available P-number", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P3", 3, 0, "P3"),
    ]);

    expect(nextFreePointId(graph)).toBe("P2");
  });

  test("ignores non-free-point ids when choosing a P-number if they collide", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("P1", "A", "B"),
    ]);

    expect(nextFreePointId(graph)).toBe("P2");
  });

  test("plans a free point node at the next id", () => {
    const graph = createGraph([freePoint("P1", 0, 0, "P1")]);

    expect(planFreePoint(graph, vec2(2, 3))).toEqual({
      id: "P2",
      node: freePoint("P2", 2, 3, "P2"),
    });
  });
});
