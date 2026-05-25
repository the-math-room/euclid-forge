import { describe, expect, test } from "vitest";
import { evaluateGraph } from "./evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  curveIntersectionNode,
  freePoint,
  lineNode,
} from "../representation/node";

describe("evaluation/line", () => {
  test("evaluates a line from two points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      lineNode("L", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("L")).toEqual({
      kind: "LINE",
      sourceKind: "LINE",
      id: "L",
      a: vec2(0, 0),
      b: vec2(1, 0),
    });
    expect(evaluated.issues).toEqual([]);
  });

  test("supports curve intersections beyond the defining points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("O", 2, 0, "O"),
      freePoint("R", 3, 0, "R"),
      lineNode("L", "A", "B"),
      circleNode("C", "O", "R"),
      curveIntersectionNode("X", "L", "C", "linear-circle:1", "X"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("X")).toEqual({
      kind: "POINT",
      sourceKind: "CURVE_INTERSECTION",
      id: "X",
      point: vec2(3, 0),
      label: "X",
      role: "INTERSECTION",
    });
    expect(evaluated.issues).toEqual([]);
  });
});
