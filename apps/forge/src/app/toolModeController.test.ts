import { describe, expect, test } from "vitest";
import {
  createGraph,
  freePoint,
  segmentNode,
  triangleNode,
  vec2,
  worldToScreen,
} from "@euclid-forge/core";

import { constructionTool, deleteTool } from "./activeTool";
import { handlePointerDown } from "./appController";
import { appState } from "./appState";
import { emptyViewState } from "./viewState";
import { testViewport } from "../testHelpers/viewport";

const viewport = testViewport();

describe("app/tool mode pointer behavior", () => {
  test("segment mode creates a segment from two ordinary point clicks", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
    ]);
    const first = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("segment")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(first.history).toBe("ignore");
    expect(first.state.activeTool).toEqual({
      kind: "segment",
      inputs: ["A"],
    });

    const second = handlePointerDown(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(2, 0)),
      viewport,
      shiftKey: false,
    });

    expect(second.history).toBe("commit");
    expect(
      second.state.graph.nodes.some(
        (node) =>
          node.kind === "SEGMENT" &&
          ((node.a === "A" && node.b === "B") ||
            (node.a === "B" && node.b === "A")),
      ),
    ).toBe(true);
    expect(second.state.activeTool).toEqual({
      kind: "segment",
      inputs: [],
    });
  });

  test("segment mode creates a free point from an empty-space first click", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const first = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("segment")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(3, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(first.history).toBe("commit");
    expect(first.state.graph.byId.has("P1")).toBe(true);
    expect(first.state.activeTool).toEqual({
      kind: "segment",
      inputs: ["P1"],
    });

    const second = handlePointerDown(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(0, 0)),
      viewport,
      shiftKey: false,
    });

    expect(second.history).toBe("commit");
    expect(
      second.state.graph.nodes.some(
        (node) =>
          node.kind === "SEGMENT" &&
          ((node.a === "P1" && node.b === "A") ||
            (node.a === "A" && node.b === "P1")),
      ),
    ).toBe(true);
  });

  test("triangle mode can create missing free point inputs from empty space", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const first = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("triangle")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );
    const second = handlePointerDown(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(2, 0)),
      viewport,
      shiftKey: false,
    });
    const third = handlePointerDown(second.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(1, 2)),
      viewport,
      shiftKey: false,
    });

    expect(third.history).toBe("commit");
    expect(third.state.graph.byId.has("P1")).toBe(true);
    expect(third.state.graph.byId.has("P2")).toBe(true);
    expect(
      third.state.graph.nodes.some((node) => node.kind === "TRIANGLE"),
    ).toBe(true);
    expect(third.state.activeTool).toEqual({
      kind: "triangle",
      inputs: [],
    });
  });

  test("triangle mode creates a triangle from three ordinary point clicks", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 1, 2, "C"),
    ]);

    const first = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("triangle")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );
    const second = handlePointerDown(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(2, 0)),
      viewport,
      shiftKey: false,
    });
    const third = handlePointerDown(second.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(1, 2)),
      viewport,
      shiftKey: false,
    });

    expect(third.history).toBe("commit");
    expect(
      third.state.graph.nodes.some((node) => node.kind === "TRIANGLE"),
    ).toBe(true);
    expect(third.state.activeTool).toEqual({
      kind: "triangle",
      inputs: [],
    });
  });

  test("circle mode creates a circle from center and radius point clicks", () => {
    const graph = createGraph([
      freePoint("O", 0, 0, "O"),
      freePoint("R", 2, 0, "R"),
    ]);

    const first = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("circle")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );
    const second = handlePointerDown(first.state, {
      pointerId: 1,
      point: worldToScreen(viewport, vec2(2, 0)),
      viewport,
      shiftKey: false,
    });

    expect(second.history).toBe("commit");
    expect(
      second.state.graph.nodes.some((node) => node.kind === "CIRCLE"),
    ).toBe(true);
  });

  test("delete mode deletes clicked geometry without selecting first", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null, deleteTool()),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.has("A")).toBe(false);
    expect(transition.state.activeTool).toEqual({ kind: "delete" });
  });

  test("delete mode reports blocked deletes", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null, deleteTool()),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("ignore");
    expect(transition.effects[0]?.kind).toBe("SHOW_STATUS");
    expect(transition.state.graph.byId.has("A")).toBe(true);
  });

  test("construction modes reject non-point inputs", () => {
    const graph = createGraph([
      freePoint("A", -1, -1, "A"),
      freePoint("B", 1, -1, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null, constructionTool("segment")),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("ignore");
    expect(transition.effects[0]?.kind).toBe("SHOW_STATUS");
    expect(transition.state.activeTool).toEqual({
      kind: "segment",
      inputs: [],
    });
  });

  test("delete mode can delete area geometry directly", () => {
    const graph = createGraph([
      freePoint("A", -1, -1, "A"),
      freePoint("B", 1, -1, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const transition = handlePointerDown(
      appState(graph, emptyViewState(), null, deleteTool()),
      {
        pointerId: 1,
        point: worldToScreen(viewport, vec2(0, 0)),
        viewport,
        shiftKey: false,
      },
    );

    expect(transition.history).toBe("commit");
    expect(transition.state.graph.byId.has("ABC")).toBe(false);
  });
});
