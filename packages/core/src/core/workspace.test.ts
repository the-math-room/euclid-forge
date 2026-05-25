import { describe, expect, test } from "vitest";
import {
  geometryWorkspaceFromJsonText,
  parseGeometryWorkspace,
} from "./workspace";
import { createGeometryEngine } from "./engine";
import { vec2 } from "../meaning/vec2";

describe("core/workspace", () => {
  test("parses workspace objects through the core facade", () => {
    const workspace = parseGeometryWorkspace({
      version: 1,
      nodes: [
        {
          kind: "FREE_POINT",
          id: "A",
          x: 0,
          y: 0,
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
      point: vec2(0, 0),
      label: "A",
      role: "FREE",
    });
    expect(engine.serialize()).toEqual(workspace);
  });

  test("parses workspace JSON text through the core facade", () => {
    const workspace = geometryWorkspaceFromJsonText(
      JSON.stringify({
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
      }),
    );

    expect(createGeometryEngine(workspace).evaluate().values.get("A")).toEqual({
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(1, 2),
      label: "A",
      role: "FREE",
    });
  });
});
