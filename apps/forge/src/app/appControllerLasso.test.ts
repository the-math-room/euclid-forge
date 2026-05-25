import { describe, expect, test } from "vitest";
import {
  createGraph,
  freePoint,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { testViewport } from "../testHelpers/viewport";
import { appState } from "./appState";
import {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} from "./appController";
import { emptyViewState } from "./viewState";

const viewport = testViewport();

function screen(world: Readonly<{ x: number; y: number }>) {
  return worldToScreen(viewport, world);
}

describe("app/appController lasso selection", () => {
  test("shift-drag empty canvas starts and updates a lasso drag", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const started = handlePointerDown(appState(graph, emptyViewState(), null), {
      pointerId: 1,
      point: screen({ x: 4, y: 4 }),
      viewport,
      shiftKey: true,
    });

    expect(started.state.dragState).toEqual({
      kind: "LASSO",
      points: [screen({ x: 4, y: 4 })],
      viewport,
    });
    expect(started.effects).toContainEqual({
      kind: "SET_POINTER_CAPTURE",
      pointerId: 1,
    });

    const moved = handlePointerMove(started.state, {
      pointerId: 1,
      point: screen({ x: 5, y: 5 }),
      viewport,
      shiftKey: true,
    });

    expect(moved.state.dragState?.kind).toBe("LASSO");

    if (moved.state.dragState?.kind !== "LASSO") {
      throw new Error("Expected lasso drag state");
    }

    expect(moved.state.dragState.points.length).toBe(2);
  });

  test("lasso pointerup replaces selection with fully contained geometry", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const state = appState(graph, emptyViewState(), {
      kind: "LASSO",
      points: [
        screen({ x: -0.5, y: -0.5 }),
        screen({ x: 2.5, y: -0.5 }),
        screen({ x: 2.5, y: 2.5 }),
        screen({ x: -0.5, y: 2.5 }),
      ],
      viewport,
    });

    const transition = handlePointerUp(state, 1);

    expect([...transition.state.viewState.selectedNodeIds]).toEqual([
      "A",
      "B",
      "C",
      "AB",
      "ABC",
    ]);
    expect(transition.state.dragState).toBeNull();
    expect(transition.history).toBe("commit");
    expect(transition.effects).toContainEqual({
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId: 1,
    });
  });

  test("short lasso click does not clear an existing selection", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const viewState = {
      ...emptyViewState(),
      selectedNodeIds: new Set(["A"]),
    };

    const state = appState(graph, viewState, {
      kind: "LASSO",
      points: [screen({ x: 4, y: 4 })],
      viewport,
    });

    const transition = handlePointerUp(state, 1);

    expect([...transition.state.viewState.selectedNodeIds]).toEqual(["A"]);
    expect(transition.state.dragState).toBeNull();
    expect(transition.history).toBe("ignore");
  });
});
