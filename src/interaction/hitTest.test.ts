import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import {
  centroidNode,
  freePoint,
  triangleNode,
  triangleSideMidpointNode,
} from "../representation/node";
import type { Viewport } from "../rendering/viewport";
import { worldToScreen } from "../rendering/viewport";
import { hitTestFreePoint, hitTestTriangleInterior } from "./hitTest";

describe("interaction/hitTestFreePoint", () => {
  const viewport: Viewport = {
    width: 800,
    height: 600,
    center: vec2(0, 0),
    zoom: 80,
  };

  test("finds a nearby free point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(-2, -1));

    expect(hitTestFreePoint(graph, evaluated, viewport, screen)).toBe("A");
  });

  test("finds the closest nearby free point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, 2));

    expect(hitTestFreePoint(graph, evaluated, viewport, screen)).toBe("C");
  });

  test("ignores constrained midpoint and centroid", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      triangleSideMidpointNode("M_AB", "ABC", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestFreePoint(graph, evaluated, viewport, worldToScreen(viewport, vec2(0, -1))),
    ).toBeNull();

    expect(
      hitTestFreePoint(graph, evaluated, viewport, worldToScreen(viewport, vec2(0, 0))),
    ).toBeNull();
  });

  test("returns null when no free point is nearby", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestFreePoint(graph, evaluated, viewport, { x: 10, y: 10 }),
    ).toBeNull();
  });
});

describe("interaction/hitTestTriangleInterior", () => {
  const viewport: Viewport = {
    width: 800,
    height: 600,
    center: vec2(0, 0),
    zoom: 80,
  };

  test("finds a triangle from an interior point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, 0));

    expect(hitTestTriangleInterior(graph, evaluated, viewport, screen)).toEqual({
      id: "ABC",
      vertexIds: ["A", "B", "C"],
    });
  });

  test("returns null outside the triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(3, 3));

    expect(hitTestTriangleInterior(graph, evaluated, viewport, screen)).toBeNull();
  });
});
