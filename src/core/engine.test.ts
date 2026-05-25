import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { createGeometryEngine } from "./engine";
import { parseSerializedWorkspace } from "../app/workspace";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  freePoint,
  segmentNode,
} from "../representation/node";

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`../app/fixtures/${name}`, import.meta.url), "utf-8"),
  );
}

describe("core/engine", () => {
  test("evaluates a graph input without app/browser state", () => {
    const engine = createGeometryEngine(
      createGraph([
        freePoint("A", 0, 0, "A"),
        freePoint("B", 1, 0, "B"),
        segmentNode("AB", "A", "B"),
      ]),
    );

    expect(engine.evaluate().values.get("AB")).toEqual({
      kind: "SEGMENT",
      sourceKind: "SEGMENT",
      id: "AB",
      a: vec2(0, 0),
      b: vec2(1, 0),
    });
  });

  test("applies graph edits immutably", () => {
    const engine = createGeometryEngine(
      createGraph([freePoint("A", 0, 0, "A")]),
    );

    const next = engine.applyEdit({
      kind: "MOVE_FREE_POINT",
      id: "A",
      point: vec2(2, 3),
    });

    expect(engine.evaluate().values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(0, 0),
      label: "A",
      role: "FREE",
    });
    expect(next.evaluate().values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(2, 3),
      label: "A",
      role: "FREE",
    });
  });


  test("exposes evaluation diagnostics directly", () => {
    const engine = createGeometryEngine(
      createGraph([
        freePoint("A", 0, 0, "A"),
        freePoint("B", 1, 0, "B"),
        freePoint("C", 0, 1, "C"),
        freePoint("D", 1, 1, "D"),
        segmentNode("AB", "A", "B"),
        segmentNode("CD", "C", "D"),
        {
          kind: "SEGMENT_INTERSECTION",
          id: "X",
          segmentA: "AB",
          segmentB: "CD",
          label: "X",
        },
      ]),
    );

    expect(engine.diagnostics()).toEqual([
      {
        nodeId: "X",
        code: "UNDEFINED_GEOMETRY",
        message:
          "Cannot evaluate X; segments AB and CD do not have a unique bounded intersection",
      },
    ]);
  });

  test("parses, evaluates, and serializes the Euclid I.1 golden fixture", () => {
    const workspace = parseSerializedWorkspace(
      readFixture("euclid-i-1-equilateral.workspace.json"),
    );
    const engine = createGeometryEngine(workspace);
    const evaluated = engine.evaluate();

    expect(evaluated.issues).toEqual([]);
    expect(evaluated.values.has("X_C1_C2_circle_circle_1")).toBe(true);
    expect(engine.serialize()).toEqual(workspace);
  });
});
