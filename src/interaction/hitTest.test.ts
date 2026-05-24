import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import { freePoint, midpointNode, segmentNode } from "../representation/node";
import type { Viewport } from "../rendering/viewport";
import { worldToScreen } from "../rendering/viewport";
import { hitTestFreePoint } from "./hitTest";

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
      segmentNode("AB", "A", "B"),
      segmentNode("BC", "B", "C"),
      segmentNode("CA", "C", "A"),
      midpointNode("M_AB", "AB", "M"),
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
      segmentNode("AB", "A", "B"),
      segmentNode("BC", "B", "C"),
      segmentNode("CA", "C", "A"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, 2));

    expect(hitTestFreePoint(graph, evaluated, viewport, screen)).toBe("C");
  });

  test("ignores constrained midpoint", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, -1));

    expect(hitTestFreePoint(graph, evaluated, viewport, screen)).toBeNull();
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
