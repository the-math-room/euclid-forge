import { describe, expect, test } from "vitest";
import { vec2, lineIntersection } from "./vec2";

describe("meaning/lineIntersection", () => {
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
});
