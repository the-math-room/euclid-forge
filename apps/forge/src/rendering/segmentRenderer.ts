import type { EvaluatedSegment } from "@euclid-forge/core/evaluation/evaluated";
import { RENDER_THEME } from "./theme";
import type { RenderTheme } from "./theme";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

export type SegmentRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  theme?: RenderTheme;
}>;

export function renderSegment(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  segment: EvaluatedSegment,
  options: SegmentRenderOptions = {},
): void {
  const theme = options.theme ?? RENDER_THEME;
  const a = worldToScreen(viewport, segment.a);
  const b = worldToScreen(viewport, segment.b);

  const hovered = options.hoveredNodeId === segment.id;
  const selected = options.selectedNodeIds?.has(segment.id) ?? false;

  ctx.save();

  if (selected) {
    ctx.strokeStyle = theme.segment.selectedStroke;
    ctx.lineWidth = theme.segment.selectedLineWidthPx;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  if (hovered) {
    ctx.strokeStyle = theme.segment.hoverStroke;
    ctx.lineWidth = theme.segment.hoverLineWidthPx;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  ctx.strokeStyle = theme.segment.stroke;
  ctx.lineWidth = theme.segment.lineWidthPx;

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
