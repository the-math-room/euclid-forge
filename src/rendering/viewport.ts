import type { Vec2 } from "../meaning/vec2";

export type Viewport = Readonly<{
  width: number;
  height: number;
  center: Vec2;
  zoom: number;
}>;

export type ScreenPoint = Readonly<{
  x: number;
  y: number;
}>;

export function worldToScreen(viewport: Viewport, point: Vec2): ScreenPoint {
  return Object.freeze({
    x: viewport.width / 2 + (point.x - viewport.center.x) * viewport.zoom,
    y: viewport.height / 2 - (point.y - viewport.center.y) * viewport.zoom,
  });
}

export function screenToWorld(viewport: Viewport, point: ScreenPoint): Vec2 {
  return Object.freeze({
    x: viewport.center.x + (point.x - viewport.width / 2) / viewport.zoom,
    y: viewport.center.y - (point.y - viewport.height / 2) / viewport.zoom,
  });
}
