import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { createGraph } from "../representation/graph";
import {
  freePoint,
  lineNode,
  linearConstrainedPointNode,
  segmentNode,
} from "../representation/node";

describe("geometry/linearConstrainedPoint", () => {
  test("evaluates a constrained point along a segment reference direction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 3, 4, "B"),
      freePoint("C", 10, 10, "C"),
      segmentNode("AB", "A", "B"),
      linearConstrainedPointNode("D", "AB", "C", "PARALLEL", 5, "D"),
    ]);

    const evaluated = evaluateGraph(graph).values.get("D");

    expect(evaluated).toEqual({
      kind: "POINT",
      sourceKind: "LINEAR_CONSTRAINED_POINT",
      id: "D",
      point: {
        x: 13,
        y: 14,
      },
      label: "D",
      role: "INTERSECTION",
    });
  });

  test("evaluates a constrained point along a line reference direction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 0, 2, "B"),
      freePoint("C", 1, 1, "C"),
      lineNode("line", "A", "B"),
      linearConstrainedPointNode("D", "line", "C", "PARALLEL", -3, "D"),
    ]);

    const evaluated = evaluateGraph(graph).values.get("D");

    expect(evaluated).toEqual({
      kind: "POINT",
      sourceKind: "LINEAR_CONSTRAINED_POINT",
      id: "D",
      point: {
        x: 1,
        y: -2,
      },
      label: "D",
      role: "INTERSECTION",
    });
  });

  test("evaluates a constrained point along a perpendicular segment reference direction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 1, 1, "C"),
      segmentNode("AB", "A", "B"),
      linearConstrainedPointNode("D", "AB", "C", "PERPENDICULAR", 3, "D"),
    ]);

    const evaluated = evaluateGraph(graph).values.get("D");

    expect(evaluated).toEqual({
      kind: "POINT",
      sourceKind: "LINEAR_CONSTRAINED_POINT",
      id: "D",
      point: {
        x: 1,
        y: 4,
      },
      label: "D",
      role: "INTERSECTION",
    });
  });

  test("reports an issue when the reference is not linear", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      linearConstrainedPointNode("D", "C", "A", "PARALLEL", 1, "D"),
    ]);

    expect(evaluateGraph(graph).issues).toEqual([
      {
        nodeId: "D",
        severity: "warning",
        code: "UNDEFINED_GEOMETRY",
        message:
          "Cannot evaluate D; reference C is not a non-degenerate line or segment",
      },
    ]);
  });
});
