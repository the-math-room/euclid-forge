import { describe, expect, test } from "vitest";
import {
  clearSelection,
  emptyViewState,
  toggleSelectedNode,
} from "./viewState";

describe("app/viewState", () => {
  test("starts with no selected nodes", () => {
    const viewState = emptyViewState();

    expect([...viewState.selectedNodeIds]).toEqual([]);
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
});
