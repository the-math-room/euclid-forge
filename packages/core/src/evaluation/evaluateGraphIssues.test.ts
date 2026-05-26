import { describe, expect, test } from "vitest";
import { evaluateGraph } from "./evaluateGraph";
import { createGraph } from "../representation/graph";
import {
  freePoint,
  linearConstrainedPointNode,
  segmentNode,
} from "../representation/node";

describe("evaluation/evaluateGraph partial issues", () => {
  test("omits nodes that report evaluation issues", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("C", 1, 1, "C"),
      linearConstrainedPointNode("D", "C", "A", "PARALLEL", 1, "D"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("D")).toBe(false);
    expect(evaluated.ordered.map((value) => value.id)).toEqual(["A", "C"]);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "D",
        severity: "warning",
        code: "UNDEFINED_GEOMETRY",
        message:
          "Cannot evaluate D; reference C is not a non-degenerate line or segment",
      },
    ]);
  });

  test("omits dependents when an evaluated dependency is unavailable", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("C", 1, 1, "C"),
      linearConstrainedPointNode("D", "C", "A", "PARALLEL", 1, "D"),
      freePoint("B", 2, 0, "B"),
      segmentNode("DB", "D", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("D")).toBe(false);
    expect(evaluated.values.has("DB")).toBe(false);
    expect(evaluated.values.has("B")).toBe(true);
    expect(evaluated.ordered.map((value) => value.id)).toEqual(["A", "C", "B"]);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "D",
        severity: "warning",
        code: "UNDEFINED_GEOMETRY",
        message:
          "Cannot evaluate D; reference C is not a non-degenerate line or segment",
      },
      {
        nodeId: "DB",
        severity: "warning",
        code: "MISSING_DEPENDENCY",
        message: "Cannot evaluate DB; Missing evaluated dependency: D",
      },
    ]);
  });
});
