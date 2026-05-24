import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import { freePoint, midpointNode, segmentNode } from "../representation/node";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { updateFreePoint } from "./updateFreePoint";

describe("interaction/updateFreePoint", () => {
  test("updates a free point and returns a valid graph", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
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

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      id: "M",
      point: vec2(-1, 1),
      label: "M",
      source: "CONSTRAINED",
    });
  });

  test("does not mutate the previous graph", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    const next = updateFreePoint(graph, "A", vec2(-4, 2));

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, 0, "A"));
    expect(next.byId.get("A")).toEqual(freePoint("A", -4, 2, "A"));
  });

  test("throws when asked to update a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    expect(() => updateFreePoint(graph, "M", vec2(0, 1))).toThrow(
      "Cannot directly update constrained node: M",
    );
  });

  test("throws when asked to update a missing node", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
    ]);

    expect(() => updateFreePoint(graph, "Z", vec2(0, 1))).toThrow(
      "Cannot update missing node: Z",
    );
  });
});
