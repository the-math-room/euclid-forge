import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
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
