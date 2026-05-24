import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import {
  applyGraphEdit,
} from "./edit";
import { createGraph } from "./graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "./node";

describe("representation/applyGraphEdit", () => {
  test("adds a free point with the next available point id", () => {
    const graph = createGraph([freePoint("P1", 0, 0, "P1")]);

    const next = applyGraphEdit(graph, {
      kind: "ADD_FREE_POINT",
      point: vec2(2, 3),
    });

    expect(next.byId.get("P2")).toEqual(freePoint("P2", 2, 3, "P2"));
  });

  test("adds structural nodes", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "ADD_NODES",
      nodes: [triangleNode("ABC", "A", "B", "C")],
    });

    expect(next.byId.get("ABC")).toEqual(triangleNode("ABC", "A", "B", "C"));
  });

  test("adding no structural nodes returns the same graph", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(
      applyGraphEdit(graph, {
        kind: "ADD_NODES",
        nodes: [],
      }),
    ).toBe(graph);
  });

  test("structural add validates missing dependencies through createGraph", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "ADD_NODES",
        nodes: [segmentNode("AB", "A", "B")],
      }),
    ).toThrow("Missing dependency: AB depends on B");
  });

  test("structural add validates duplicate ids through createGraph", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "ADD_NODES",
        nodes: [freePoint("A", 1, 1, "A")],
      }),
    ).toThrow("Duplicate node id: A");
  });

  test("moves a free point", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const next = applyGraphEdit(graph, {
      kind: "MOVE_FREE_POINT",
      id: "A",
      point: vec2(2, 3),
    });

    expect(next.byId.get("A")).toEqual(freePoint("A", 2, 3, "A"));
  });

  test("rejects moving a missing point", () => {
    const graph = createGraph([]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "MOVE_FREE_POINT",
        id: "A",
        point: vec2(2, 3),
      }),
    ).toThrow("Cannot move missing node: A");
  });

  test("rejects directly moving a constrained point", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "MOVE_FREE_POINT",
        id: "M",
        point: vec2(1, 1),
      }),
    ).toThrow("Cannot directly move constrained node: M");
  });

  test("translates free points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 3, "B"),
      freePoint("C", 5, 5, "C"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "TRANSLATE_FREE_POINTS",
      ids: ["A", "B"],
      delta: vec2(10, -1),
    });

    expect(next.byId.get("A")).toEqual(freePoint("A", 10, -1, "A"));
    expect(next.byId.get("B")).toEqual(freePoint("B", 12, 2, "B"));
    expect(next.byId.get("C")).toEqual(freePoint("C", 5, 5, "C"));
  });

  test("sets multiple free point positions", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 3, "B"),
      freePoint("C", 5, 5, "C"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "SET_FREE_POINT_POSITIONS",
      positions: new Map([
        ["A", vec2(10, -1)],
        ["B", vec2(12, 2)],
      ]),
    });

    expect(next.byId.get("A")).toEqual(freePoint("A", 10, -1, "A"));
    expect(next.byId.get("B")).toEqual(freePoint("B", 12, 2, "B"));
    expect(next.byId.get("C")).toEqual(freePoint("C", 5, 5, "C"));
  });

  test("rejects setting a constrained point position", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "SET_FREE_POINT_POSITIONS",
        positions: new Map([["M", vec2(1, 1)]]),
      }),
    ).toThrow("Cannot directly set constrained node position: M");
  });

  test("deletes selected nodes when no unselected dependents exist", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 1, "B"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "DELETE_NODES",
      ids: ["A"],
    });

    expect(next.byId.has("A")).toBe(false);
    expect(next.byId.get("B")).toEqual(freePoint("B", 1, 1, "B"));
  });

  test("deletes a selected subgraph when dependents are included", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "DELETE_NODES",
      ids: ["ABC", "G"],
    });

    expect(next.byId.has("ABC")).toBe(false);
    expect(next.byId.has("G")).toBe(false);
    expect(next.byId.get("A")).toEqual(freePoint("A", 0, 0, "A"));
  });

  test("rejects deleting nodes with unselected dependents", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "DELETE_NODES",
        ids: ["A"],
      }),
    ).toThrow("Cannot delete nodes with unselected dependents");
  });
});
