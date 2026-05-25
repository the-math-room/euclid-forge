import { vec2 } from "../meaning/vec2";
import type { Viewport } from "../view/viewport";

export function testViewport(
  overrides: Partial<Viewport> = {},
): Viewport {
  return {
    width: 800,
    height: 600,
    center: vec2(0, 0),
    zoom: 80,
    rotation: 0,
    ...overrides,
  };
}
