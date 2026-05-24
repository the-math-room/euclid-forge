import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  circleNode,
  freePoint,
  segmentNode,
  triangleNode,
} from "../representation/node";
import { evaluateGraph } from "./evaluateGraph";
import { visibleEvaluatedScene } from "./visibleScene";

describe("evaluation/visibleEvaluatedScene", () => {
  test("returns the same scene when no hidden nodes are provided", () => {
    const scene = evaluateGraph(createGraph([freePoint("A", 0, 0, "A")]));

    expect(visibleEvaluatedScene(scene)).toBe(scene);
  });

  test("returns the same scene when hidden node set is empty", () => {
    const scene = evaluateGraph(createGraph([freePoint("A", 0, 0, "A")]));

    expect(
      visibleEvaluatedScene(scene, {
        hiddenNodeIds: new Set(),
      }),
    ).toBe(scene);
  });

  test("filters hidden evaluated values from ordered and values", () => {
    const scene = evaluateGraph(
      createGraph([
        freePoint("A", -2, -1, "A"),
        freePoint("B", 2, -1, "B"),
        freePoint("C", 0, 2, "C"),
        triangleNode("ABC", "A", "B", "C"),
        segmentNode("AB", "A", "B"),
        centroidNode("G", "ABC", "G"),
      ]),
    );

    const visible = visibleEvaluatedScene(scene, {
      hiddenNodeIds: new Set(["ABC", "G"]),
    });

    expect(visible).not.toBe(scene);
    expect(visible.values.has("ABC")).toBe(false);
    expect(visible.values.has("G")).toBe(false);
    expect(visible.ordered.map((value) => value.id)).toEqual([
      "A",
      "B",
      "C",
      "AB",
    ]);
  });
});
