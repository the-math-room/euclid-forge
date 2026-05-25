import { vec2 } from "@euclid-forge/core/meaning/vec2";
import type { Viewport } from "@euclid-forge/core/view/viewport";

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
