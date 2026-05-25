import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  centroidNode,
  circleNode,
  freePoint,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { testViewport } from "../testHelpers/viewport";
import { appState } from "./appState";
import {
  hoverIntent,
  pointerDownIntent,
} from "./pointerIntent";
import {
  emptyViewState,
  hideSelectedNodes,
  toggleSelectedNode,
} from "./viewState";

const viewport = testViewport();

describe("app/pointerIntent", () => {
  test("shift-click can select a circle", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      circleNode("circle", "A", "B"),
    ]);
    const viewport = testViewport();
    const state = appState(graph, emptyViewState(), null);

    expect(
      pointerDownIntent(state, {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0.25, 0.25)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "SELECT_NODE",
      id: "circle",
    });
  });


  test("normal pointerdown drags a free point before triangle interiors", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "DRAG_FREE_POINT",
      id: "A",
    });
  });

  test("normal pointerdown drags the later-rendered overlapping triangle", () => {
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

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "DRAG_BODY",
      id: "DEF",
      sourcePointIds: ["D", "E", "F"],
    });
  });

  test("normal pointerdown adds a free point when no geometry is hit", () => {
    const graph = createGraph([]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(3, 4)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "ADD_FREE_POINT",
      point: vec2(3, 4),
    });
  });

  test("shift pointerdown selects point before segment or triangle", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "SELECT_NODE",
      id: "A",
    });
  });

  test("shift pointerdown selects segment before triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, -1)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "SELECT_NODE",
      id: "AB",
    });
  });

  test("shift pointerdown selects triangle when no point or segment is hit", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "SELECT_NODE",
      id: "ABC",
    });
  });

  test("shift pointerdown returns none when no selectable geometry is hit", () => {
    const graph = createGraph([]);

    expect(
      pointerDownIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(3, 4)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "NONE",
    });
  });

  test("respects effective visibility", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "ABC"),
    );

    expect(
      pointerDownIntent(appState(graph, viewState, null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: true,
      }),
    ).toEqual({
      kind: "NONE",
    });
  });

  test("hover uses the same normal pointer policy without add-point intent", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(
      hoverIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "HOVER_NODE",
      id: "ABC",
    });

    expect(
      hoverIntent(appState(graph, emptyViewState(), null), {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(4, 4)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "NONE",
    });
  });
  test("pointerdown can drag a circle body", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      circleNode("circle", "A", "B"),
    ]);
    const state = appState(graph, emptyViewState(), null);

    expect(
      pointerDownIntent(state, {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0.5, 0)),
        viewport,
        shiftKey: false,
      }),
    ).toEqual({
      kind: "DRAG_BODY",
      id: "circle",
      sourcePointIds: ["A", "B"],
    });
  });

});
