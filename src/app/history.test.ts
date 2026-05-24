import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import { freePoint } from "../representation/node";
import { appState } from "./appState";
import {
  appStateFromHistory,
  commitHistory,
  initialHistory,
  redoHistory,
  snapshotFromAppState,
  undoHistory,
} from "./history";
import {
  emptyViewState,
  setHoveredNode,
  setViewportCenter,
  toggleSelectedNode,
} from "./viewState";
import { vec2 } from "../meaning/vec2";

describe("app/history", () => {
  test("initializes with one present snapshot and empty past/future", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const history = initialHistory(state);

    expect(history.past).toEqual([]);
    expect(history.present).toEqual(snapshotFromAppState(state));
    expect(history.future).toEqual([]);
    expect(Object.isFrozen(history)).toBe(true);
  });

  test("snapshot clears hover and excludes drag state", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(
      graph,
      setHoveredNode(emptyViewState(), "A"),
      {
        kind: "FREE_POINT",
        nodeId: "A",
      },
    );

    const snapshot = snapshotFromAppState(state);

    expect(snapshot.graph).toBe(graph);
    expect(snapshot.viewState.hoveredNodeId).toBeNull();
  });

  test("commits a changed snapshot", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const first = appState(graph, emptyViewState(), null);
    const second = appState(
      graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );

    const history = commitHistory(initialHistory(first), second);

    expect(history.past).toEqual([snapshotFromAppState(first)]);
    expect(history.present).toEqual(snapshotFromAppState(second));
    expect(history.future).toEqual([]);
  });

  test("committing the same snapshot is a no-op", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const history = initialHistory(state);

    expect(commitHistory(history, state)).toBe(history);
  });

  test("undo moves present to future and restores the previous snapshot", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const first = appState(graph, emptyViewState(), null);
    const second = appState(
      graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );

    const committed = commitHistory(initialHistory(first), second);
    const undone = undoHistory(committed);

    expect(undone.past).toEqual([]);
    expect(undone.present).toEqual(snapshotFromAppState(first));
    expect(undone.future).toEqual([snapshotFromAppState(second)]);
  });

  test("undo is a no-op when there is no past", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const history = initialHistory(state);

    expect(undoHistory(history)).toBe(history);
  });

  test("redo moves present to past and restores the next snapshot", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const first = appState(graph, emptyViewState(), null);
    const second = appState(
      graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );

    const undone = undoHistory(commitHistory(initialHistory(first), second));
    const redone = redoHistory(undone);

    expect(redone.past).toEqual([snapshotFromAppState(first)]);
    expect(redone.present).toEqual(snapshotFromAppState(second));
    expect(redone.future).toEqual([]);
  });

  test("redo is a no-op when there is no future", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const history = initialHistory(state);

    expect(redoHistory(history)).toBe(history);
  });

  test("committing after undo discards redo future", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const first = appState(graph, emptyViewState(), null);
    const second = appState(
      graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );
    const third = appState(
      graph,
      setViewportCenter(emptyViewState(), vec2(2, 3)),
      null,
    );

    const undone = undoHistory(commitHistory(initialHistory(first), second));
    const forked = commitHistory(undone, third);

    expect(forked.past).toEqual([snapshotFromAppState(first)]);
    expect(forked.present).toEqual(snapshotFromAppState(third));
    expect(forked.future).toEqual([]);
  });

  test("appStateFromHistory restores present with a chosen drag state", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(
      graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );

    const restored = appStateFromHistory(initialHistory(state), {
      kind: "FREE_POINT",
      nodeId: "A",
    });

    expect(restored.graph).toBe(graph);
    expect(restored.viewState).toEqual(snapshotFromAppState(state).viewState);
    expect(restored.dragState).toEqual({
      kind: "FREE_POINT",
      nodeId: "A",
    });
  });
});
