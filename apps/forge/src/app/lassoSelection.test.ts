import { describe, expect, test } from "vitest";
import { evaluateGraph, visibleEvaluatedScene } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  circleNode,
  freePoint,
  lineNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { testViewport } from "../testHelpers/viewport";
import { lassoSelectableNodeIds } from "./lassoSelection";

const viewport = testViewport();

function polygonAround(minX: number, minY: number, maxX: number, maxY: number) {
  return [
    worldToScreen(viewport, { x: minX, y: minY }),
    worldToScreen(viewport, { x: maxX, y: minY }),
    worldToScreen(viewport, { x: maxX, y: maxY }),
    worldToScreen(viewport, { x: minX, y: maxY }),
  ];
}

describe("app/lassoSelection", () => {
  test("selects visible points whose rendered disks are fully contained", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
    ]);
    const evaluated = evaluateGraph(graph);

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-0.5, -0.5, 0.5, 0.5),
      }),
    ).toEqual(["A"]);
  });

  test("does not select a point whose rendered disk crosses the lasso boundary", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const evaluated = evaluateGraph(graph);

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-0.02, -0.02, 0.02, 0.02),
      }),
    ).toEqual([]);
  });

  test("selects segment triangle and their contained vertices independently", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 2, 0, "B"),
      freePoint("C", 0, 2, "C"),
      segmentNode("AB", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
    ]);
    const evaluated = evaluateGraph(graph);

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-0.5, -0.5, 2.5, 2.5),
      }),
    ).toEqual(["A", "B", "C", "AB", "ABC"]);
  });

  test("selects circles by sampled circumference containment", () => {
    const graph = createGraph([
      freePoint("O", 0, 0, "O"),
      freePoint("R", 1, 0, "R"),
      circleNode("circle", "O", "R"),
    ]);
    const evaluated = evaluateGraph(graph);

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-1.5, -1.5, 1.5, 1.5),
      }),
    ).toEqual(["O", "R", "circle"]);
  });

  test("excludes infinite lines from lasso selection", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      lineNode("line", "A", "B"),
    ]);
    const evaluated = evaluateGraph(graph);

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-2, -2, 2, 2),
      }),
    ).toEqual(["A", "B"]);
  });

  test("respects visible evaluated scene filtering", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
    ]);
    const evaluated = visibleEvaluatedScene(evaluateGraph(graph), {
      hiddenNodeIds: new Set(["A"]),
    });

    expect(
      lassoSelectableNodeIds({
        evaluated,
        viewport,
        polygon: polygonAround(-2, -2, 2, 2),
      }),
    ).toEqual(["B"]);
  });
});
