import { describe, expect, test } from "vitest";
import { createGeometryEngine, parseGeometryWorkspace } from "./index";
import { vec2 } from "../meaning/vec2";

describe("core/index", () => {
  test("exports the headless engine and workspace facade", () => {
    const workspace = parseGeometryWorkspace({
      version: 1,
      nodes: [
        {
          kind: "FREE_POINT",
          id: "A",
          x: 1,
          y: 2,
          label: "A",
        },
      ],
      view: {
        selectedNodeIds: [],
        hiddenNodeIds: [],
        viewportCenter: { x: 0, y: 0 },
        viewportZoom: 80,
        viewportRotation: 0,
      },
    });

    const engine = createGeometryEngine(workspace);

    expect(engine.evaluate().values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(1, 2),
      label: "A",
      role: "FREE",
    });
  });
});
