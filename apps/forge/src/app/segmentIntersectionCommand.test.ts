import { describe, expect, test } from "vitest";
import { appState } from "./appState";
import { appCommandDisabledReason, appCommandForKey } from "./commands";
import { emptyViewState, toggleSelectedNode } from "./viewState";
import { createGraph } from "@euclid-forge/core";
import {
  circleNode,
  freePoint,
  segmentIntersectionNode,
  segmentNode,
} from "@euclid-forge/core";

describe("app segment intersection command", () => {
  test("creates a segment intersection from two selected segments", () => {
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

    const result = appCommandForKey("i")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("X1")).toEqual(
      segmentIntersectionNode("X1", "AB", "CD", "E"),
    );
    expect(result?.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("is disabled unless exactly two curve nodes are selected", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);
    const command = appCommandForKey("i");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(graph, toggleSelectedNode(emptyViewState(), "AB"), null),
        ),
    ).toBe(
      "Select exactly two curve nodes, such as segments or circles, to create an intersection.",
    );
  });
});

test("creates curve intersection nodes for non-segment curve pairs", () => {
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

  const result = appCommandForKey("i")?.run(appState(graph, viewState, null));

  expect(result?.history).toBe("commit");
  if (!result) {
    throw new Error("Expected I command result");
  }

  const curveIntersections = result.state.graph.nodes.filter(
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
