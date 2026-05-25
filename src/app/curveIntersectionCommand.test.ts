import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  freePoint,
} from "../representation/node";
import { appState } from "./appState";
import { appCommandForKey } from "./commands";
import { emptyViewState, toggleSelectedNode } from "./viewState";

describe("app curve intersection command", () => {
  test("creates one node per selected circle-circle intersection candidate", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("AR", 5, 0, "AR"),
      freePoint("B", 8, 0, "B"),
      freePoint("BR", 13, 0, "BR"),
      circleNode("circleA", "A", "AR"),
      circleNode("circleB", "B", "BR"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "circleA"),
      "circleB",
    );

    const result = appCommandForKey("i")?.run(appState(graph, viewState, null));

    if (!result) {
      throw new Error("Expected I command result");
    }

    const curveIntersections = result.state.graph.nodes.filter(
      (node) => node.kind === "CURVE_INTERSECTION",
    );

    expect(result.history).toBe("commit");
    expect(curveIntersections.map((node) => node.branchKey).sort()).toEqual([
      "circle-circle:0",
      "circle-circle:1",
    ]);
    expect(
      curveIntersections.every(
        (node) =>
          node.curveA === "circleA" && node.curveB === "circleB",
      ),
    ).toBe(true);
  });

  test("reports a status message when selected curves have no candidates", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("AR", 1, 0, "AR"),
      freePoint("B", 5, 0, "B"),
      freePoint("BR", 6, 0, "BR"),
      circleNode("circleA", "A", "AR"),
      circleNode("circleB", "B", "BR"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "circleA"),
      "circleB",
    );

    const result = appCommandForKey("i")?.run(appState(graph, viewState, null));

    expect(result).toEqual({
      state: appState(graph, viewState, null),
      history: "ignore",
      statusMessage: "No currently defined curve intersection candidates to create.",
    });
  });
});
