import type { EvaluatedTriangle } from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export function renderTriangle(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  triangle: EvaluatedTriangle,
): void {
  const a = worldToScreen(viewport, triangle.a);
  const b = worldToScreen(viewport, triangle.b);
  const c = worldToScreen(viewport, triangle.c);

  ctx.save();

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

export function renderTriangles(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  triangles: readonly EvaluatedTriangle[],
): void {
  for (const triangle of triangles) {
    renderTriangle(ctx, viewport, triangle);
  }
}
