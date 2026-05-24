import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { applyGraphEdit } from "./edit";
import { createGraph } from "./graph";
import { centroidNode, freePoint, triangleNode } from "./node";

describe("representation/applyGraphEdit", () => {
  test("adds a free point with the next available generated id", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 1, 1, "P2"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "ADD_FREE_POINT",
      point: vec2(2, 3),
    });

    expect(next.byId.get("P3")).toEqual(freePoint("P3", 2, 3, "P3"));
    expect(graph.byId.get("P3")).toBeUndefined();
  });

  test("moves a free point without mutating the previous graph", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const next = applyGraphEdit(graph, {
      kind: "MOVE_FREE_POINT",
      id: "A",
      point: vec2(4, 5),
    });

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, -1, "A"));
    expect(next.byId.get("A")).toEqual(freePoint("A", 4, 5, "A"));
  });

  test("translates multiple free points", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "TRANSLATE_FREE_POINTS",
      ids: ["A", "B", "C"],
      delta: vec2(1, 0.5),
    });

    expect(next.byId.get("A")).toEqual(freePoint("A", -1, -0.5, "A"));
    expect(next.byId.get("B")).toEqual(freePoint("B", 3, -0.5, "B"));
    expect(next.byId.get("C")).toEqual(freePoint("C", 1, 2.5, "C"));
  });

  test("adds a triangle from three free points", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "ADD_TRIANGLE",
      vertices: ["P1", "P2", "P3"],
    });

    expect(next.byId.get("T1")).toEqual(triangleNode("T1", "P1", "P2", "P3"));
  });

  test("chooses the next available triangle id", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "ADD_TRIANGLE",
      vertices: ["P1", "P3", "P2"],
    });

    expect(next.byId.get("T2")).toEqual(triangleNode("T2", "P1", "P3", "P2"));
  });

  test("throws when creating a triangle from duplicate vertices", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "ADD_TRIANGLE",
        vertices: ["P1", "P2", "P1"],
      }),
    ).toThrow("Cannot create triangle from duplicate vertices");
  });

  test("throws when creating a triangle with a constrained vertex", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "ADD_TRIANGLE",
        vertices: ["A", "B", "G"],
      }),
    ).toThrow("Cannot create triangle with constrained vertex: G");
  });

  test("throws when moving a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "MOVE_FREE_POINT",
        id: "ABC",
        point: vec2(1, 1),
      }),
    ).toThrow("Cannot directly move constrained node: ABC");
  });

  test("throws when translating a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "TRANSLATE_FREE_POINTS",
        ids: ["ABC"],
        delta: vec2(1, 1),
      }),
    ).toThrow("Cannot directly translate constrained node: ABC");
  });
});
