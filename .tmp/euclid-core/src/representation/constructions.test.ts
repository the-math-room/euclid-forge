import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import {
  centroidNode,
  circleNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "./node";
import {
  centroidConstruction,
  circleConstruction,
  segmentConstruction,
  triangleConstruction,
  triangleSideMidpointConstruction,
} from "./constructions";

describe("representation/constructions", () => {
  test("creates a circle construction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);

    expect(circleConstruction(graph, "A", "B")).toEqual([
      circleNode("C1", "A", "B"),
    ]);
  });

  test("does not duplicate an existing circle construction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      circleNode("C1", "A", "B"),
    ]);

    expect(circleConstruction(graph, "A", "B")).toEqual([]);
  });

  test("rejects duplicate circle points", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() => circleConstruction(graph, "A", "A")).toThrow(
      "Cannot create circle from duplicate points",
    );
  });

  test("creates a triangle construction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
    ]);

    expect(triangleConstruction(graph, ["A", "B", "C"])).toEqual([
      triangleNode("T1", "A", "B", "C"),
    ]);
  });

  test("rejects duplicate triangle vertices", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);

    expect(() => triangleConstruction(graph, ["A", "B", "A"])).toThrow(
      "Cannot create triangle from duplicate vertices",
    );
  });

  test("creates a centroid construction unless it already exists", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(centroidConstruction(graph, "ABC")).toEqual([
      centroidNode("G1", "ABC", "G1"),
    ]);

    const withCentroid = createGraph([
      ...graph.nodes,
      centroidNode("G1", "ABC", "G1"),
    ]);

    expect(centroidConstruction(withCentroid, "ABC")).toEqual([]);
  });

  test("creates missing triangle side segments and midpoints", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(triangleSideMidpointConstruction(graph, "ABC")).toEqual([
      segmentNode("S_A_B", "A", "B"),
      midpointNode("M_S_A_B", "S_A_B", "M_S_A_B"),
      segmentNode("S_B_C", "B", "C"),
      midpointNode("M_S_B_C", "S_B_C", "M_S_B_C"),
      segmentNode("S_A_C", "C", "A"),
      midpointNode("M_S_A_C", "S_A_C", "M_S_A_C"),
    ]);
  });

  test("reuses existing side segments and midpoints", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    expect(triangleSideMidpointConstruction(graph, "ABC")).toEqual([
      segmentNode("S_B_C", "B", "C"),
      midpointNode("M_S_B_C", "S_B_C", "M_S_B_C"),
      segmentNode("S_A_C", "C", "A"),
      midpointNode("M_S_A_C", "S_A_C", "M_S_A_C"),
    ]);
  });
  test("creates a segment from two free points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);

    expect(segmentConstruction(graph, "A", "B")).toEqual([
      segmentNode("S_A_B", "A", "B"),
    ]);
  });

  test("does not duplicate an existing segment in reverse endpoint order", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "B", "A"),
    ]);

    expect(segmentConstruction(graph, "A", "B")).toEqual([]);
  });

  test("rejects invalid segment endpoints", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() => segmentConstruction(graph, "A", "A")).toThrow(
      "Cannot create segment from duplicate endpoints",
    );
    expect(() => segmentConstruction(graph, "A", "missing")).toThrow(
      "Cannot create segment with missing endpoint: missing",
    );
    expect(() => segmentConstruction(graph, "A", "ABC")).toThrow(
      "Cannot create segment with constrained endpoint: ABC",
    );
  });

});
