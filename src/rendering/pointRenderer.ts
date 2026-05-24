import type { EvaluatedPoint } from "../evaluation/evaluated";
import { RENDER_THEME } from "./theme";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export type PointRenderOptions = Readonly<{
  selectedNodeIds?: ReadonlySet<string>;
  hoveredNodeId?: string | null;
}>;

export function renderPoint(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  point: EvaluatedPoint,
  options: PointRenderOptions = {},
): void {
  const screen = worldToScreen(viewport, point.point);
  const style = RENDER_THEME.point.styles[point.role];
  const selected = options.selectedNodeIds?.has(point.id) ?? false;
  const hovered = options.hoveredNodeId === point.id;

  ctx.save();

  if (hovered) {
    ctx.strokeStyle = RENDER_THEME.point.hoverStroke;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(
      screen.x,
      screen.y,
      style.radiusPx + RENDER_THEME.point.hoverRingOffsetPx,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  if (selected) {
    ctx.strokeStyle = RENDER_THEME.point.selectedStroke;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(
      screen.x,
      screen.y,
      style.radiusPx + RENDER_THEME.point.selectedRingOffsetPx,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  ctx.fillStyle = style.fill;

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, style.radiusPx, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = RENDER_THEME.point.labelFill;
  ctx.font = RENDER_THEME.point.labelFont;
  ctx.fillText(
    point.label,
    screen.x + RENDER_THEME.point.labelOffsetX,
    screen.y + RENDER_THEME.point.labelOffsetY,
  );

  ctx.restore();
}

export function renderPoints(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  points: readonly EvaluatedPoint[],
  options: PointRenderOptions = {},
): void {
  for (const point of points) {
    renderPoint(ctx, viewport, point, options);
  }
}
