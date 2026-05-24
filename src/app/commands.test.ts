import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  segmentNode,
  triangleNode,
} from "../representation/node";
import { appState } from "./appState";
import {
  APP_COMMANDS,
  appCommandDisabledReason,
  appCommandForKey,
} from "./commands";
import {
  emptyViewState,
  hideSelectedNodes,
  toggleSelectedNode,
} from "./viewState";

describe("app/commands", () => {
  test("has unique command ids", () => {
    const ids = APP_COMMANDS.map((command) => command.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  test("looks up commands by normalized key", () => {
    expect(appCommandForKey("T")?.id).toBe("create-triangle");
    expect(appCommandForKey("t")?.id).toBe("create-triangle");
    expect(appCommandForKey("ArrowLeft")?.id).toBe("pan-viewport-left");
    expect(appCommandForKey("unknown")).toBeNull();
  });

  test("viewport commands ignore history", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const result = appCommandForKey("ArrowLeft")?.run(state);

    expect(result?.history).toBe("ignore");
    expect(result?.state.viewState.viewportCenter).toEqual(vec2(-0.5, 0));
  });

  test("creates a triangle from three selected free points", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "P3",
    );

    const result = appCommandForKey("t")?.run(
      appState(graph, viewState, null),
    );

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("T1")).toEqual(
      triangleNode("T1", "P1", "P2", "P3"),
    );
    expect([...(result?.state.viewState.selectedNodeIds ?? [])]).toEqual([]);
  });

  test("create triangle is disabled unless exactly three free points are selected", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "T1",
    );

    const command = appCommandForKey("t");
    const state = appState(graph, viewState, null);

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });

  test("creates a centroid for one selected triangle", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(emptyViewState(), "T1");
    const result = appCommandForKey("g")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("G1")).toEqual(
      centroidNode("G1", "T1", "G1"),
    );
  });

  test("creates side midpoints for one selected triangle", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
      triangleNode("T1", "P1", "P2", "P3"),
    ]);

    const viewState = toggleSelectedNode(emptyViewState(), "T1");
    const result = appCommandForKey("m")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("S_P1_P2")).toEqual(
      segmentNode("S_P1_P2", "P1", "P2"),
    );
  });

  test("hides selected nodes", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");

    const result = appCommandForKey("h")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect([...(result?.state.viewState.selectedNodeIds ?? [])]).toEqual([]);
    expect([...(result?.state.viewState.hiddenNodeIds ?? [])]).toEqual(["A"]);
  });

  test("hide selected is disabled when nothing is selected", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const command = appCommandForKey("h");
    const state = appState(graph, emptyViewState(), null);

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });

  test("unhides all nodes", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const viewState = hideSelectedNodes(
      toggleSelectedNode(emptyViewState(), "A"),
    );

    const result = appCommandForKey("u")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect([...(result?.state.viewState.hiddenNodeIds ?? [])]).toEqual([]);
  });

  test("unhide all is disabled when nothing is hidden", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const command = appCommandForKey("u");
    const state = appState(graph, emptyViewState(), null);

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });
  test("deletes selected nodes when no unselected dependents exist", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 1, "B"),
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");

    const result = appCommandForKey("Delete")?.run(
      appState(graph, viewState, null),
    );

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.has("A")).toBe(false);
    expect(result?.state.graph.byId.get("B")).toEqual(freePoint("B", 1, 1, "B"));
    expect([...(result?.state.viewState.selectedNodeIds ?? [])]).toEqual([]);
  });

  test("deletes a selected subgraph when all dependents are selected", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "ABC"),
      "G",
    );

    const result = appCommandForKey("Backspace")?.run(
      appState(graph, viewState, null),
    );

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.has("ABC")).toBe(false);
    expect(result?.state.graph.byId.has("G")).toBe(false);
  });

  test("delete selected explains unselected dependents", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");
    const state = appState(graph, viewState, null);
    const command = appCommandForKey("Delete");

    expect(command && appCommandDisabledReason(command, state)).toBe(
      "Cannot delete A; ABC depends on it. Select dependents too, or hide instead.",
    );
  });

  test("delete selected is disabled when selection is empty", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const command = appCommandForKey("Delete");
    const state = appState(graph, emptyViewState(), null);

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });

});
