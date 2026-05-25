import { describe, expect, test } from "vitest";
import { isConstructiblePointNode } from "./pointNode";
import { curveIntersectionNode } from "./node";

describe("representation/curve intersection node", () => {
  test("creates a curve intersection node", () => {
    expect(
      curveIntersectionNode("X", "curveA", "curveB", "linear-circle:0", "X"),
    ).toEqual({
      kind: "CURVE_INTERSECTION",
      id: "X",
      curveA: "curveA",
      curveB: "curveB",
      branchKey: "linear-circle:0",
      label: "X",
    });
  });

  test("curve intersections are constructible point inputs", () => {
    expect(
      isConstructiblePointNode(
        curveIntersectionNode("X", "curveA", "curveB", "linear-circle:0", "X"),
      ),
    ).toBe(true);
  });
});
