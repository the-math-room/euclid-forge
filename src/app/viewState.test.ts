import { describe, expect, test } from "vitest";
import {
  clearSelection,
  emptyViewState,
  hideSelectedNodes,
  toggleSelectedNode,
  unhideAllNodes,
} from "./viewState";

describe("app/viewState", () => {
  test("starts with no selected or hidden nodes", () => {
    const viewState = emptyViewState();

    expect([...viewState.selectedNodeIds]).toEqual([]);
    expect([...viewState.hiddenNodeIds]).toEqual([]);
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
});
