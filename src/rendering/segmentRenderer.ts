import type { EvaluatedSegment } from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export function renderSegment(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  segment: EvaluatedSegment,
): void {
  const a = worldToScreen(viewport, segment.a);
  const b = worldToScreen(viewport, segment.b);

  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  ctx.restore();
}

export function renderSegments(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  segments: readonly EvaluatedSegment[],
): void {
  for (const segment of segments) {
    renderSegment(ctx, viewport, segment);
  }
}