import { describe, expect, test } from "vitest";
import {
  intersectCurves,
  linearCurveFromSegment,
} from "./curve";
import { vec2 } from "./vec2";

describe("meaning/curve", () => {
  test("creates a linear implicit curve from a segment", () => {
    expect(linearCurveFromSegment(vec2(0, 0), vec2(2, 0))).toEqual({
      kind: "LINEAR_IMPLICIT",
      a: 0,
      b: -2,
      c: 0,
      domain: {
        kind: "SEGMENT_PARAMETER",
        start: vec2(0, 0),
        end: vec2(2, 0),
      },
    });
  });

  test("intersects two bounded linear curves", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(-1, 0), vec2(1, 0)),
        linearCurveFromSegment(vec2(0, -1), vec2(0, 1)),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(0, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-linear",
        },
      ],
    });
  });

  test("returns an issue when bounded linear curves do not intersect within domains", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(0, 0), vec2(1, 0)),
        linearCurveFromSegment(vec2(2, -1), vec2(2, 1)),
      ),
    ).toEqual({
      candidates: [],
      issue: "Intersection lies outside a bounded curve domain",
    });
  });

  test("returns an issue for parallel bounded linear curves", () => {
    expect(
      intersectCurves(
        linearCurveFromSegment(vec2(0, 0), vec2(1, 0)),
        linearCurveFromSegment(vec2(0, 1), vec2(1, 1)),
      ),
    ).toEqual({
      candidates: [],
      issue: "Curves are parallel or coincident; no unique intersection point",
    });
  });
});
