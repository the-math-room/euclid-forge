import type { EvaluatedTriangle } from "@euclid-forge/core/evaluation/evaluated";
import { RENDER_THEME } from "./theme";
import type { Viewport } from "@euclid-forge/core/view/viewport";
import { worldToScreen } from "@euclid-forge/core/view/viewport";

export type TriangleRenderOptions = Readonly<{
  selectedNodeIds?: ReadonlySet<string>;
  hoveredNodeId?: string | null;
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
  const hovered = options.hoveredNodeId === triangle.id;

  ctx.save();

  if (hovered) {
    ctx.strokeStyle = RENDER_THEME.triangle.hoverStroke;
    ctx.lineWidth = RENDER_THEME.triangle.hoverLineWidthPx;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.stroke();
  }

  if (selected) {
    ctx.strokeStyle = RENDER_THEME.triangle.selectedStroke;
    ctx.lineWidth = RENDER_THEME.triangle.selectedLineWidthPx;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.strokeStyle = RENDER_THEME.triangle.stroke;
  ctx.lineWidth = RENDER_THEME.triangle.lineWidthPx;

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
