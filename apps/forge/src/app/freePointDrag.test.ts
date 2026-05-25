import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core/meaning/vec2";
import { createGraph } from "@euclid-forge/core/representation/graph";
import { freePoint, triangleNode } from "@euclid-forge/core/representation/node";
import {
  initialFreePointPositions,
  translatedFreePointPositions,
} from "./freePointDrag";

describe("app/freePointDrag", () => {
  test("captures initial free-point positions", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    expect([...initialFreePointPositions(graph, ["A", "B"])]).toEqual([
      ["A", vec2(-2, -1)],
      ["B", vec2(2, -1)],
    ]);
  });

  test("rejects missing points", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    expect(() =>
      initialFreePointPositions(graph, ["missing"], "test drag"),
    ).toThrow("Cannot start test drag with missing point: missing");
  });

  test("rejects constrained points", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    expect(() =>
      initialFreePointPositions(graph, ["ABC"], "test drag"),
    ).toThrow("Cannot start test drag with constrained point: ABC");
  });

  test("translates captured positions by a delta", () => {
    const initial = new Map([
      ["A", vec2(-2, -1)],
      ["B", vec2(2, -1)],
    ]);

    expect([...translatedFreePointPositions(initial, vec2(3, 4))]).toEqual([
      ["A", vec2(1, 3)],
      ["B", vec2(5, 3)],
    ]);
  });
});
