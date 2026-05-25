import { describe, expect, test } from "vitest";
import { evaluateGraph } from "./evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  curveIntersectionNode,
  freePoint,
  segmentNode,
} from "../representation/node";

describe("evaluation/curve intersection", () => {
  test("evaluates a segment-circle curve intersection branch", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("O", 0, 0, "O"),
      freePoint("R", 1, 0, "R"),
      segmentNode("AB", "A", "B"),
      circleNode("circle", "O", "R"),
      curveIntersectionNode(
        "X",
        "AB",
        "circle",
        "linear-circle:0",
        "X",
      ),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("X")).toEqual({
      kind: "POINT",
      sourceKind: "CURVE_INTERSECTION",
      id: "X",
      point: vec2(-1, 0),
      label: "X",
      role: "INTERSECTION",
    });
    expect(evaluated.issues).toEqual([]);
  });

  test("evaluates a circle-circle curve intersection branch", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("AR", 5, 0, "AR"),
      freePoint("B", 8, 0, "B"),
      freePoint("BR", 13, 0, "BR"),
      circleNode("circleA", "A", "AR"),
      circleNode("circleB", "B", "BR"),
      curveIntersectionNode(
        "X",
        "circleA",
        "circleB",
        "circle-circle:1",
        "X",
      ),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.get("X")).toEqual({
      kind: "POINT",
      sourceKind: "CURVE_INTERSECTION",
      id: "X",
      point: vec2(4, 3),
      label: "X",
      role: "INTERSECTION",
    });
    expect(evaluated.issues).toEqual([]);
  });

  test("omits a curve intersection branch that is not currently defined", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("AR", 1, 0, "AR"),
      freePoint("B", 5, 0, "B"),
      freePoint("BR", 6, 0, "BR"),
      circleNode("circleA", "A", "AR"),
      circleNode("circleB", "B", "BR"),
      curveIntersectionNode(
        "X",
        "circleA",
        "circleB",
        "circle-circle:0",
        "X",
      ),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("X")).toBe(false);
    expect(evaluated.ordered.some((value) => value.id === "X")).toBe(false);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "X",
        message: "Cannot evaluate X; Circles do not intersect",
      },
    ]);
  });

  test("omits a curve intersection with a stale branch key", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("O", 0, 0, "O"),
      freePoint("R", 1, 0, "R"),
      segmentNode("AB", "A", "B"),
      circleNode("circle", "O", "R"),
      curveIntersectionNode(
        "X",
        "AB",
        "circle",
        "circle-circle:0",
        "X",
      ),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("X")).toBe(false);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "X",
        message:
          "Cannot evaluate X; branch circle-circle:0 is not currently defined",
      },
    ]);
  });
});
