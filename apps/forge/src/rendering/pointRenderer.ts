import type { EvaluatedPoint } from "@euclid-forge/core/evaluation/evaluated";
import { RENDER_THEME } from "./theme";
import type { PointTheme, RenderTheme } from "./theme";
import { renderMeasurementPill } from "./measurementPill";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

export type PointRenderOptions = Readonly<{
  selectedNodeIds?: ReadonlySet<string>;
  hoveredNodeId?: string | null;
  theme?: RenderTheme;
}>;

export function renderPoint(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  point: EvaluatedPoint,
  options: PointRenderOptions = {},
): void {
  const theme = options.theme ?? RENDER_THEME;
  const screen = worldToScreen(viewport, point.point);
  const style = theme.point.styles[point.role];
  const selected = options.selectedNodeIds?.has(point.id) ?? false;
  const hovered = options.hoveredNodeId === point.id;

  ctx.save();

  if (hovered) {
    ctx.strokeStyle = theme.point.hoverStroke;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(
      screen.x,
      screen.y,
      style.radiusPx + theme.point.hoverRingOffsetPx,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  if (selected) {
    ctx.strokeStyle = theme.point.selectedStroke;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(
      screen.x,
      screen.y,
      style.radiusPx + theme.point.selectedRingOffsetPx,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  ctx.fillStyle = style.fill;

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, style.radiusPx, 0, Math.PI * 2);
  ctx.fill();

  renderPointLabel(ctx, theme.point, screen.x, screen.y, point.label);

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
  theme: PointTheme,
  pointX: number,
  pointY: number,
  label: string,
): void {
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

  renderMeasurementPill(
    ctx,
    pill,
    theme.labelFill,
    theme.labelFont,
    textX,
    textY,
    label,
  );
}
