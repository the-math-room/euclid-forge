import { describe, expect, test } from "vitest";
import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";
import { evaluateGraph } from "@euclid-forge/core";
import { vec2 } from "@euclid-forge/core";
import { createGraph } from "@euclid-forge/core";
import {
  centroidNode,
  circleNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { testViewport } from "../testHelpers/viewport";
import {
  hitTestCircleSelection,
  hitTestCircleTarget,
  hitTestFreePoint,
  hitTestFreePointTarget,
  hitTestPoint,
  hitTestPointTarget,
  hitTestSegmentSelection,
  hitTestSegmentTarget,
  hitTestTriangleInterior,
  hitTestTriangleSelection,
  hitTestTriangleTarget,
  hitTestSelectionTarget,
} from "./hitTest";

function evaluatedScene(values: readonly EvaluatedGeometry[]) {
  return Object.freeze({
    values: new Map(values.map((value) => [value.id, value])),
    ordered: Object.freeze([...values]),
    issues: Object.freeze([]),
  });
}

describe("interaction/hitTestPoint", () => {
  const viewport = testViewport();

  test("finds a nearby free point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestPoint(evaluated, viewport, worldToScreen(viewport, vec2(-2, -1))),
    ).toBe("A");
  });

  test("finds a nearby constrained centroid", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestPoint(evaluated, viewport, worldToScreen(viewport, vec2(0, 0))),
    ).toBe("G");
  });

  test("finds a nearby constrained midpoint", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestPoint(evaluated, viewport, worldToScreen(viewport, vec2(0, -1))),
    ).toBe("M_AB");
  });

  test("breaks exact point hit ties by reverse visual order", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 0, 0, "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestPoint(evaluated, viewport, worldToScreen(viewport, vec2(0, 0))),
    ).toBe("B");
  });

  test("returns null when no point is nearby", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(hitTestPoint(evaluated, viewport, { x: 10, y: 10 })).toBeNull();
  });
});

describe("interaction/hitTestFreePoint", () => {
  const viewport = testViewport();

  test("finds a nearby free point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
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
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
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
      segmentNode("AB", "A", "B"),
      midpointNode("M_AB", "AB", "M"),
      centroidNode("G", "ABC", "G"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestFreePoint(
        graph,
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, -1)),
      ),
    ).toBeNull();

    expect(
      hitTestFreePoint(
        graph,
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toBeNull();
  });

  test("breaks exact free point hit ties by reverse visual order", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 0, 0, "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestFreePoint(
        graph,
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toBe("B");
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

describe("interaction/hitTestSegmentSelection", () => {
  const viewport = testViewport();

  test("finds a nearby segment", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestSegmentSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, -1)),
      ),
    ).toBe("AB");
  });

  test("breaks exact segment hit ties by reverse visual order", () => {
    const graph = createGraph([
      freePoint("A", -1, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", -1, 0, "C"),
      freePoint("D", 1, 0, "D"),
      segmentNode("AB", "A", "B"),
      segmentNode("CD", "C", "D"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestSegmentSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toBe("CD");
  });

  test("returns null when no segment is nearby", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestSegmentSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 1)),
      ),
    ).toBeNull();
  });
});

describe("interaction/hitTestTriangleSelection", () => {
  const viewport = testViewport();

  test("finds a selectable triangle from an interior point", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestTriangleSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toEqual({ id: "ABC" });
  });

  test("finds a triangle even when it has a constrained vertex", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
      triangleNode("ABG", "A", "B", "G"),
    ]);

    const evaluated = evaluateGraph(graph);
    const constrainedOnly = {
      values: new Map([...evaluated.values].filter(([id]) => id === "ABG")),
      ordered: [...evaluated.ordered].filter((value) => value.id === "ABG"),

      issues: [],
    };

    expect(
      hitTestTriangleSelection(
        constrainedOnly,
        viewport,
        worldToScreen(viewport, vec2(0, -0.75)),
      ),
    ).toEqual({ id: "ABG" });
  });

  test("selects the later-rendered overlapping triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", -1, -0.5, "D"),
      freePoint("E", 1, -0.5, "E"),
      freePoint("F", 0, 1, "F"),
      triangleNode("ABC", "A", "B", "C"),
      triangleNode("DEF", "D", "E", "F"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestTriangleSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toEqual({ id: "DEF" });
  });

  test("returns null outside triangles", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestTriangleSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(3, 3)),
      ),
    ).toBeNull();
  });
});

describe("interaction/hitTestTriangleInterior", () => {
  const viewport = testViewport();

  test("finds a triangle from an interior point when all vertices are free", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, 0));

    expect(hitTestTriangleInterior(graph, evaluated, viewport, screen)).toEqual(
      {
        id: "ABC",
        vertexIds: ["A", "B", "C"],
      },
    );
  });

  test("does not hit a triangle with a constrained vertex", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
      triangleNode("ABG", "A", "B", "G"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, -0.5));

    expect(hitTestTriangleInterior(graph, evaluated, viewport, screen)).toEqual(
      {
        id: "ABC",
        vertexIds: ["A", "B", "C"],
      },
    );
  });

  test("drags the later-rendered overlapping triangle", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      freePoint("D", -1, -0.5, "D"),
      freePoint("E", 1, -0.5, "E"),
      freePoint("F", 0, 1, "F"),
      triangleNode("ABC", "A", "B", "C"),
      triangleNode("DEF", "D", "E", "F"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(
      hitTestTriangleInterior(
        graph,
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toEqual({
      id: "DEF",
      vertexIds: ["D", "E", "F"],
    });
  });

  test("returns null when the containing triangle has a constrained vertex", () => {
    const graph = createGraph([
      freePoint("A", -2, -1, "A"),
      freePoint("B", 2, -1, "B"),
      freePoint("C", 0, 2, "C"),
      triangleNode("ABC", "A", "B", "C"),
      centroidNode("G", "ABC", "G"),
      triangleNode("ABG", "A", "B", "G"),
    ]);

    const evaluated = evaluateGraph(graph);
    const screen = worldToScreen(viewport, vec2(0, -0.75));

    const constrainedOnly = {
      values: new Map([...evaluated.values].filter(([id]) => id === "ABG")),
      ordered: [...evaluated.ordered].filter((value) => value.id === "ABG"),

      issues: [],
    };

    expect(
      hitTestTriangleInterior(graph, constrainedOnly, viewport, screen),
    ).toBeNull();
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

    expect(
      hitTestTriangleInterior(graph, evaluated, viewport, screen),
    ).toBeNull();
  });
  test("uses z-index to choose among overlapping area hits", () => {
    const evaluated = evaluatedScene([
      {
        kind: "TRIANGLE",
        sourceKind: "TRIANGLE",
        zIndex: 0,
        id: "low",
        a: vec2(-1, -1),
        b: vec2(1, -1),
        c: vec2(0, 1),
      },
      {
        kind: "TRIANGLE",
        sourceKind: "TRIANGLE",
        zIndex: 10,
        id: "high",
        a: vec2(-1, -1),
        b: vec2(1, -1),
        c: vec2(0, 1),
      },
    ]);

    expect(
      hitTestTriangleSelection(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toEqual({ id: "high" });
  });

  test("point hit priority still beats higher z-index area hits", () => {
    const evaluated = evaluatedScene([
      {
        kind: "TRIANGLE",
        sourceKind: "TRIANGLE",
        zIndex: 100,
        id: "area",
        a: vec2(-1, -1),
        b: vec2(1, -1),
        c: vec2(0, 1),
      },
      {
        kind: "POINT",
        sourceKind: "FREE_POINT",
        zIndex: 0,
        id: "point",
        point: vec2(0, 0),
        label: "P",
        role: "FREE",
      },
    ]);

    expect(
      hitTestSelectionTarget(
        evaluated,
        viewport,
        worldToScreen(viewport, vec2(0, 0)),
      ),
    ).toEqual({
      kind: "POINT",
      id: "point",
      distancePx: 0,
    });
  });
});
