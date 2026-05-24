import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "./node";

describe("representation/createGraph", () => {
  test("orders dependencies before dependents", () => {
    const graph = createGraph([
      centroidNode("G", "ABC", "G"),
      midpointNode("M", "AB", "M"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
      freePoint("C", 0, 2, "C"),
      freePoint("B", 2, 0, "B"),
      freePoint("A", -2, 0, "A"),
    ]);

    const ids = graph.nodes.map((node) => node.id);

    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("C")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("AB")).toBeLessThan(ids.indexOf("M"));
    expect(ids.indexOf("ABC")).toBeLessThan(ids.indexOf("G"));
  });

  test("throws when a centroid dependency is missing", () => {
    expect(() => createGraph([centroidNode("G", "ABC", "G")])).toThrow(
      "Missing dependency: G depends on ABC",
    );
  });
});
