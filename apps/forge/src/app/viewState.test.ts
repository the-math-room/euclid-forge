import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core";
import {
  clearSelection,
  emptyViewState,
  hideSelectedNodes,
  panViewport,
  resetViewport,
  resetViewportRotation,
  rotateViewport,
  rotateViewportClockwise,
  rotateViewportCounterclockwise,
  setHoveredNode,
  setViewportCenter,
  setViewportRotation,
  setViewportZoom,
  toggleSelectedNode,
  unhideAllNodes,
  zoomViewport,
} from "./viewState";

describe("app/viewState", () => {
  test("starts with no selected or hidden nodes and the default viewport", () => {
    const viewState = emptyViewState();

    expect([...viewState.selectedNodeIds]).toEqual([]);
    expect([...viewState.hiddenNodeIds]).toEqual([]);
    expect(viewState.hoveredNodeId).toBeNull();
    expect(viewState.viewportCenter).toEqual(vec2(0, 0));
    expect(viewState.viewportZoom).toBe(80);
    expect(viewState.viewportRotation).toBe(0);
    expect(Object.isFrozen(viewState)).toBe(true);
  });

  test("toggles a selected node on and off", () => {
    const initial = emptyViewState();
    const selected = toggleSelectedNode(initial, "A");
    const deselected = toggleSelectedNode(selected, "A");

    expect([...initial.selectedNodeIds]).toEqual([]);
    expect([...selected.selectedNodeIds]).toEqual(["A"]);
    expect([...deselected.selectedNodeIds]).toEqual([]);
  });

  test("preserves other selected nodes when toggling", () => {
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    expect([...viewState.selectedNodeIds]).toEqual(["A", "B"]);
  });

  test("clears selected nodes", () => {
    const selected = toggleSelectedNode(emptyViewState(), "A");
    const cleared = clearSelection(selected);

    expect([...selected.selectedNodeIds]).toEqual(["A"]);
    expect([...cleared.selectedNodeIds]).toEqual([]);
  });

  test("returns same object when clearing an already-empty selection", () => {
    const viewState = emptyViewState();

    expect(clearSelection(viewState)).toBe(viewState);
  });

  test("hides selected nodes and clears selection", () => {
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    const hidden = hideSelectedNodes(viewState);

    expect([...hidden.selectedNodeIds]).toEqual([]);
    expect([...hidden.hiddenNodeIds]).toEqual(["A", "B"]);
  });

  test("preserves previously hidden nodes when hiding more selected nodes", () => {
    const first = hideSelectedNodes(toggleSelectedNode(emptyViewState(), "A"));
    const second = hideSelectedNodes(toggleSelectedNode(first, "B"));

    expect([...second.hiddenNodeIds]).toEqual(["A", "B"]);
  });

  test("returns same object when hiding with no selection", () => {
    const viewState = emptyViewState();

    expect(hideSelectedNodes(viewState)).toBe(viewState);
  });

  test("unhides all hidden nodes", () => {
    const hidden = hideSelectedNodes(toggleSelectedNode(emptyViewState(), "A"));
    const visible = unhideAllNodes(hidden);

    expect([...hidden.hiddenNodeIds]).toEqual(["A"]);
    expect([...visible.hiddenNodeIds]).toEqual([]);
  });

  test("returns same object when unhiding with no hidden nodes", () => {
    const viewState = emptyViewState();

    expect(unhideAllNodes(viewState)).toBe(viewState);
  });
  test("updates viewport center without changing graph-related view state", () => {
    const viewState = toggleSelectedNode(emptyViewState(), "A");
    const next = setViewportCenter(viewState, vec2(3, -2));

    expect(next.viewportCenter).toEqual(vec2(3, -2));
    expect(next.viewportZoom).toBe(80);
    expect(next.viewportRotation).toBe(0);
    expect([...next.selectedNodeIds]).toEqual(["A"]);
    expect([...next.hiddenNodeIds]).toEqual([]);
  });

  test("returns same object when setting viewport center to the current value", () => {
    const viewState = emptyViewState();

    expect(setViewportCenter(viewState, vec2(0, 0))).toBe(viewState);
  });

  test("updates viewport zoom without changing graph-related view state", () => {
    const viewState = toggleSelectedNode(emptyViewState(), "A");
    const next = setViewportZoom(viewState, 120);

    expect(next.viewportCenter).toEqual(vec2(0, 0));
    expect(next.viewportZoom).toBe(120);
    expect(next.viewportRotation).toBe(0);
    expect([...next.selectedNodeIds]).toEqual(["A"]);
    expect([...next.hiddenNodeIds]).toEqual([]);
  });

  test("returns same object when setting viewport zoom to the current value", () => {
    const viewState = emptyViewState();

    expect(setViewportZoom(viewState, 80)).toBe(viewState);
  });

  test("pans the viewport by a world delta", () => {
    const viewState = emptyViewState();
    const next = panViewport(viewState, vec2(2, -3));

    expect(next.viewportCenter).toEqual(vec2(2, -3));
    expect(next.viewportZoom).toBe(80);
  });

  test("returns same object when panning by zero", () => {
    const viewState = emptyViewState();

    expect(panViewport(viewState, vec2(0, 0))).toBe(viewState);
  });

  test("zooms the viewport by a positive factor", () => {
    const viewState = emptyViewState();
    const next = zoomViewport(viewState, 1.25);

    expect(next.viewportCenter).toEqual(vec2(0, 0));
    expect(next.viewportZoom).toBe(100);
  });

  test("clamps viewport zoom to the minimum", () => {
    const viewState = setViewportZoom(emptyViewState(), 12);
    const next = zoomViewport(viewState, 0.5);

    expect(next.viewportZoom).toBe(10);
  });

  test("clamps viewport zoom to the maximum", () => {
    const viewState = setViewportZoom(emptyViewState(), 600);
    const next = zoomViewport(viewState, 2);

    expect(next.viewportZoom).toBe(640);
  });

  test("throws for non-positive zoom factors", () => {
    expect(() => zoomViewport(emptyViewState(), 0)).toThrow(
      "Viewport zoom factor must be positive: 0",
    );
  });

  test("resets the viewport while preserving selection and hidden state", () => {
    const viewState = hideSelectedNodes(
      toggleSelectedNode(
        setViewportZoom(setViewportCenter(emptyViewState(), vec2(3, -4)), 120),
        "A",
      ),
    );

    const next = resetViewport(viewState);

    expect(next.viewportCenter).toEqual(vec2(0, 0));
    expect(next.viewportZoom).toBe(80);
    expect(next.viewportRotation).toBe(0);
    expect([...next.selectedNodeIds]).toEqual([]);
    expect([...next.hiddenNodeIds]).toEqual(["A"]);
  });

  test("sets hovered node", () => {
    const viewState = emptyViewState();
    const next = setHoveredNode(viewState, "A");

    expect(next.hoveredNodeId).toBe("A");
    expect([...next.selectedNodeIds]).toEqual([]);
    expect([...next.hiddenNodeIds]).toEqual([]);
  });

  test("clears hovered node", () => {
    const viewState = setHoveredNode(emptyViewState(), "A");
    const next = setHoveredNode(viewState, null);

    expect(next.hoveredNodeId).toBeNull();
  });

  test("returns same object when setting hovered node to the current value", () => {
    const viewState = setHoveredNode(emptyViewState(), "A");

    expect(setHoveredNode(viewState, "A")).toBe(viewState);
  });

  test("sets viewport rotation", () => {
    const viewState = emptyViewState();
    const next = setViewportRotation(viewState, Math.PI / 2);

    expect(next.viewportRotation).toBe(Math.PI / 2);
    expect(next.viewportCenter).toEqual(vec2(0, 0));
    expect(next.viewportZoom).toBe(80);
  });

  test("returns same object when setting viewport rotation to the current value", () => {
    const viewState = emptyViewState();

    expect(setViewportRotation(viewState, 0)).toBe(viewState);
  });

  test("rotates viewport by a delta", () => {
    const viewState = emptyViewState();
    const next = rotateViewport(viewState, Math.PI / 6);

    expect(next.viewportRotation).toBe(Math.PI / 6);
  });

  test("returns same object when rotating viewport by zero", () => {
    const viewState = emptyViewState();

    expect(rotateViewport(viewState, 0)).toBe(viewState);
  });

  test("rotates viewport counterclockwise by the default step", () => {
    const next = rotateViewportCounterclockwise(emptyViewState());

    expect(next.viewportRotation).toBeCloseTo(Math.PI / 24);
  });

  test("rotates viewport clockwise by the default step", () => {
    const next = rotateViewportClockwise(emptyViewState());

    expect(next.viewportRotation).toBeCloseTo(-Math.PI / 24);
  });

  test("resets viewport rotation without changing center or zoom", () => {
    const viewState = setViewportRotation(
      setViewportZoom(setViewportCenter(emptyViewState(), vec2(2, 3)), 120),
      Math.PI / 2,
    );

    const next = resetViewportRotation(viewState);

    expect(next.viewportCenter).toEqual(vec2(2, 3));
    expect(next.viewportZoom).toBe(120);
    expect(next.viewportRotation).toBe(0);
  });
});
