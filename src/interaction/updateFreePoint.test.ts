import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
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
    ]);

    const next = updateFreePoint(graph, "A", vec2(-4, 2));
    const evaluated = evaluateGraph(next);

    expect(evaluated.values.get("A")).toEqual({
      kind: "POINT",
      id: "A",
      point: vec2(-4, 2),
      label: "A",
      source: "FREE",
    });

    expect(evaluated.values.get("ABC")).toEqual({
      kind: "TRIANGLE",
      id: "ABC",
      a: vec2(-4, 2),
      b: vec2(2, -1),
      c: vec2(0, 2),
    });

    expect(evaluated.values.get("AB")).toEqual({
      kind: "SEGMENT",
      id: "AB",
      a: vec2(-4, 2),
      b: vec2(2, -1),
    });

    expect(evaluated.values.get("M_AB")).toEqual({
      kind: "POINT",
      id: "M_AB",
      point: vec2(-1, 0.5),
      label: "M",
      source: "CONSTRAINED",
    });
  });

  test("does not mutate the previous graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    const next = updateFreePoint(graph, "A", vec2(-4, 2));

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, -1, "A"));
    expect(next.byId.get("A")).toEqual(freePoint("A", -4, 2, "A"));
  });

  test("throws when asked to update a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    expect(() => updateFreePoint(graph, "M_AB", vec2(0, 1))).toThrow(
      "Cannot directly update constrained node: M_AB",
    );
  });

  test("throws when asked to update a missing node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    expect(() => updateFreePoint(graph, "Z", vec2(0, 1))).toThrow(
      "Cannot update missing node: Z",
    );
  });
});
