import { describe, expect, test } from "vitest";
import {
  lineIntersection,
  lineIntersectionWithParameters,
  segmentIntersection,
  vec2,
} from "./vec2";

describe("meaning/intersection helpers", () => {
  test("computes the intersection of supporting lines", () => {
    expect(
      lineIntersection(
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1),
        vec2(0, 1),
      ),
    ).toEqual(vec2(0, 0));
  });

  test("computes segment intersection parameters", () => {
    expect(
      lineIntersectionWithParameters(
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1),
        vec2(0, 1),
      ),
    ).toEqual({
      point: vec2(0, 0),
      t: 0.5,
      u: 0.5,
    });
  });

  test("returns null for parallel lines", () => {
    expect(
      lineIntersection(
        vec2(0, 0),
        vec2(1, 0),
        vec2(0, 1),
        vec2(1, 1),
      ),
    ).toBeNull();
  });

  test("returns a segment intersection when the finite segments cross", () => {
    expect(
      segmentIntersection(
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1),
        vec2(0, 1),
      ),
    ).toEqual(vec2(0, 0));
  });

  test("returns null when supporting lines cross outside the finite segments", () => {
    expect(
      segmentIntersection(
        vec2(0, 0),
        vec2(1, 0),
        vec2(2, -1),
        vec2(2, 1),
      ),
    ).toBeNull();
  });
});
