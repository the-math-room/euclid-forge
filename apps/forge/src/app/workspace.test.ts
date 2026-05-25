import { describe, expect, test } from "vitest";
import {
  parseSerializedWorkspace,
  serializeWorkspace,
} from "@euclid-forge/core";
import { vec2 } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  centroidNode,
  freePoint,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { appState } from "./appState";
import { deserializeWorkspace } from "./workspace";
import {
  emptyViewState,
  setHoveredNode,
  setViewportCenter,
  setViewportRotation,
  setViewportZoom,
  toggleSelectedNode,
  hideSelectedNodes,
} from "./viewState";

describe("app/workspace", () => {
  test("serializes graph nodes and durable view state", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const selected = toggleSelectedNode(emptyViewState(), "ABC");
    const hidden = hideSelectedNodes(
      toggleSelectedNode(selected, "G"),
    );
    const viewState = setViewportRotation(
      setViewportZoom(
        setViewportCenter(hidden, vec2(3, -4)),
        120,
      ),
      Math.PI / 3,
    );

    const workspace = serializeWorkspace(
      appState(graph, setHoveredNode(viewState, "A"), null),
    );

    expect(workspace).toEqual({
      version: 1,
      nodes: graph.nodes,
      view: {
        selectedNodeIds: [],
        hiddenNodeIds: ["ABC", "G"],
        viewportCenter: vec2(3, -4),
        viewportZoom: 120,
        viewportRotation: Math.PI / 3,
      },
    });
  });

  test("does not serialize hover or drag state", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(
      graph,
      setHoveredNode(emptyViewState(), "A"),
      {
        kind: "FREE_POINT",
        nodeId: "A",
      },
    );

    const workspace = serializeWorkspace(state);
    const restored = deserializeWorkspace(workspace);

    expect(restored.viewState.hoveredNodeId).toBeNull();
    expect(restored.dragState).toBeNull();
  });

  test("deserializes through graph validation", () => {
    const workspace = {
      version: 1 as const,
      nodes: [
        freePoint("A", -2, -1, "A"),
        freePoint("B", 2, -1, "B"),
        segmentNode("AB", "A", "B"),
      ],
      view: {
        selectedNodeIds: ["AB"],
        hiddenNodeIds: ["A"],
        viewportCenter: vec2(1, 2),
        viewportZoom: 90,
        viewportRotation: Math.PI / 6,
      },
    };

    const state = deserializeWorkspace(workspace);

    expect(state.graph.byId.get("AB")).toEqual(segmentNode("AB", "A", "B"));
    expect([...state.viewState.selectedNodeIds]).toEqual(["AB"]);
    expect([...state.viewState.hiddenNodeIds]).toEqual(["A"]);
    expect(state.viewState.hoveredNodeId).toBeNull();
    expect(state.viewState.viewportCenter).toEqual(vec2(1, 2));
    expect(state.viewState.viewportZoom).toBe(90);
    expect(state.viewState.viewportRotation).toBe(Math.PI / 6);
    expect(state.dragState).toBeNull();
  });

  test("throws on unsupported workspace version", () => {
    expect(() =>
      deserializeWorkspace({
        version: 2 as 1,
        nodes: [],
        view: {
          selectedNodeIds: [],
          hiddenNodeIds: [],
          viewportCenter: vec2(0, 0),
          viewportZoom: 80,
          viewportRotation: 0,
        },
      }),
    ).toThrow("Unsupported workspace version: 2");
  });

  test("throws on invalid graph dependencies", () => {
    expect(() =>
      deserializeWorkspace({
        version: 1,
        nodes: [segmentNode("AB", "A", "B")],
        view: {
          selectedNodeIds: [],
          hiddenNodeIds: [],
          viewportCenter: vec2(0, 0),
          viewportZoom: 80,
          viewportRotation: 0,
        },
      }),
    ).toThrow("Missing dependency: AB depends on A");
  });

  test("parses unknown JSON into a serialized workspace", () => {
    const workspace = parseSerializedWorkspace({
      version: 1,
      nodes: [freePoint("A", 0, 0, "A")],
      view: {
        selectedNodeIds: ["A"],
        hiddenNodeIds: [],
        viewportCenter: { x: 2, y: 3 },
        viewportZoom: 100,
        viewportRotation: 0.25,
      },
    });

    expect(workspace).toEqual({
      version: 1,
      nodes: [freePoint("A", 0, 0, "A")],
      view: {
        selectedNodeIds: ["A"],
        hiddenNodeIds: [],
        viewportCenter: vec2(2, 3),
        viewportZoom: 100,
        viewportRotation: 0.25,
      },
    });
  });

  test("parse rejects malformed workspace objects", () => {
    expect(() => parseSerializedWorkspace(null)).toThrow(
      "Workspace must be an object",
    );

    expect(() =>
      parseSerializedWorkspace({
        version: 1,
        nodes: "not nodes",
        view: {},
      }),
    ).toThrow("Workspace nodes must be an array");

    expect(() =>
      parseSerializedWorkspace({
        version: 1,
        nodes: [],
        view: {
          selectedNodeIds: [],
          hiddenNodeIds: [],
          viewportCenter: { x: 0 },
          viewportZoom: 80,
          viewportRotation: 0,
        },
      }),
    ).toThrow("Workspace viewportCenter must be a vector");
  });
});
