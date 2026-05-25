import type { EvaluatedPoint } from "@euclid-forge/core/evaluation/evaluated";
import { RENDER_THEME } from "./theme";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

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

  renderPointLabel(ctx, screen.x, screen.y, point.label);

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

function renderPointLabel(
  ctx: CanvasRenderingContext2D,
  pointX: number,
  pointY: number,
  label: string,
): void {
  const theme = RENDER_THEME.point;
  const pill = theme.labelPill;
  const textX = pointX + theme.labelOffsetX;
  const textY = pointY + theme.labelOffsetY;

  ctx.font = theme.labelFont;
  ctx.textBaseline = "alphabetic";

  const metrics = ctx.measureText(label);
  const actualLeft = metrics.actualBoundingBoxLeft || 0;
  const actualRight = metrics.actualBoundingBoxRight || metrics.width;
  const actualAscent = metrics.actualBoundingBoxAscent || pill.fallbackAscentPx;
  const actualDescent =
    metrics.actualBoundingBoxDescent || pill.fallbackDescentPx;

  const x = textX - actualLeft - pill.paddingXPx;
  const y = textY - actualAscent - pill.paddingYPx;
  const width = actualLeft + actualRight + pill.paddingXPx * 2;
  const height = actualAscent + actualDescent + pill.paddingYPx * 2;

  ctx.fillStyle = pill.fill;
  roundedRect(ctx, x, y, width, height, pill.radiusPx);
  ctx.fill();

  ctx.strokeStyle = pill.stroke;
  ctx.lineWidth = pill.strokeWidthPx;
  roundedRect(ctx, x, y, width, height, pill.radiusPx);
  ctx.stroke();

  ctx.fillStyle = theme.labelFill;
  ctx.fillText(label, textX, textY);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
