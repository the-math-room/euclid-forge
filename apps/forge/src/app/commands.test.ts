import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  centroidNode,
  circleNode,
  freePoint,
  lineNode,
  midpointNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
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
    expect(appCommandForKey("J")?.id).toBe("join-selected-free-points");
    expect(appCommandForKey("j")?.id).toBe("join-selected-free-points");
    expect(appCommandForKey("q")?.id).toBe("toggle-segment-measurement");
    expect(appCommandForKey("f")?.id).toBe("create-polygon");
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

  test("joins two selected free points into a segment", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    const result = appCommandForKey("j")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("S_A_B")).toEqual(
      segmentNode("S_A_B", "A", "B"),
    );
    expect(result?.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("creates a polygon from a selected closed segment cycle", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 1, 1, "C"),
      freePoint("D", 0, 1, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("BC", "B", "C"),
      segmentNode("CD", "C", "D"),
      segmentNode("DA", "D", "A"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(
        toggleSelectedNode(toggleSelectedNode(emptyViewState(), "AB"), "BC"),
        "CD",
      ),
      "DA",
    );

    const result = appCommandForKey("f")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("PG1")).toEqual({
      kind: "POLYGON",
      id: "PG1",
      vertices: ["A", "B", "C", "D"],
    });
    expect(result?.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("toggles a length measurement for one selected segment with q", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "AB");

    const result = appCommandForKey("q")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("M_AB")).toEqual({
      kind: "SEGMENT_MEASUREMENT",
      id: "M_AB",
      segment: "AB",
      precision: "auto",
    });
    expect(result?.state.viewState.selectedNodeIds.has("AB")).toBe(true);

    const removed = appCommandForKey("q")?.run(result!.state);

    expect(removed?.history).toBe("commit");
    expect(removed?.state.graph.byId.has("M_AB")).toBe(false);
  });

  test("creates a line from two selected constructible points with L", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );

    const result = appCommandForKey("l")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("L_A_B")).toEqual(
      lineNode("L_A_B", "A", "B"),
    );
    expect(result?.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("join selected free points is disabled unless two or three free points are selected", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const command = appCommandForKey("j");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(graph, toggleSelectedNode(emptyViewState(), "A"), null),
        ),
    ).toBe("");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(
            graph,
            toggleSelectedNode(
              toggleSelectedNode(emptyViewState(), "A"),
              "ABC",
            ),
            null,
          ),
        ),
    ).toBe("");
  });

  test("joins derived point inputs", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "M"),
      "G",
    );

    const result = appCommandForKey("j")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.nodes).toContainEqual(
      expect.objectContaining({
        kind: "SEGMENT",
        a: "M",
        b: "G",
      }),
    );
  });

  test("creates a circle from derived point inputs", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M", "AB", "M"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "G"),
      "M",
    );

    const result = appCommandForKey("c")?.run(appState(graph, viewState, null));

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.nodes).toContainEqual(
      expect.objectContaining({
        kind: "CIRCLE",
        center: "G",
        through: "M",
      }),
    );
  });

  test("creates a circle from two selected free points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const viewState = toggleSelectedNode(
      toggleSelectedNode(emptyViewState(), "A"),
      "B",
    );
    const command = appCommandForKey("c");
    const state = appState(graph, viewState, null);

    expect(command && appCommandDisabledReason(command, state)).toBeNull();

    const result = command?.run(state);

    expect(result?.history).toBe("commit");
    expect(result?.state.graph.byId.get("C1")).toEqual(
      circleNode("C1", "A", "B"),
    );
    expect(result?.state.viewState.selectedNodeIds.size).toBe(0);
  });

  test("create circle is disabled unless exactly two free points are selected", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const command = appCommandForKey("c");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(graph, toggleSelectedNode(emptyViewState(), "A"), null),
        ),
    ).toBe("");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(
            graph,
            toggleSelectedNode(
              toggleSelectedNode(
                toggleSelectedNode(emptyViewState(), "A"),
                "B",
              ),
              "C",
            ),
            null,
          ),
        ),
    ).toBe("");

    expect(
      command &&
        appCommandDisabledReason(
          command,
          appState(
            graph,
            toggleSelectedNode(
              toggleSelectedNode(emptyViewState(), "ABC"),
              "A",
            ),
            null,
          ),
        ),
    ).toBe("");
  });

  test("joins three selected free points into a triangle", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 2, 0, "P2"),
      freePoint("P3", 1, 2, "P3"),
    ]);

    const viewState = toggleSelectedNode(
      toggleSelectedNode(toggleSelectedNode(emptyViewState(), "P1"), "P2"),
      "P3",
    );

    const result = appCommandForKey("j")?.run(appState(graph, viewState, null));

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

    const command = appCommandForKey("j");
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
      centroidNode("G1", "T1", "A"),
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
    expect(result?.state.graph.byId.get("B")).toEqual(
      freePoint("B", 1, 1, "B"),
    );
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

  test("delete selected cascades through unselected dependents", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);
    const state = appState(
      graph,
      {
        ...emptyViewState(),
        selectedNodeIds: new Set(["A"]),
      },
      null,
    );
    const command = appCommandForKey("Delete");

    expect(command && appCommandDisabledReason(command, state)).toBeNull();

    if (!command) {
      throw new Error("Missing delete command");
    }

    const result = command.run(state);

    expect(result.history).toBe("commit");
    expect(result.state.graph.byId.has("A")).toBe(false);
    expect(result.state.graph.byId.has("ABC")).toBe(false);
    expect(result.state.graph.byId.has("B")).toBe(true);
    expect(result.state.graph.byId.has("C")).toBe(true);
  });

  test("delete selected is disabled when selection is empty", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const command = appCommandForKey("Delete");
    const state = appState(graph, emptyViewState(), null);

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });

  test("z-order commands update selected node z-indices", () => {
    const graph = createGraph([
      { ...freePoint("A", 0, 0, "A"), zIndex: 0 },
      { ...freePoint("B", 1, 0, "B"), zIndex: 1 },
      { ...freePoint("C", 2, 0, "C"), zIndex: 2 },
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "B");

    const forward = appCommandForKey("PageUp")?.run(
      appState(graph, viewState, null),
    );

    expect(forward?.history).toBe("commit");
    expect(forward?.state.graph.byId.get("B")).toEqual({
      ...freePoint("B", 1, 0, "B"),
      zIndex: 2,
    });
    expect(forward?.state.graph.byId.get("C")).toEqual({
      ...freePoint("C", 2, 0, "C"),
      zIndex: 1,
    });
  });

  test("shift page z-order command moves selected node to front", () => {
    const graph = createGraph([
      { ...freePoint("A", 0, 0, "A"), zIndex: 0 },
      { ...freePoint("B", 1, 0, "B"), zIndex: 1 },
      { ...freePoint("C", 2, 0, "C"), zIndex: 2 },
    ]);
    const viewState = toggleSelectedNode(emptyViewState(), "A");

    const command = appCommandForKey("PageUp", { shiftKey: true });
    const result = command?.run(appState(graph, viewState, null));

    expect(command?.id).toBe("bring-selected-to-front");
    expect(result?.state.graph.byId.get("A")).toEqual({
      ...freePoint("A", 0, 0, "A"),
      zIndex: 2,
    });
  });

  test("z-order commands are disabled with empty selection", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);
    const command = appCommandForKey("PageUp");

    expect(command && appCommandDisabledReason(command, state)).toBe("");
  });
});
