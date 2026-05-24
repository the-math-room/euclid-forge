import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { screenToWorld, worldToScreen } from "./viewport";
import type { Viewport } from "./viewport";

describe("rendering/viewport", () => {
  test("maps world origin to the center of the screen", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
    };

    expect(worldToScreen(viewport, vec2(0, 0))).toEqual({
      x: 400,
      y: 300,
    });
  });

  test("maps positive world x to the right", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
    };

    expect(worldToScreen(viewport, vec2(2, 0))).toEqual({
      x: 600,
      y: 300,
    });
  });

  test("maps positive world y upward on screen", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(0, 0),
      zoom: 100,
    };

    expect(worldToScreen(viewport, vec2(0, 2))).toEqual({
      x: 400,
      y: 100,
    });
  });

  test("respects viewport center", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(10, 20),
      zoom: 50,
    };

    expect(worldToScreen(viewport, vec2(10, 20))).toEqual({
      x: 400,
      y: 300,
    });
  });

  test("maps screen center back to world center", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(10, 20),
      zoom: 50,
    };

    expect(screenToWorld(viewport, { x: 400, y: 300 })).toEqual(vec2(10, 20));
  });

  test("screenToWorld reverses worldToScreen", () => {
    const viewport: Viewport = {
      width: 800,
      height: 600,
      center: vec2(3, -4),
      zoom: 80,
    };

    const world = vec2(5.5, 2.25);
    const screen = worldToScreen(viewport, world);

    expect(screenToWorld(viewport, screen)).toEqual(world);
  });
});
