import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import {
  clearEffectivelyHiddenSelection,
  effectiveHiddenNodeIds,
} from "./effectiveVisibility";
import { testViewState } from "./testHelpers";
import { emptyViewState, hideSelectedNodes, toggleSelectedNode } from "./viewState";

describe("app/effectiveHiddenNodeIds", () => {
  test("returns the explicit hidden set when nothing is hidden", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const viewState = emptyViewState();

    expect(effectiveHiddenNodeIds(graph, viewState)).toBe(
      viewState.hiddenNodeIds,
    );
  });

  test("includes transitive dependents of hidden free points", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    expect([...effectiveHiddenNodeIds(graph, viewState)].sort()).toEqual([
      "A",
      "AB",
      "ABC",
      "G",
      "M_AB",
    ]);
  });

  test("includes transitive dependents of hidden triangles", () => {
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

    expect([...effectiveHiddenNodeIds(graph, viewState)].sort()).toEqual([
      "ABC",
      "G",
    ]);
  });

  test("preserves explicitly hidden independent nodes", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = hideSelectedNodes(
      toggleSelectedNode(
        toggleSelectedNode(emptyViewState(), "ABC"),
        "D",
      ),
    );

    expect([...effectiveHiddenNodeIds(graph, viewState)].sort()).toEqual([
      "ABC",
      "D",
      "G",
    ]);
  });
});

describe("app/clearEffectivelyHiddenSelection", () => {
  test("returns the same view state when selection is already empty", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const viewState = emptyViewState();

    expect(clearEffectivelyHiddenSelection(graph, viewState)).toBe(viewState);
  });

  test("clears selected nodes that become effectively hidden", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const selected = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "G",
    );

    const hidden = hideSelectedNodes(
      toggleSelectedNode(selected, "ABC"),
    );

    const next = clearEffectivelyHiddenSelection(graph, hidden);

    expect([...next.selectedNodeIds]).toEqual([]);
    expect([...next.hiddenNodeIds]).toEqual(["A", "G", "ABC"]);
  });

  test("clears dependent selected nodes when a source is hidden", () => {
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

    const next = clearEffectivelyHiddenSelection(graph, viewState);

    expect([...next.selectedNodeIds]).toEqual(["D"]);
    expect([...next.hiddenNodeIds]).toEqual(["A"]);
  });

  test("preserves selected independent nodes", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", 5, 5, "D"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const viewState = testViewState({
      selectedNodeIds: new Set(["D"]),
      hiddenNodeIds: new Set(["ABC"]),
    });

    expect(clearEffectivelyHiddenSelection(graph, viewState)).toBe(viewState);
  });
});
