import { describe, expect, test } from "vitest";
import {
  centroidNode,
  circleNode,
  freePoint,
  lineNode,
  segmentNode,
  triangleNode,
} from "./node";
import { isConstructibleCurveNode } from "./curveNode";

describe("representation/curveNode", () => {
  test("classifies segments, lines, and circles as constructible curve nodes", () => {
    expect(isConstructibleCurveNode(segmentNode("AB", "A", "B"))).toBe(true);
    expect(isConstructibleCurveNode(lineNode("L", "A", "B"))).toBe(true);
    expect(isConstructibleCurveNode(circleNode("C1", "A", "B"))).toBe(true);
  });

  test("does not classify points, derived points, or areas as constructible curves", () => {
    expect(isConstructibleCurveNode(freePoint("A", 0, 0, "A"))).toBe(false);
    expect(isConstructibleCurveNode(triangleNode("ABC", "A", "B", "C"))).toBe(
      false,
    );
    expect(isConstructibleCurveNode(centroidNode("G", "ABC", "G"))).toBe(false);
  });
});
