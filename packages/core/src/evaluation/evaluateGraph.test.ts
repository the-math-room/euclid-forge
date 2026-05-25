import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  circleNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import { evaluateGraph } from "./evaluateGraph";

describe("evaluation/evaluateGraph", () => {
  test("evaluates a circle from center and through points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 3, 4, "B"),
      circleNode("c", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("c")).toEqual({
      kind: "CIRCLE",
      sourceKind: "CIRCLE",
      id: "c",
      center: vec2(0, 0),
      radius: 5,
    });
  });

  test("evaluates free points", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(-2, 0),
      label: "A",
      role: "FREE",
    });

    expect(evaluated.values.get("B")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "B",
      point: vec2(2, 0),
      label: "B",
      role: "FREE",
    });
  });

  test("evaluates a segment midpoint", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      sourceKind: "MIDPOINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      role: "MIDPOINT",
    });
  });

  test("evaluates a triangle centroid", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("G")).toEqual({
      kind: "POINT",
      sourceKind: "CENTROID",
      id: "G",
      point: vec2(0, 0),
      label: "G",
      role: "CENTROID",
    });
  });

  test("evaluates unordered graph nodes after graph validation orders them", () => {
    const graph = createGraph([
      centroidNode("G", "ABC", "G"),
      midpointNode("M", "AB", "M"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
      freePoint("C", 0, 2, "C"),
      freePoint("B", 2, 0, "B"),
      freePoint("A", -2, 0, "A"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("ABC")).toEqual({
      kind: "TRIANGLE",
      sourceKind: "TRIANGLE",
      id: "ABC",
      a: vec2(-2, 0),
      b: vec2(2, 0),
      c: vec2(0, 2),
    });

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      sourceKind: "MIDPOINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      role: "MIDPOINT",
    });

    expect(evaluated.values.get("G")).toEqual({
      kind: "POINT",
      sourceKind: "CENTROID",
      id: "G",
      point: vec2(0, 2 / 3),
      label: "G",
      role: "CENTROID",
    });
  });

  test("evaluates a triangle with segment midpoint and centroid constructions", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("ABC")).toEqual({
      kind: "TRIANGLE",
      sourceKind: "TRIANGLE",
      id: "ABC",
      a: vec2(-2, -1),
      b: vec2(2, -1),
      c: vec2(0, 2),
    });

    expect(evaluated.values.get("M_AB")).toEqual({
      kind: "POINT",
      sourceKind: "MIDPOINT",
      id: "M_AB",
      point: vec2(0, -1),
      label: "M",
      role: "MIDPOINT",
    });

    expect(evaluated.values.get("G")).toEqual({
      kind: "POINT",
      sourceKind: "CENTROID",
      id: "G",
      point: vec2(0, 0),
      label: "G",
      role: "CENTROID",
    });
  });
  test("returns an empty issue list for fully defined geometry", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.issues).toEqual([]);
  });
});
