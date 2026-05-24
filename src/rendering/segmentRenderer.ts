import type { EvaluatedSegment } from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export type SegmentRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
}>;

export function renderSegment(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  segment: EvaluatedSegment,
  options: SegmentRenderOptions = {},
): void {
  const a = worldToScreen(viewport, segment.a);
  const b = worldToScreen(viewport, segment.b);

  const hovered = options.hoveredNodeId === segment.id;

  ctx.save();

  if (hovered) {
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

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
  options: SegmentRenderOptions = {},
): void {
  for (const segment of segments) {
    renderSegment(ctx, viewport, segment, options);
  }
}