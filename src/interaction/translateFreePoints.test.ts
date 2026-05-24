import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  triangleNode,
  triangleSideMidpointNode,
} from "../representation/node";
import { translateFreePoints } from "./translateFreePoints";

describe("interaction/translateFreePoints", () => {
  test("translates multiple free points and returns a valid graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const next = translateFreePoints(graph, ["A", "B", "C"], vec2(1, 0.5));
    const evaluated = evaluateGraph(next);

    expect(evaluated.values.get("ABC")).toEqual({
      kind: "TRIANGLE",
      id: "ABC",
      a: vec2(-1, -0.5),
      b: vec2(3, -0.5),
      c: vec2(1, 2.5),
    });

    expect(evaluated.values.get("M_AB")).toEqual({
      kind: "POINT",
      id: "M_AB",
      point: vec2(1, -0.5),
      label: "M",
      role: "MIDPOINT",
    });

    expect(evaluated.values.get("G")).toEqual({
      kind: "POINT",
      id: "G",
      point: vec2(1, 0.5),
      label: "G",
      role: "CENTROID",
    });
  });

  test("does not mutate the previous graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    const next = translateFreePoints(graph, ["A", "B"], vec2(1, 1));

    expect(graph.byId.get("A")).toEqual(freePoint("A", -2, -1, "A"));
    expect(next.byId.get("A")).toEqual(freePoint("A", -1, 0, "A"));
  });

  test("throws when asked to translate a constrained node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() => translateFreePoints(graph, ["ABC"], vec2(1, 1))).toThrow(
      "Cannot directly translate constrained node: ABC",
    );
  });

  test("throws when asked to translate a missing node", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    expect(() => translateFreePoints(graph, ["Z"], vec2(1, 1))).toThrow(
      "Cannot translate missing node: Z",
    );
  });
});
