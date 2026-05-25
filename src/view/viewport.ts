import type { Vec2 } from "../meaning/vec2";

export type Viewport = Readonly<{
  width: number;
  height: number;
  center: Vec2;
  zoom: number;
  rotation: number;
}>;

export type ScreenPoint = Readonly<{
  x: number;
  y: number;
}>;

export function worldToScreen(viewport: Viewport, point: Vec2): ScreenPoint {
  const dx = point.x - viewport.center.x;
  const dy = point.y - viewport.center.y;
  const cos = Math.cos(viewport.rotation);
  const sin = Math.sin(viewport.rotation);

  return Object.freeze({
    x: viewport.width / 2 + (dx * cos - dy * sin) * viewport.zoom,
    y: viewport.height / 2 + (-dx * sin - dy * cos) * viewport.zoom,
  });
}

export function screenToWorld(viewport: Viewport, point: ScreenPoint): Vec2 {
  const screenX = (point.x - viewport.width / 2) / viewport.zoom;
  const screenY = (point.y - viewport.height / 2) / viewport.zoom;
  const cos = Math.cos(viewport.rotation);
  const sin = Math.sin(viewport.rotation);

  return Object.freeze({
    x: viewport.center.x + screenX * cos - screenY * sin,
    y: viewport.center.y - screenX * sin - screenY * cos,
  });
}
