import type { EvaluatedSegment } from "../evaluation/evaluated";
import { RENDER_THEME } from "./theme";
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
    ctx.strokeStyle = RENDER_THEME.segment.hoverStroke;
    ctx.lineWidth = RENDER_THEME.segment.hoverLineWidthPx;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.strokeStyle = RENDER_THEME.segment.stroke;
  ctx.lineWidth = RENDER_THEME.segment.lineWidthPx;

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