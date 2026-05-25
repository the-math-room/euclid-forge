import { describe, expect, test } from "vitest";
import { vec2 } from "@euclid-forge/core";
import { screenToWorld, worldToScreen } from "@euclid-forge/core";
import { testViewport } from "./testHelpers";
import type { Viewport } from "@euclid-forge/core";

describe("rendering/viewport", () => {
  test("maps world origin to the center of the screen", () => {
    const viewport = testViewport({
      zoom: 100,
    });

    expect(worldToScreen(viewport, vec2(0, 0))).toEqual({
      x: 400,
      y: 300,
    });
  });

  test("maps positive world x to the right", () => {
    const viewport = testViewport({
      zoom: 100,
    });

    expect(worldToScreen(viewport, vec2(2, 0))).toEqual({
      x: 600,
      y: 300,
    });
  });

  test("maps positive world y upward on screen", () => {
    const viewport = testViewport({
      zoom: 100,
    });

    expect(worldToScreen(viewport, vec2(0, 2))).toEqual({
      x: 400,
      y: 100,
    });
  });

  test("respects viewport center", () => {
    const viewport = testViewport({
      center: vec2(10, 20),
      zoom: 50,
    });

    expect(worldToScreen(viewport, vec2(10, 20))).toEqual({
      x: 400,
      y: 300,
    });
  });

  test("maps screen center back to world center", () => {
    const viewport = testViewport({
      center: vec2(10, 20),
      zoom: 50,
    });

    expect(screenToWorld(viewport, { x: 400, y: 300 })).toEqual(vec2(10, 20));
  });

  test("screenToWorld reverses worldToScreen", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(3, -4),
      zoom: 80,
      rotation: 0,
    };

    const world = vec2(5.5, 2.25);
    const screen = worldToScreen(viewport, world);

    expect(screenToWorld(viewport, screen)).toEqual(world);
  });
  test("rotates world coordinates around the viewport center", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
      rotation: Math.PI / 2,
    };

    expect(worldToScreen(viewport, vec2(1, 0))).toEqual({
      x: 400,
      y: 200,
    });
  });

  test("screenToWorld reverses worldToScreen with rotation", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(3, -4),
      zoom: 80,
      rotation: Math.PI / 3,
    };

    const world = vec2(5.5, 2.25);
    const screen = worldToScreen(viewport, world);
    const roundTrip = screenToWorld(viewport, screen);

    expect(roundTrip.x).toBeCloseTo(world.x);
    expect(roundTrip.y).toBeCloseTo(world.y);
  });

  test("preserves screen distance under rotation", () => {
    const unrotated: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
      rotation: 0,
    };

    const rotated: Viewport = {
      ...unrotated,
      rotation: Math.PI / 5,
    };

    const a = vec2(-2, -1);
    const b = vec2(3, 2);

    const unrotatedA = worldToScreen(unrotated, a);
    const unrotatedB = worldToScreen(unrotated, b);
    const rotatedA = worldToScreen(rotated, a);
    const rotatedB = worldToScreen(rotated, b);

    expect(distance(unrotatedA, unrotatedB)).toBeCloseTo(
      distance(rotatedA, rotatedB),
    );
  });

  test("preserves screen angles under rotation", () => {
    const unrotated: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
      rotation: 0,
    };

    const rotated: Viewport = {
      ...unrotated,
      rotation: Math.PI / 5,
    };

    const origin = vec2(0, 0);
    const xAxis = vec2(2, 0);
    const diagonal = vec2(2, 2);

    const unrotatedAngle = angleBetweenScreen(
      worldToScreen(unrotated, origin),
      worldToScreen(unrotated, xAxis),
      worldToScreen(unrotated, diagonal),
    );

    const rotatedAngle = angleBetweenScreen(
      worldToScreen(rotated, origin),
      worldToScreen(rotated, xAxis),
      worldToScreen(rotated, diagonal),
    );

    expect(rotatedAngle).toBeCloseTo(unrotatedAngle);
  });

});

function distance(
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angleBetweenScreen(
  vertex: Readonly<{ x: number; y: number }>,
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): number {
  const ax = a.x - vertex.x;
  const ay = a.y - vertex.y;
  const bx = b.x - vertex.x;
  const by = b.y - vertex.y;

  const dot = ax * bx + ay * by;
  const lengthA = Math.hypot(ax, ay);
  const lengthB = Math.hypot(bx, by);

  return Math.acos(dot / (lengthA * lengthB));
}
