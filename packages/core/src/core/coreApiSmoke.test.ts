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
    expect(
      diagnosticsWithCode(engine.diagnostics(), "NO_UNIQUE_INTERSECTION"),
    ).toHaveLength(1);
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

import {
  applyGraphEdit as publicApplyGraphEdit,
  circleConstruction as publicCircleConstruction,
  createGeometryEngine as publicCreateGeometryEngine,
  createGraph as publicCreateGraph,
  diagnosticsWithCode as publicDiagnosticsWithCode,
  emptyViewState as publicEmptyViewState,
  evaluateGraph as publicEvaluateGraph,
  freePoint as publicFreePoint,
  geometryWorkspaceFromJsonText as publicGeometryWorkspaceFromJsonText,
  screenToWorld as publicScreenToWorld,
  segmentConstruction as publicSegmentConstruction,
  serializeWorkspace as publicSerializeWorkspace,
  toggleSelectedNode as publicToggleSelectedNode,
  worldToScreen as publicWorldToScreen,
  type GeometryNode as PublicGeometryNode,
  type Viewport as PublicViewport,
} from "./index";

test("core index exposes the extraction-facing public API", () => {
  const graph = publicCreateGraph([
    publicFreePoint("A", 0, 0, "A"),
    publicFreePoint("B", 1, 0, "B"),
  ]);

  const withSegment = publicApplyGraphEdit(graph, {
    kind: "ADD_NODES",
    nodes: publicSegmentConstruction(graph, "A", "B"),
  });

  const withCircle = publicApplyGraphEdit(withSegment, {
    kind: "ADD_NODES",
    nodes: publicCircleConstruction(withSegment, "A", "B"),
  });

  const evaluated = publicEvaluateGraph(withCircle);

  expect(evaluated.values.has("A")).toBe(true);
  expect(evaluated.values.has("S_A_B")).toBe(true);
  expect(
    publicDiagnosticsWithCode(evaluated.issues, "MISSING_DEPENDENCY"),
  ).toEqual([]);

  const viewport: PublicViewport = {
    width: 800,
    height: 600,
    center: { x: 0, y: 0 },
    zoom: 100,
    rotation: 0,
  };

  const screen = publicWorldToScreen(viewport, { x: 1, y: 0 });

  expect(publicScreenToWorld(viewport, screen).x).toBeCloseTo(1);
  expect(publicScreenToWorld(viewport, screen).y).toBeCloseTo(0);

  const viewState = publicToggleSelectedNode(publicEmptyViewState(), "A");
  const engine = publicCreateGeometryEngine({ graph: withCircle, viewState });

  expect(engine.evaluate().ordered.map((value) => value.id)).toContain("C1");

  const serialized = publicSerializeWorkspace({
    graph: withCircle,
    viewState,
  });
  const parsed = publicGeometryWorkspaceFromJsonText(
    JSON.stringify(serialized),
  );

  expect(parsed.nodes.map((node: PublicGeometryNode) => node.id)).toContain(
    "C1",
  );
  expect(parsed.view.selectedNodeIds).toEqual(["A"]);
});
