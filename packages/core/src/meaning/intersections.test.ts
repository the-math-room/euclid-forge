import { describe, expect, test } from "vitest";
import { segmentIntersection, segmentSegmentIntersections, vec2 } from "./vec2";

describe("meaning/classified intersections", () => {
  test("classifies a bounded segment-segment crossing as one simple candidate", () => {
    expect(
      segmentSegmentIntersections(
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1),
        vec2(0, 1),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(0, 0),
          multiplicity: "SIMPLE",
          branchKey: "segment-segment",
        },
      ],
    });
  });

  test("preserves the existing segmentIntersection point helper", () => {
    expect(
      segmentIntersection(vec2(-1, 0), vec2(1, 0), vec2(0, -1), vec2(0, 1)),
    ).toEqual(vec2(0, 0));
  });

  test("classifies parallel or coincident segments as no unique point", () => {
    expect(
      segmentSegmentIntersections(
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1),
      ),
    ).toEqual({
      candidates: [],
      issue:
        "Segments are parallel or coincident; no unique intersection point",
    });
  });

  test("classifies supporting-line crossings outside the first segment", () => {
    expect(
      segmentSegmentIntersections(
        vec2(3, 0),
        vec2(4, 0),
        vec2(2, -1),
        vec2(2, 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "Supporting lines intersect outside the first segment",
    });
  });

  test("classifies supporting-line crossings outside the second segment", () => {
    expect(
      segmentSegmentIntersections(
        vec2(0, 0),
        vec2(4, 0),
        vec2(2, 1),
        vec2(2, 2),
      ),
    ).toEqual({
      candidates: [],
      issue: "Supporting lines intersect outside the second segment",
    });
  });
});
