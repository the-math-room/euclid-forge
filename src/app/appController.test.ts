import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import type { Viewport } from "../rendering/viewport";
import { worldToScreen } from "../rendering/viewport";
import { appState } from "./appState";
import {
  handleKeyDown,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} from "./appController";
import {
  emptyViewState,
  hideSelectedNodes,
  toggleSelectedNode,
} from "./viewState";

const viewport: Viewport = {
  width: 800,
  height: 600,
  center: vec2(0, 0),
  zoom: 80,
};

describe("app/appController", () => {
  test("creates a triangle from three selected free points with T", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "P3",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "T",
    });

    expect(transition.state.graph.byId.get("T1")).toEqual(
      triangleNode("T1", "P1", "P2", "P3"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect(transition.shouldRender).toBe(true);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("ignores T unless exactly three selected nodes are free points", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "T1",
    );

    const state = appState(graph, viewState, null);
    const transition = handleKeyDown(state, { key: "T" });

    expect(transition.state).toBe(state);
    expect(transition.shouldRender).toBe(false);
  });

  test("creates a centroid for one selected triangle with G", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(emptyViewState(), "T1");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "g",
    });

    expect(transition.state.graph.byId.get("G1")).toEqual(
      centroidNode("G1", "T1", "G1"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
  });

  test("creates side midpoints for one selected triangle with M", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(emptyViewState(), "T1");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "m",
    });

    expect(transition.state.graph.byId.get("S_P1_P2")).toEqual(
      segmentNode("S_P1_P2", "P1", "P2"),
    );
    expect(transition.state.graph.byId.get("M_S_P1_P2")).toEqual(
      midpointNode("M_S_P1_P2", "S_P1_P2", "M_S_P1_P2"),
    );
    expect(transition.state.graph.byId.get("S_P2_P3")).toEqual(
      segmentNode("S_P2_P3", "P2", "P3"),
    );
    expect(transition.state.graph.byId.get("M_S_P2_P3")).toEqual(
      midpointNode("M_S_P2_P3", "S_P2_P3", "M_S_P2_P3"),
    );
    expect(transition.state.graph.byId.get("S_P1_P3")).toEqual(
      segmentNode("S_P1_P3", "P3", "P1"),
    );
    expect(transition.state.graph.byId.get("M_S_P1_P3")).toEqual(
      midpointNode("M_S_P1_P3", "S_P1_P3", "M_S_P1_P3"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
  });

  test("hides selected nodes with H and unhides all with U", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const selected = toggleSelectedNode(emptyViewState(), "A");

    const hidden = handleKeyDown(appState(graph, selected, null), { key: "h" });
    const visible = handleKeyDown(hidden.state, { key: "u" });

    expect([...hidden.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...hidden.state.viewState.hiddenNodeIds]).toEqual(["A"]);
    expect([...visible.state.viewState.hiddenNodeIds]).toEqual([]);
  });

  test("shift-click selects a constrained point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const transition = handlePointerDown(appState(graph, emptyViewState(), null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["G"]);
    expect(transition.shouldRender).toBe(true);
  });

  test("shift-click selects a segment", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const transition = handlePointerDown(appState(graph, emptyViewState(), null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, -1)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["AB"]);
    expect(transition.shouldRender).toBe(true);
  });

  test("pointerdown on a free point begins point drag", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const transition = handlePointerDown(appState(graph, emptyViewState(), null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(-2, -1)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.dragState).toEqual({
      kind: "FREE_POINT",
      nodeId: "A",
    });
    expect(transition.pointerCapture).toEqual({
      kind: "SET_POINTER_CAPTURE",
      pointerId: 1,
    });
  });

  test("pointermove during point drag moves the free point", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(graph, emptyViewState(), {
      kind: "FREE_POINT",
      nodeId: "A",
    });

    const transition = handlePointerMove(state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(3, 4)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.graph.byId.get("A")).toEqual(
      freePoint("A", 3, 4, "A"),
    );
    expect(transition.shouldRender).toBe(true);
  });

  test("pointerup clears drag state and releases pointer capture", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(graph, emptyViewState(), {
      kind: "FREE_POINT",
      nodeId: "A",
    });

    const transition = handlePointerUp(state, 1);

    expect(transition.state.dragState).toBeNull();
    expect(transition.pointerCapture).toEqual({
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId: 1,
    });
  });
  test("pointerdown ignores hidden free points and adds a new point instead", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(-2, -1)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.dragState).toBeNull();
    expect(transition.pointerCapture).toBeUndefined();
    expect(transition.state.graph.byId.get("P1")).toEqual(
      freePoint("P1", -2, -1, "P1"),
    );
  });

  test("shift-click ignores hidden points", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(-2, -1)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["A"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("shift-click ignores hidden segments", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "AB"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, -1)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["AB"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("shift-click ignores hidden triangles", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "ABC"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["ABC"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointerdown ignores hidden triangle interiors and adds a point instead", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "ABC"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.dragState).toBeNull();
    expect(transition.pointerCapture).toBeUndefined();
    expect(transition.state.graph.byId.get("P1")).toEqual(
      freePoint("P1", 0, 0, "P1"),
    );
  });

  test("shift-click ignores effectively hidden dependent centroids", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "ABC"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: true,
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["ABC"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointerdown ignores effectively hidden triangles when a vertex is hidden", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(appState(graph, hiddenViewState, null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.dragState).toBeNull();
    expect(transition.pointerCapture).toBeUndefined();
    expect(transition.state.graph.byId.get("P1")).toEqual(
      freePoint("P1", 0, 0, "P1"),
    );
  });

  test("hiding a source clears dependent selected nodes", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = {
      selectedNodeIds: new Set(["A", "ABC", "G", "D"]),
      hiddenNodeIds: new Set<string>(),
      viewportCenter: vec2(0, 0),
      viewportZoom: 80,
    };

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "h",
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual([
      "A",
      "ABC",
      "G",
      "D",
    ]);
    expect(transition.shouldRender).toBe(true);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("hiding a source does not clear independent unhidden selections", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = {
      selectedNodeIds: new Set(["ABC", "G", "D"]),
      hiddenNodeIds: new Set(["A"]),
      viewportCenter: vec2(0, 0),
      viewportZoom: 80,
    };

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "h",
    });

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual([
      "A",
      "ABC",
      "G",
      "D",
    ]);
  });

  test("arrow keys pan the viewport", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const left = handleKeyDown(state, { key: "ArrowLeft" });
    const right = handleKeyDown(state, { key: "ArrowRight" });
    const up = handleKeyDown(state, { key: "ArrowUp" });
    const down = handleKeyDown(state, { key: "ArrowDown" });

    expect(left.state.viewState.viewportCenter).toEqual(vec2(-0.5, 0));
    expect(right.state.viewState.viewportCenter).toEqual(vec2(0.5, 0));
    expect(up.state.viewState.viewportCenter).toEqual(vec2(0, 0.5));
    expect(down.state.viewState.viewportCenter).toEqual(vec2(0, -0.5));
  });

  test("plus and minus keys zoom the viewport", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const zoomedIn = handleKeyDown(state, { key: "+" });
    const zoomedOut = handleKeyDown(state, { key: "-" });

    expect(zoomedIn.state.viewState.viewportZoom).toBe(100);
    expect(zoomedOut.state.viewState.viewportZoom).toBe(64);
  });

  test("equals and underscore keys also zoom the viewport", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const zoomedIn = handleKeyDown(state, { key: "=" });
    const zoomedOut = handleKeyDown(state, { key: "_" });

    expect(zoomedIn.state.viewState.viewportZoom).toBe(100);
    expect(zoomedOut.state.viewState.viewportZoom).toBe(64);
  });

  test("zero resets the viewport", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const moved = appState(
      graph,
      {
        ...emptyViewState(),
        viewportCenter: vec2(3, -4),
        viewportZoom: 120,
      },
      null,
    );

    const transition = handleKeyDown(moved, { key: "0" });

    expect(transition.state.viewState.viewportCenter).toEqual(vec2(0, 0));
    expect(transition.state.viewState.viewportZoom).toBe(80);
  });

  test("pointerdown on a triangle records absolute drag starting positions", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const transition = handlePointerDown(appState(graph, emptyViewState(), null), {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.dragState?.kind).toBe("TRIANGLE");

    if (transition.state.dragState?.kind !== "TRIANGLE") {
      throw new Error("Expected triangle drag state");
    }

    expect(transition.state.dragState.initialPointerWorld).toEqual(vec2(0, 0));
    expect(
      [...transition.state.dragState.initialVertexPositions],
    ).toEqual([
      ["A", vec2(-2, -1)],
      ["B", vec2(2, -1)],
      ["C", vec2(0, 2)],
    ]);
  });

  test("triangle drag computes positions from the drag start rather than previous frame", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const state = appState(graph, emptyViewState(), {
      kind: "TRIANGLE",
      vertexIds: ["A", "B", "C"],
      initialPointerWorld: vec2(0, 0),
      initialVertexPositions: new Map([
        ["A", vec2(-2, -1)],
        ["B", vec2(2, -1)],
        ["C", vec2(0, 2)],
      ]),
    });

    const first = handlePointerMove(state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(1, 1)),
      viewport,
      shiftKey: false,
    });

    const second = handlePointerMove(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(2, 3)),
      viewport,
      shiftKey: false,
    });

    expect(second.state.graph.byId.get("A")).toEqual(
      freePoint("A", 0, 2, "A"),
    );
    expect(second.state.graph.byId.get("B")).toEqual(
      freePoint("B", 4, 2, "B"),
    );
    expect(second.state.graph.byId.get("C")).toEqual(
      freePoint("C", 2, 5, "C"),
    );
  });

});
