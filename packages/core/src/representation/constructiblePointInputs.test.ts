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
  circleConstruction,
  segmentConstruction,
  triangleConstruction,
} from "./constructions";

function graphWithDerivedPoints() {
  return createGraph([
    freePoint("A", 0, 0, "A"),
    freePoint("B", 2, 0, "B"),
    freePoint("C", 0, 2, "C"),
    segmentNode("AB", "A", "B"),
    midpointNode("M", "AB", "M"),
    triangleNode("ABC", "A", "B", "C"),
    centroidNode("G", "ABC", "G"),
  ]);
}

describe("representation/constructible point inputs", () => {
  test("creates a segment from derived point endpoints", () => {
    expect(segmentConstruction(graphWithDerivedPoints(), "M", "G")).toEqual([
      expect.objectContaining({
        kind: "SEGMENT",
        a: "M",
        b: "G",
      }),
    ]);
  });

  test("creates a circle from derived center and through points", () => {
    expect(circleConstruction(graphWithDerivedPoints(), "G", "M")).toEqual([
      expect.objectContaining({
        kind: "CIRCLE",
        center: "G",
        through: "M",
      }),
    ]);
  });

  test("creates a triangle from mixed free and derived vertices", () => {
    expect(
      triangleConstruction(graphWithDerivedPoints(), ["A", "M", "G"]),
    ).toEqual([
      expect.objectContaining({
        kind: "TRIANGLE",
        a: "A",
        b: "M",
        c: "G",
      }),
    ]);
  });

  test("still rejects non-point construction inputs", () => {
    expect(() =>
      segmentConstruction(graphWithDerivedPoints(), "AB", "G"),
    ).toThrow("Cannot create segment with constrained endpoint: AB");
    expect(() =>
      circleConstruction(graphWithDerivedPoints(), "ABC", "G"),
    ).toThrow("Cannot create circle with constrained point: ABC");
    expect(() =>
      triangleConstruction(graphWithDerivedPoints(), ["A", "M", "AB"]),
    ).toThrow("Cannot create triangle with constrained vertex: AB");
  });
});
