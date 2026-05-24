import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { worldToScreen } from "./viewport";
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
});