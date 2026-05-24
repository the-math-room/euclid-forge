import { describe, expect, test } from "vitest";
import { midpoint, vec2 } from "./vec2";

describe("meaning/vec2", () => {
  test("constructs an immutable 2D vector", () => {
    const v = vec2(1, 2);

    expect(v).toEqual({ x: 1, y: 2 });
    expect(Object.isFrozen(v)).toBe(true);
  });

  test("computes the midpoint of two vectors", () => {
    expect(midpoint(vec2(-2, 4), vec2(6, 0))).toEqual(vec2(2, 2));
  });
});