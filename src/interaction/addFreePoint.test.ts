import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  freePoint,
  triangleNode,
  triangleSideMidpointNode,
} from "../representation/node";
import { addFreePoint } from "./addFreePoint";

describe("interaction/addFreePoint", () => {
  test("adds a new free point and returns a valid graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),
    ]);

    const next = addFreePoint(graph, vec2(3, 2));
    const evaluated = evaluateGraph(next);

    expect(next.byId.get("P1")).toEqual(freePoint("P1", 3, 2, "P1"));

    expect(evaluated.values.get("P1")).toEqual({
      kind: "POINT",
      id: "P1",
      point: vec2(3, 2),
      label: "P1",
      role: "FREE",
    });
  });

  test("chooses the next available P-number id", () => {
    const graph = createGraph([
      freePoint("P1", 0, 0, "P1"),
      freePoint("P2", 1, 1, "P2"),
    ]);

    const next = addFreePoint(graph, vec2(2, 2));

    expect(next.byId.get("P3")).toEqual(freePoint("P3", 2, 2, "P3"));
  });

  test("does not mutate the previous graph", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    const next = addFreePoint(graph, vec2(3, 2));

    expect(graph.byId.get("P1")).toBeUndefined();
    expect(next.byId.get("P1")).toEqual(freePoint("P1", 3, 2, "P1"));
  });
});
