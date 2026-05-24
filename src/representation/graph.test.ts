import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import { freePoint, midpointNode, segmentNode } from "./node";

describe("representation/createGraph", () => {
  test("orders dependencies before dependents", () => {
    const graph = createGraph([
      midpointNode("M", "AB", "M"),
      segmentNode("AB", "A", "B"),
      freePoint("B", 2, 0, "B"),
      freePoint("A", -2, 0, "A"),
    ]);

    const ids = graph.nodes.map((node) => node.id);

    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("AB")).toBeLessThan(ids.indexOf("M"));
  });

  test("exposes nodes by id", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, 0, "A"));
    expect(graph.byId.get("AB")).toEqual(segmentNode("AB", "A", "B"));
  });

  test("throws when a dependency is missing", () => {
    expect(() =>
      createGraph([
        freePoint("A", -2, 0, "A"),
        segmentNode("AB", "A", "B"),
      ]),
    ).toThrow("Missing dependency: AB depends on B");
  });

  test("throws when node ids are duplicated", () => {
    expect(() =>
      createGraph([
        freePoint("A", -2, 0, "A"),
        freePoint("A", 2, 0, "A2"),
      ]),
    ).toThrow("Duplicate node id: A");
  });
});
