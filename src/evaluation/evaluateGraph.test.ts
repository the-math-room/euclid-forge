import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import { freePoint, midpointNode, segmentNode } from "../representation/node";
import { evaluateGraph } from "./evaluateGraph";

describe("evaluation/evaluateGraph", () => {
  test("evaluates free points", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("A")).toEqual({
      kind: "POINT",
      id: "A",
      point: vec2(-2, 0),
      label: "A",
      source: "FREE",
    });

    expect(evaluated.values.get("B")).toEqual({
      kind: "POINT",
      id: "B",
      point: vec2(2, 0),
      label: "B",
      source: "FREE",
    });
  });

  test("evaluates a segment from two free points", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("AB")).toEqual({
      kind: "SEGMENT",
      id: "AB",
      a: vec2(-2, 0),
      b: vec2(2, 0),
    });
  });

  test("evaluates a constrained midpoint of a segment", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      source: "CONSTRAINED",
    });
  });

  test("evaluates unordered graph nodes after graph validation orders them", () => {
    const graph = createGraph([
      midpointNode("M", "AB", "M"),
      segmentNode("AB", "A", "B"),
      freePoint("B", 2, 0, "B"),
      freePoint("A", -2, 0, "A"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("AB")).toEqual({
      kind: "SEGMENT",
      id: "AB",
      a: vec2(-2, 0),
      b: vec2(2, 0),
    });

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      source: "CONSTRAINED",
    });
  });
});
