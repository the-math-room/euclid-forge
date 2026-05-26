import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { createGraph } from "./graph";
import { applyGraphEdit } from "./edit";
import { freePoint } from "./node";

describe("representation/label offset edits", () => {
  test("sets a point label offset and carries it into evaluation", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const next = applyGraphEdit(graph, {
      kind: "SET_POINT_LABEL_OFFSET",
      id: "A",
      offsetPx: { x: 12, y: -8 },
    });

    expect(next.byId.get("A")).toEqual({
      kind: "FREE_POINT",
      id: "A",
      x: 0,
      y: 0,
      label: "A",
      labelOffsetPx: { x: 12, y: -8 },
    });

    expect(evaluateGraph(next).values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: { x: 0, y: 0 },
      label: "A",
      labelOffsetPx: { x: 12, y: -8 },
      role: "FREE",
    });
  });

  test("rejects label offsets for non-point-label nodes", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() =>
      applyGraphEdit(graph, {
        kind: "SET_POINT_LABEL_OFFSET",
        id: "missing",
        offsetPx: { x: 1, y: 2 },
      }),
    ).toThrow("Cannot set label offset for missing node: missing");
  });
});
