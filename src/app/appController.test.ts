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
import { emptyViewState, toggleSelectedNode } from "./viewState";

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
});
