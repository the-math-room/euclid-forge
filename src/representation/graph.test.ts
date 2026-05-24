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

    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("C")).toBeLessThan(ids.indexOf("ABC"));
    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("AB")).toBeLessThan(ids.indexOf("M"));
    expect(ids.indexOf("ABC")).toBeLessThan(ids.indexOf("G"));
  });

  test("exposes nodes by id", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, 0, "A"));
    expect(graph.byId.get("ABC")).toEqual(triangleNode("ABC", "A", "B", "C"));
    expect(graph.byId.get("AB")).toEqual(segmentNode("AB", "A", "B"));
    expect(graph.byId.get("M_AB")).toEqual(midpointNode("M_AB", "AB", "M"));
  });

  test("throws when a triangle dependency is missing", () => {
    expect(() =>
      createGraph([
        freePoint("A", -2, 0, "A"),
        triangleNode("ABC", "A", "B", "C"),
      ]),
    ).toThrow("Missing dependency: ABC depends on B");
  });

  test("throws when a midpoint segment dependency is missing", () => {
    expect(() => createGraph([midpointNode("M_AB", "AB", "M")])).toThrow(
      "Missing dependency: M_AB depends on AB",
    );
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
