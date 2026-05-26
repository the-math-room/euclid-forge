import type { PointLabelPillTheme } from "./theme";
import { labelPillBounds } from "../ui/labelPillLayout";

export type MeasurementPillTheme = Readonly<{
  fill: string;
  stroke: string;
  strokeWidthPx: number;
  paddingXPx: number;
  paddingYPx: number;
  radiusPx: number;
  fallbackAscentPx: number;
  fallbackDescentPx: number;
}>;

export function renderMeasurementPill(
  ctx: CanvasRenderingContext2D,
  pill: PointLabelPillTheme,
  labelFill: string,
  labelFont: string,
  textX: number,
  textY: number,
  label: string,
): void {
  ctx.font = labelFont;
  ctx.textBaseline = "alphabetic";

  const { x, y, width, height } = labelPillBounds(
    ctx,
    pill,
    labelFont,
    textX,
    textY,
    label,
  );

  ctx.fillStyle = pill.fill;
  roundedRect(ctx, x, y, width, height, pill.radiusPx);
  ctx.fill();

  ctx.strokeStyle = pill.stroke;
  ctx.lineWidth = pill.strokeWidthPx;
  roundedRect(ctx, x, y, width, height, pill.radiusPx);
  ctx.stroke();

  ctx.fillStyle = labelFill;
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
