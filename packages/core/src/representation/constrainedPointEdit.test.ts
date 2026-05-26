import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { createGraph } from "./graph";
import { applyGraphEdit } from "./edit";
import { freePoint, linearConstrainedPointNode, segmentNode } from "./node";

describe("representation/constrained point edits", () => {
  test("moves a parallel point by updating its offset along the reference direction", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
      linearConstrainedPointNode("D", "AB", "C", "PARALLEL", 1, "D"),
    ]);

    const next = applyGraphEdit(graph, {
      kind: "MOVE_CONSTRAINED_POINT",
      id: "D",
      point: {
        x: 4,
        y: 99,
      },
    });

    expect(next.byId.get("D")).toEqual({
      kind: "LINEAR_CONSTRAINED_POINT",
      id: "D",
      reference: "AB",
      anchor: "C",
      mode: "PARALLEL",
      offset: 4,
      label: "D",
    });

    expect(evaluateGraph(next).values.get("D")).toEqual({
      kind: "POINT",
      sourceKind: "LINEAR_CONSTRAINED_POINT",
      id: "D",
      point: {
        x: 4,
        y: 1,
      },
      label: "D",
      role: "INTERSECTION",
    });
  });

  test("rejects constrained movement for ordinary free points", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "MOVE_CONSTRAINED_POINT",
        id: "A",
        point: {
          x: 1,
          y: 1,
        },
      }),
    ).toThrow("Cannot move non-constrained point: A");
  });
});
