import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  freePoint,
  lineIntersectionNode,
  segmentNode,
} from "../representation/node";
import { evaluateGraph } from "./evaluateGraph";

describe("evaluation/line intersection", () => {
  test("evaluates a line intersection point", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
      lineIntersectionNode("X", "AB", "CD", "X"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("X")).toEqual({
      kind: "POINT",
      sourceKind: "LINE_INTERSECTION",
      id: "X",
      point: vec2(0, 0),
      label: "X",
      role: "INTERSECTION",
    });
    expect(evaluated.issues).toEqual([]);
  });

  test("omits parallel line intersections and records an issue", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      freePoint("D", 1, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
      lineIntersectionNode("X", "AB", "CD", "X"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("X")).toBe(false);
    expect(evaluated.ordered.some((value) => value.id === "X")).toBe(false);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "X",
        message:
          "Cannot evaluate X; lines AB and CD are parallel or coincident",
      },
    ]);
  });

  test("omits dependents of undefined line intersections", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      freePoint("D", 1, 1, "D"),
      freePoint("E", 2, 2, "E"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
      lineIntersectionNode("X", "AB", "CD", "X"),
      circleNode("circle", "X", "E"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("X")).toBe(false);
    expect(evaluated.values.has("circle")).toBe(false);
    expect(evaluated.issues.map((issue) => issue.nodeId)).toEqual([
      "X",
      "circle",
    ]);
  });
});
