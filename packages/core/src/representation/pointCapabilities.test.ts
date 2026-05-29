import { describe, expect, test } from "vitest";
import {
  centroidNode,
  circleNode,
  curveIntersectionNode,
  freePoint,
  lineNode,
  linearConstrainedPointNode,
  midpointNode,
  pointOnLinearNode,
  segmentIntersectionNode,
  segmentMeasurementNode,
  segmentNode,
  triangleNode,
} from "./node";
import {
  isConstrainedMovablePointNode,
  isDraggablePointNode,
} from "./pointCapabilities";

describe("representation/pointCapabilities", () => {
  test("treats free and movable constrained points as draggable", () => {
    expect(isDraggablePointNode(freePoint("A", 0, 0, "A"))).toBe(true);
    expect(
      isDraggablePointNode(
        linearConstrainedPointNode(
          "P_PARALLEL",
          "AB",
          "A",
          "PARALLEL",
          1,
          "P",
        ),
      ),
    ).toBe(true);
    expect(isDraggablePointNode(pointOnLinearNode("P_ON_AB", "AB", 0.5, "P"))).toBe(
      true,
    );
  });

  test("distinguishes constrained movable points from free points", () => {
    expect(isConstrainedMovablePointNode(freePoint("A", 0, 0, "A"))).toBe(false);
    expect(
      isConstrainedMovablePointNode(
        linearConstrainedPointNode(
          "P_PERPENDICULAR",
          "AB",
          "A",
          "PERPENDICULAR",
          1,
          "P",
        ),
      ),
    ).toBe(true);
    expect(
      isConstrainedMovablePointNode(pointOnLinearNode("P_ON_AB", "AB", 0.5, "P")),
    ).toBe(true);
  });

  test("keeps derived and non-point geometry non-draggable", () => {
    const nonDraggable = [
      midpointNode("M_AB", "AB", "M"),
      centroidNode("G", "ABC", "G"),
      segmentIntersectionNode("X", "AB", "CD", "X"),
      curveIntersectionNode("Y", "AB", "circle", "linear-circle:0", "Y"),
      segmentNode("AB", "A", "B"),
      lineNode("LINE_AB", "A", "B"),
      circleNode("circle", "A", "B"),
      triangleNode("ABC", "A", "B", "C"),
      segmentMeasurementNode("MEASURE_AB", "AB"),
    ];

    for (const node of nonDraggable) {
      expect(isDraggablePointNode(node)).toBe(false);
      expect(isConstrainedMovablePointNode(node)).toBe(false);
    }
  });

  test("handles missing nodes", () => {
    expect(isDraggablePointNode(undefined)).toBe(false);
    expect(isConstrainedMovablePointNode(undefined)).toBe(false);
  });
});
