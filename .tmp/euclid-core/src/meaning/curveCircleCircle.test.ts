import { describe, expect, test } from "vitest";
import {
  circleCurve,
  intersectCurves,
} from "./curve";
import { vec2 } from "./vec2";

describe("meaning/curve circle-circle intersections", () => {
  test("classifies two circle-circle intersections", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 5),
        circleCurve(vec2(8, 0), 5),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(4, -3),
          multiplicity: "SIMPLE",
          branchKey: "circle-circle:0",
        },
        {
          point: vec2(4, 3),
          multiplicity: "SIMPLE",
          branchKey: "circle-circle:1",
        },
      ],
    });
  });

  test("classifies externally tangent circles", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 1),
        circleCurve(vec2(2, 0), 1),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(1, 0),
          multiplicity: "TANGENT",
          branchKey: "circle-circle:tangent",
        },
      ],
    });
  });

  test("classifies internally tangent circles", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 3),
        circleCurve(vec2(2, 0), 1),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(3, 0),
          multiplicity: "TANGENT",
          branchKey: "circle-circle:tangent",
        },
      ],
    });
  });

  test("returns an issue for separated circles", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 1),
        circleCurve(vec2(3, 0), 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "Circles do not intersect",
    });
  });

  test("returns an issue when one circle contains the other", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 5),
        circleCurve(vec2(1, 0), 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "One circle is contained within the other",
    });
  });

  test("returns an issue for coincident circles", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 2),
        circleCurve(vec2(0, 0), 2),
      ),
    ).toEqual({
      candidates: [],
      issue: "Circles are coincident; no unique intersection points",
    });
  });

  test("returns an issue for concentric non-intersecting circles", () => {
    expect(
      intersectCurves(
        circleCurve(vec2(0, 0), 2),
        circleCurve(vec2(0, 0), 1),
      ),
    ).toEqual({
      candidates: [],
      issue: "Concentric circles do not intersect",
    });
  });
});
