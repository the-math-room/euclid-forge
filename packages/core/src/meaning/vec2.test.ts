import { describe, expect, test } from "vitest";
import { centroid, deltaBetween, midpoint, vec2 } from "./vec2";

describe("meaning/vec2", () => {
  test("constructs an immutable 2D vector", () => {
    const v = vec2(1, 2);

    expect(v).toEqual({ x: 1, y: 2 });
    expect(Object.isFrozen(v)).toBe(true);
  });

  test("computes the midpoint of two vectors", () => {
    expect(midpoint(vec2(-2, 4), vec2(6, 0))).toEqual(vec2(2, 2));
  });

  test("computes the centroid of three vectors", () => {
    expect(centroid(vec2(-2, -1), vec2(2, -1), vec2(0, 2))).toEqual(vec2(0, 0));
  });

  test("computes the delta from one vector to another", () => {
    expect(deltaBetween(vec2(-1, 2), vec2(3, -4))).toEqual(vec2(4, -6));
  });
});
