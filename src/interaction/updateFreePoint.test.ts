import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import { updateFreePoint } from "./updateFreePoint";

describe("interaction/updateFreePoint", () => {
  test("updates a free point and returns a valid graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const next = updateFreePoint(graph, "A", vec2(-4, 2));
    const evaluated = evaluateGraph(next);

    expect(evaluated.values.get("G")).toEqual({
      kind: "POINT",
      id: "G",
      point: vec2(-2 / 3, 1),
      label: "G",
      role: "CENTROID",
    });
  });

  test("throws when asked to update a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    expect(() => updateFreePoint(graph, "G", vec2(0, 1))).toThrow(
      "Cannot directly update constrained node: G",
    );
  });
});
