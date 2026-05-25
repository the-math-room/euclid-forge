import { describe, expect, test } from "vitest";
import { circleCurve, intersectCurves, lineCurveThroughPoints } from "./curve";
import { vec2 } from "./vec2";

describe("meaning/lineCurveThroughPoints", () => {
  test("intersects a circle beyond the defining points", () => {
    const line = lineCurveThroughPoints(vec2(0, 0), vec2(1, 0));
    const circle = circleCurve(vec2(2, 0), 1);

    const result = intersectCurves(line, circle);

    if (result.issue) {
      throw new Error(result.issue);
    }

    expect(result.candidates.map((entry) => entry.point.x).sort()).toEqual([
      1, 3,
    ]);
    expect(result.candidates.every((entry) => entry.point.y === 0)).toBe(true);
  });

  test("intersects another unbounded line outside the defining segment", () => {
    const horizontal = lineCurveThroughPoints(vec2(0, 0), vec2(1, 0));
    const vertical = lineCurveThroughPoints(vec2(2, -1), vec2(2, 1));

    const result = intersectCurves(horizontal, vertical);

    if (result.issue) {
      throw new Error(result.issue);
    }

    expect(result.candidates.map((entry) => entry.point)).toEqual([vec2(2, 0)]);
  });
});
