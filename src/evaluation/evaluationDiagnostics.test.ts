import { describe, expect, test } from "vitest";
import { evaluateGraph } from "./evaluateGraph";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  curveIntersectionNode,
  freePoint,
} from "../representation/node";

describe("evaluation diagnostics", () => {
  test("undefined geometry issues include stable diagnostic codes", () => {
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

    expect(evaluateGraph(graph).issues).toEqual([
      {
        nodeId: "X",
        code: "NO_REAL_INTERSECTION",
        message: "Cannot evaluate X; Circles do not intersect",
      },
    ]);
  });
});
