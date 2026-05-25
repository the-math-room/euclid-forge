import { describe, expect, test } from "vitest";
import { createGraph } from "./graph";
import { centroidNode, freePoint, segmentNode, triangleNode } from "./node";
import {
  canDeleteNodes,
  cascadingDeleteIds,
  deleteNodesDisabledReason,
} from "./deletePolicy";

describe("representation/deletePolicy", () => {
  test("allows deleting nodes with no dependents", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 1, "B"),
    ]);

    expect(canDeleteNodes(graph, ["A"])).toBe(true);
    expect(deleteNodesDisabledReason(graph, ["A"])).toBeNull();
    expect([...cascadingDeleteIds(graph, ["A"])]).toEqual(["A"]);
  });

  test("allows deleting a root node by cascading to dependents", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      centroidNode("G", "ABC", "G"),
    ]);

    expect(canDeleteNodes(graph, ["A"])).toBe(true);
    expect(deleteNodesDisabledReason(graph, ["A"])).toBeNull();
    expect([...cascadingDeleteIds(graph, ["A"])].sort()).toEqual([
      "A",
      "AB",
      "ABC",
      "G",
    ]);
  });

  test("rejects empty deletion sets", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(canDeleteNodes(graph, [])).toBe(false);
    expect(deleteNodesDisabledReason(graph, [])).toBe(
      "Select one or more nodes to delete.",
    );
  });

  test("rejects missing nodes", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(canDeleteNodes(graph, ["missing"])).toBe(false);
    expect(deleteNodesDisabledReason(graph, ["missing"])).toBe(
      "Cannot delete missing node: missing.",
    );
  });
});
