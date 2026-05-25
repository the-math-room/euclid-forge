import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import { freePoint } from "../representation/node";
import {
  bringNodesForward,
  bringNodesToFront,
  sendNodesBackward,
  sendNodesToBack,
} from "./zOrder";

function graphWithZ() {
  return createGraph([
    { ...freePoint("A", 0, 0, "A"), zIndex: 0 },
    { ...freePoint("B", 1, 0, "B"), zIndex: 1 },
    { ...freePoint("C", 2, 0, "C"), zIndex: 2 },
    { ...freePoint("D", 3, 0, "D"), zIndex: 3 },
  ]);
}

function updatesToObject(updates: ReadonlyMap<string, number>) {
  return Object.fromEntries(updates);
}

describe("app/zOrder", () => {
  test("brings selected nodes forward by one slot", () => {
    expect(updatesToObject(bringNodesForward(graphWithZ(), ["B"]))).toEqual({
      B: 2,
      C: 1,
    });
  });

  test("sends selected nodes backward by one slot", () => {
    expect(updatesToObject(sendNodesBackward(graphWithZ(), ["C"]))).toEqual({
      B: 2,
      C: 1,
    });
  });

  test("brings selected nodes to front", () => {
    expect(updatesToObject(bringNodesToFront(graphWithZ(), ["B"]))).toEqual({
      C: 1,
      D: 2,
      B: 3,
    });
  });

  test("sends selected nodes to back", () => {
    expect(updatesToObject(sendNodesToBack(graphWithZ(), ["C"]))).toEqual({
      C: 0,
      A: 1,
      B: 2,
    });
  });

  test("preserves relative order for multi-selection", () => {
    expect(updatesToObject(bringNodesToFront(graphWithZ(), ["B", "C"]))).toEqual({
      D: 1,
      B: 2,
      C: 3,
    });
  });

  test("returns no updates for empty selection", () => {
    expect([...bringNodesForward(graphWithZ(), [])]).toEqual([]);
    expect([...sendNodesBackward(graphWithZ(), [])]).toEqual([]);
    expect([...bringNodesToFront(graphWithZ(), [])]).toEqual([]);
    expect([...sendNodesToBack(graphWithZ(), [])]).toEqual([]);
  });
});
