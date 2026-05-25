import { describe, expect, test } from "vitest";
import { appState } from "./appState";
import {
  appCommandDisabledReason,
  appCommandForKey,
} from "./commands";
import { emptyViewState, toggleSelectedNode } from "./viewState";
import { createGraph } from "../representation/graph";
import {
  circleNode,
  freePoint,
  segmentIntersectionNode,
  segmentNode,
} from "../representation/node";

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
      segmentIntersectionNode("X1", "AB", "CD", "X1"),
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


  test("recognizes non-segment curve pairs but does not persist them yet", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
      circleNode("circle", "A", "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "AB"),
      "circle",
    );

    const result = appCommandForKey("i")?.run(appState(graph, viewState, null));

    expect(result).toEqual({
      state: appState(graph, viewState, null),
      history: "ignore",
      statusMessage:
        "Curve intersection candidates are available in the meaning layer, but only segment-segment intersections can be persisted as graph nodes yet.",
    });
  });
