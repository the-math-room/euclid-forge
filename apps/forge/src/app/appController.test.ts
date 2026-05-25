import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  centroidNode,
  circleNode,
  freePoint,
  segmentIntersectionNode,
  midpointNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { testViewport } from "../testHelpers/viewport";
import { testViewState } from "./testHelpers";
import { appState } from "./appState";
import {
  handleKeyDown,
  handlePointerDown,
  handlePointerLeave,
  handlePointerMove,
  handlePointerUp,
} from "./appController";
import {
  emptyViewState,
  hideSelectedNodes,
  toggleSelectedNode,
} from "./viewState";

const viewport = testViewport();

describe("app/appController", () => {
  test("shift-click selects a circle", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      circleNode("circle", "A", "B"),
    ]);
    const viewport = testViewport();

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0.25, 0.25)),
        viewport,
        shiftKey: true,
      },
    );

    expect(transition.state.viewState.selectedNodeIds.has("circle")).toBe(true);
    expect(transition.history).toBe("commit");
  });

  test("joins two selected free points into a segment with J", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "j",
    });

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.get("S_A_B")).toEqual(
      segmentNode("S_A_B", "A", "B"),
    );
    expect(transition.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("creates a circle from two selected free points with C", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "c",
    });

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.get("C1")).toEqual(
      circleNode("C1", "A", "B"),
    );
    expect(transition.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("joins three selected free points into a triangle with J", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "D"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "P3",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "J",
    });

    expect(transition.state.graph.byId.get("T1")).toEqual(
      triangleNode("T1", "P1", "P2", "P3"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect(transition.shouldRender).toBe(true);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("ignores J unless exactly two or three selected nodes are free points", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "D"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "T1",
    );

    const state = appState(graph, viewState, null);
    const transition = handleKeyDown(state, { key: "J" });

    expect(transition.state).toBe(state);
    expect(transition.shouldRender).toBe(false);
  });

  test("creates a segment intersection from two selected segments with I", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, -1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "AB"),
      "CD",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "i",
    });

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.get("X1")).toEqual(
      segmentIntersectionNode("X1", "AB", "CD", "E"),
    );
    expect(transition.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("I explains that triangle borders are not segment selections", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "ABC");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "i",
    });

    expect(transition.history).toBe("ignore");
    expect(transition.state.graph).toBe(graph);
    expect(transition.effects).toContainEqual({
      kind: "SHOW_STATUS",
      message:
        "Select exactly two curve nodes, such as segments or circles, to create an intersection.",
    });
  });

  test("I creates curve intersections for selected non-segment curve pairs", () => {
    const graph = createGraph([
      freePoint("A", -2, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("O", 0, 0, "O"),
      freePoint("R", 1, 0, "R"),
      segmentNode("AB", "A", "B"),
      circleNode("circle", "O", "R"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "AB"),
      "circle",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "i",
    });

    expect(transition.history).toBe("commit");
    const curveIntersections = transition.state.graph.nodes.filter(
      (node) => node.kind === "CURVE_INTERSECTION",
    );

    expect(curveIntersections.map((node) => node.label)).toEqual(["C"]);
    expect(curveIntersections.map((node) => node.branchKey)).toEqual([
      "linear-circle:0",
    ]);
    expect(
      curveIntersections.every(
        (node) => node.curveA === "AB" && node.curveB === "circle",
      ),
    ).toBe(true);
  });

  test("creates a centroid for one selected triangle with G", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "D"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(emptyViewState(), "T1");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "g",
    });

    expect(transition.state.graph.byId.get("G1")).toEqual(
      centroidNode("G1", "T1", "A"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
  });

  test("creates side midpoints for one selected triangle with M", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "D"),
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
      midpointNode("M_S_P1_P2", "S_P1_P2", "A"),
    );
    expect(transition.state.graph.byId.get("S_P2_P3")).toEqual(
      segmentNode("S_P2_P3", "P2", "P3"),
    );
    expect(transition.state.graph.byId.get("M_S_P2_P3")).toEqual(
      midpointNode("M_S_P2_P3", "S_P2_P3", "B"),
    );
    expect(transition.state.graph.byId.get("S_P1_P3")).toEqual(
      segmentNode("S_P1_P3", "P3", "P1"),
    );
    expect(transition.state.graph.byId.get("M_S_P1_P3")).toEqual(
      midpointNode("M_S_P1_P3", "S_P1_P3", "C"),
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

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      },
    );

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["G"]);
    expect(transition.shouldRender).toBe(true);
  });

  test("shift-click selects a segment", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, -1)),
        viewport,
        shiftKey: true,
      },
    );

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["AB"]);
    expect(transition.shouldRender).toBe(true);
  });

  test("pointerdown on a free point begins point drag", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState).toEqual({
      kind: "FREE_POINT",
      nodeId: "A",
    });
    expect(transition.effects).toContainEqual({
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
    expect(transition.effects).toContainEqual({
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId: 1,
    });
  });

  test("pointerdown ignores hidden free points and starts viewport drag instead", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState).toEqual({
      kind: "VIEWPORT",
      initialPointerScreen: { x: 240, y: 380 },
      initialViewportCenter: { x: 0, y: 0 },
      initialViewportZoom: 80,
      initialViewportRotation: 0,
    });
    expect(transition.effects).toContainEqual({
      kind: "SET_POINTER_CAPTURE",
      pointerId: 1,
    });
    expect(transition.history).toBe("ignore");
    expect(transition.state.graph).toBe(graph);
  });

  test("shift-click ignores hidden points", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: true,
      },
    );

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

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, -1)),
        viewport,
        shiftKey: true,
      },
    );

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

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      },
    );

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["ABC"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointerdown ignores hidden triangle interiors and starts viewport drag instead", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "ABC"),
    );

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState).toEqual({
      kind: "VIEWPORT",
      initialPointerScreen: { x: 400, y: 300 },
      initialViewportCenter: { x: 0, y: 0 },
      initialViewportZoom: 80,
      initialViewportRotation: 0,
    });
    expect(transition.effects).toContainEqual({
      kind: "SET_POINTER_CAPTURE",
      pointerId: 1,
    });
    expect(transition.history).toBe("ignore");
    expect(transition.state.graph).toBe(graph);
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

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      },
    );

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
    expect([...transition.state.viewState.hiddenNodeIds]).toEqual(["ABC"]);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointerdown ignores effectively hidden triangles and starts viewport drag when a vertex is hidden", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const hiddenViewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const transition = handlePointerDown(
      appState(graph, hiddenViewState, null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState).toEqual({
      kind: "VIEWPORT",
      initialPointerScreen: { x: 400, y: 300 },
      initialViewportCenter: { x: 0, y: 0 },
      initialViewportZoom: 80,
      initialViewportRotation: 0,
    });
    expect(transition.effects).toContainEqual({
      kind: "SET_POINTER_CAPTURE",
      pointerId: 1,
    });
    expect(transition.history).toBe("ignore");
    expect(transition.state.graph).toBe(graph);
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

    const viewState = testViewState({
      selectedNodeIds: new Set(["A", "ABC", "G", "D"]),
    });

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

    const viewState = testViewState({
      selectedNodeIds: new Set(["ABC", "G", "D"]),
      hiddenNodeIds: new Set(["A"]),
    });

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
        viewportRotation: Math.PI / 2,
      },
      null,
    );

    const transition = handleKeyDown(moved, { key: "0" });

    expect(transition.state.viewState.viewportCenter).toEqual(vec2(0, 0));
    expect(transition.state.viewState.viewportZoom).toBe(80);
    expect(transition.state.viewState.viewportRotation).toBe(0);
  });

  test("pointerdown on a triangle records absolute drag starting positions", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState?.kind).toBe("BODY");

    if (transition.state.dragState?.kind !== "BODY") {
      throw new Error("Expected body drag state");
    }

    expect(transition.state.dragState.initialPointerWorld).toEqual(vec2(0, 0));
    expect([...transition.state.dragState.initialSourcePointPositions]).toEqual(
      [
        ["A", vec2(-2, -1)],
        ["B", vec2(2, -1)],
        ["C", vec2(0, 2)],
      ],
    );
  });

  test("triangle drag computes positions from the drag start rather than previous frame", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const state = appState(graph, emptyViewState(), {
      kind: "BODY",
      nodeId: "ABC",
      sourcePointIds: ["A", "B", "C"],
      initialPointerWorld: vec2(0, 0),
      initialSourcePointPositions: new Map([
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

    expect(second.state.graph.byId.get("A")).toEqual(freePoint("A", 0, 2, "A"));
    expect(second.state.graph.byId.get("B")).toEqual(freePoint("B", 4, 2, "B"));
    expect(second.state.graph.byId.get("C")).toEqual(freePoint("C", 2, 5, "C"));
  });

  test("pointerdown drags the later-rendered overlapping triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", -1, -0.5, "D"),
      freePoint("E", 1, -0.5, "E"),
      freePoint("F", 0, 1, "F"),
      triangleNode("ABC", "A", "B", "C"),
      triangleNode("DEF", "D", "E", "F"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState?.kind).toBe("BODY");

    if (transition.state.dragState?.kind !== "BODY") {
      throw new Error("Expected body drag state");
    }

    expect(transition.state.dragState.sourcePointIds).toEqual(["D", "E", "F"]);
  });

  test("shift-click selects the later-rendered overlapping triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", -1, -0.5, "D"),
      freePoint("E", 1, -0.5, "E"),
      freePoint("F", 0, 1, "F"),
      triangleNode("ABC", "A", "B", "C"),
      triangleNode("DEF", "D", "E", "F"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      },
    );

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["DEF"]);
  });

  test("pointermove with no drag hovers a free point", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const transition = handlePointerMove(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.viewState.hoveredNodeId).toBe("A");
    expect(transition.shouldRender).toBe(true);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointermove with no drag hovers the later-rendered overlapping triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", -1, -0.5, "D"),
      freePoint("E", 1, -0.5, "E"),
      freePoint("F", 0, 1, "F"),
      triangleNode("ABC", "A", "B", "C"),
      triangleNode("DEF", "D", "E", "F"),
    ]);

    const transition = handlePointerMove(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.viewState.hoveredNodeId).toBe("DEF");
  });

  test("shift pointermove with no drag hovers a segment", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const transition = handlePointerMove(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, -1)),
        viewport,
        shiftKey: true,
      },
    );

    expect(transition.state.viewState.hoveredNodeId).toBe("AB");
  });

  test("pointermove clears hover when nothing is under the pointer", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(
      graph,
      {
        ...emptyViewState(),
        hoveredNodeId: "A",
      },
      null,
    );

    const transition = handlePointerMove(state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(5, 5)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.viewState.hoveredNodeId).toBeNull();
  });

  test("pointerdown clears hover", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(
      graph,
      {
        ...emptyViewState(),
        hoveredNodeId: "A",
      },
      null,
    );

    const transition = handlePointerDown(state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(-2, -1)),
      viewport,
      shiftKey: false,
    });

    expect(transition.state.viewState.hoveredNodeId).toBeNull();
  });

  test("pointerleave clears hover", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(
      graph,
      {
        ...emptyViewState(),
        hoveredNodeId: "A",
      },
      null,
    );

    const transition = handlePointerLeave(state);

    expect(transition.state.viewState.hoveredNodeId).toBeNull();
    expect(transition.shouldRender).toBe(true);
    expect(transition.shouldPreventDefault).toBe(true);
  });

  test("pointerleave is unchanged when nothing is hovered", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const transition = handlePointerLeave(state);

    expect(transition.state).toBe(state);
    expect(transition.shouldRender).toBe(false);
    expect(transition.shouldPreventDefault).toBe(false);
  });

  test("bracket keys rotate the viewport", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const counterclockwise = handleKeyDown(state, { key: "[" });
    const clockwise = handleKeyDown(state, { key: "]" });

    expect(counterclockwise.state.viewState.viewportRotation).toBeCloseTo(
      Math.PI / 24,
    );
    expect(clockwise.state.viewState.viewportRotation).toBeCloseTo(
      -Math.PI / 24,
    );
  });

  test("backslash resets only viewport rotation", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(
      graph,
      {
        ...emptyViewState(),
        viewportCenter: vec2(3, -4),
        viewportZoom: 120,
        viewportRotation: Math.PI / 2,
      },
      null,
    );

    const transition = handleKeyDown(state, { key: "\\" });

    expect(transition.state.viewState.viewportCenter).toEqual(vec2(3, -4));
    expect(transition.state.viewState.viewportZoom).toBe(120);
    expect(transition.state.viewState.viewportRotation).toBe(0);
  });

  test("durable graph commands request history commits", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "D"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "P3",
    );

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "J",
    });

    expect(transition.history).toBe("commit");
  });

  test("viewport navigation does not request history commits", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const transition = handleKeyDown(appState(graph, emptyViewState(), null), {
      key: "ArrowLeft",
    });

    expect(transition.history).toBe("ignore");
  });

  test("selection changes request history commits", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: true,
      },
    );

    expect(transition.history).toBe("commit");
  });

  test("hover changes do not request history commits", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);

    const transition = handlePointerMove(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(-2, -1)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("ignore");
  });

  test("completed drags request history commits", () => {
    const graph = createGraph([freePoint("A", -2, -1, "A")]);
    const state = appState(graph, emptyViewState(), {
      kind: "FREE_POINT",
      nodeId: "A",
    });

    const transition = handlePointerUp(state, 1);

    expect(transition.history).toBe("commit");
  });

  test("delete key deletes selected nodes and requests a history commit", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 1, "B"),
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "Delete",
    });

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.has("A")).toBe(false);
    expect(transition.state.graph.byId.get("B")).toEqual(
      freePoint("B", 1, 1, "B"),
    );
    expect([...transition.state.viewState.selectedNodeIds]).toEqual([]);
  });

  test("delete key cascades through dependent geometry", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);
    const transition = handleKeyDown(
      appState(
        graph,
        {
          ...emptyViewState(),
          selectedNodeIds: new Set(["A"]),
        },
        null,
      ),
      {
        key: "Delete",
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.has("A")).toBe(false);
    expect(transition.state.graph.byId.has("AB")).toBe(false);
    expect(transition.state.graph.byId.has("B")).toBe(true);
  });

  test("pointerdown on a circle records body drag source positions", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      circleNode("circle", "A", "B"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0.5, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.state.dragState?.kind).toBe("BODY");

    if (transition.state.dragState?.kind !== "BODY") {
      throw new Error("Expected body drag state");
    }

    expect(transition.state.dragState.nodeId).toBe("circle");
    expect(transition.state.dragState.sourcePointIds).toEqual(["A", "B"]);
    expect([...transition.state.dragState.initialSourcePointPositions]).toEqual(
      [
        ["A", vec2(0, 0)],
        ["B", vec2(2, 0)],
      ],
    );
  });

  test("circle body drag translates center and through points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      circleNode("circle", "A", "B"),
    ]);

    const state = appState(graph, emptyViewState(), {
      kind: "BODY",
      nodeId: "circle",
      sourcePointIds: ["A", "B"],
      initialPointerWorld: vec2(0, 0),
      initialSourcePointPositions: new Map([
        ["A", vec2(0, 0)],
        ["B", vec2(2, 0)],
      ]),
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
    expect(transition.state.graph.byId.get("B")).toEqual(
      freePoint("B", 5, 4, "B"),
    );
  });

  test("shift page up brings selected node to front", () => {
    const graph = createGraph([
      { ...freePoint("A", 0, 0, "A"), zIndex: 0 },
      { ...freePoint("B", 1, 0, "B"), zIndex: 1 },
      { ...freePoint("C", 2, 0, "C"), zIndex: 2 },
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");

    const transition = handleKeyDown(appState(graph, viewState, null), {
      key: "PageUp",
      shiftKey: true,
    });

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.get("A")).toEqual({
      ...freePoint("A", 0, 0, "A"),
      zIndex: 2,
    });
  });
});
