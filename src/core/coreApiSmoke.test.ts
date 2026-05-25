import { describe, expect, test } from "vitest";
import {
  createGeometryEngine,
  diagnosticsWithCode,
  geometryWorkspaceFromJsonText,
} from "./index";

describe("core public API smoke", () => {
  test("supports parse, evaluate, diagnostics, dependencies, edit, and serialize through core/index", () => {
    const workspace = geometryWorkspaceFromJsonText(
      JSON.stringify({
        version: 1,
        nodes: [
          {
            kind: "FREE_POINT",
            id: "A",
            x: 0,
            y: 0,
            label: "A",
          },
          {
            kind: "FREE_POINT",
            id: "B",
            x: 1,
            y: 0,
            label: "B",
          },
          {
            kind: "FREE_POINT",
            id: "C",
            x: 0,
            y: 1,
            label: "C",
          },
          {
            kind: "FREE_POINT",
            id: "D",
            x: 1,
            y: 1,
            label: "D",
          },
          {
            kind: "SEGMENT",
            id: "AB",
            a: "A",
            b: "B",
          },
          {
            kind: "SEGMENT",
            id: "CD",
            a: "C",
            b: "D",
          },
          {
            kind: "SEGMENT_INTERSECTION",
            id: "X",
            segmentA: "AB",
            segmentB: "CD",
            label: "X",
          },
        ],
        view: {
          selectedNodeIds: [],
          hiddenNodeIds: [],
          viewportCenter: { x: 0, y: 0 },
          viewportZoom: 80,
          viewportRotation: 0,
        },
      }),
    );

    const engine = createGeometryEngine(workspace);
    const evaluated = engine.evaluate();

    expect(evaluated.values.has("AB")).toBe(true);
    expect(evaluated.values.has("X")).toBe(false);
    expect(diagnosticsWithCode(engine.diagnostics(), "NO_UNIQUE_INTERSECTION"))
      .toHaveLength(1);
    expect(engine.dependenciesOf("AB")).toEqual(["A", "B"]);
    expect(engine.dependentsOf("A")).toEqual(["AB"]);
    expect([...engine.transitiveDependentsOf(["A"])]).toEqual(["AB", "X"]);

    const next = engine.applyEdit({
      kind: "MOVE_FREE_POINT",
      id: "D",
      point: { x: 0.5, y: -1 },
    });

    expect(engine.diagnostics()).toEqual([
      {
        nodeId: "X",
        severity: "warning",
        code: "NO_UNIQUE_INTERSECTION",
        message:
          "Cannot evaluate X; segments AB and CD do not have a unique bounded intersection",
      },
    ]);
    expect(next.diagnostics()).toEqual([]);
    expect(next.evaluate().values.has("X")).toBe(true);
    expect(next.serialize().nodes).toContainEqual({
      kind: "FREE_POINT",
      id: "D",
      x: 0.5,
      y: -1,
      label: "D",
    });
  });
});
