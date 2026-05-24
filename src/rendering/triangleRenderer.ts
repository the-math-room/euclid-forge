import type { EvaluatedTriangle } from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export type TriangleRenderOptions = Readonly<{
  selectedNodeIds?: ReadonlySet<string>;
}>;

export function renderTriangle(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  triangle: EvaluatedTriangle,
  options: TriangleRenderOptions = {},
): void {
  const a = worldToScreen(viewport, triangle.a);
  const b = worldToScreen(viewport, triangle.b);
  const c = worldToScreen(viewport, triangle.c);
  const selected = options.selectedNodeIds?.has(triangle.id) ?? false;

  ctx.save();

  if (selected) {
    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.stroke();
  }

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
  options: TriangleRenderOptions = {},
): void {
  for (const triangle of triangles) {
    renderTriangle(ctx, viewport, triangle, options);
  }
}
