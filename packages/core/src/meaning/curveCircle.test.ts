import { describe, expect, test } from "vitest";
import { circleCurve, intersectCurves, linearCurveFromSegment } from "./curve";
import { vec2 } from "./vec2";

describe("meaning/curve circle intersections", () => {
  test("creates a circle curve denotation", () => {
    expect(circleCurve(vec2(1, 2), 3)).toEqual({
      kind: "CIRCLE",
      center: vec2(1, 2),
      radius: 3,
      domain: { kind: "ALL" },
    });
  });

  test("classifies two bounded line-circle intersections by segment parameter", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(-2, 0), vec2(2, 0)),
        circleCurve(vec2(0, 0), 1),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(-1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:0",
        },
        {
          point: vec2(1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:1",
        },
      ],
    });
  });

  test("classifies a tangent line-circle intersection", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(-2, 1), vec2(2, 1)),
        circleCurve(vec2(0, 0), 1),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(0, 1),
          multiplicity: "TANGENT",
          branchKey: "linear-circle:tangent",
        },
      ],
    });
  });

  test("returns an issue when a line misses a circle", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(-2, 2), vec2(2, 2)),
        circleCurve(vec2(0, 0), 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "Curves do not intersect",
    });
  });

  test("filters line-circle intersections outside bounded segment domains", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(2, 0), vec2(3, 0)),
        circleCurve(vec2(0, 0), 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "Curves intersect outside bounded curve domains",
    });
  });

  test("supports reversed curve argument order", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 1),
        linearCurveFromSegment(vec2(-2, 0), vec2(2, 0)),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(-1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:0",
        },
        {
          point: vec2(1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:1",
        },
      ],
    });
  });
});
