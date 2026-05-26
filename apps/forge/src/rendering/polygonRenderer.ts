import type { EvaluatedPolygon } from "@euclid-forge/core/evaluation/evaluated";
import { worldToScreen } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";
import { drawOccludedSegment } from "./linearOcclusion";
import type { LinearOcclusionOptions } from "./linearOcclusion";
import { RENDER_THEME, type RenderTheme } from "./theme";

export type PolygonRenderOptions = Readonly<{
  selectedNodeIds?: ReadonlySet<string>;
  hoveredNodeId?: string | null;
  theme?: RenderTheme;
}> &
  LinearOcclusionOptions;

export function renderPolygon(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  polygon: EvaluatedPolygon,
  options: PolygonRenderOptions = {},
): void {
  const points = polygon.points.map((point) => worldToScreen(viewport, point));

  if (points.length < 3) {
    return;
  }

  const theme = options.theme ?? RENDER_THEME;
  const selected = options.selectedNodeIds?.has(polygon.id) ?? false;
  const hovered = options.hoveredNodeId === polygon.id;

  ctx.save();

  if (hovered) {
    strokePolygon(ctx, points, theme.triangle.hoverStroke, theme.triangle.hoverLineWidthPx);
  }

  if (selected) {
    strokePolygon(ctx, points, theme.triangle.selectedStroke, theme.triangle.selectedLineWidthPx);
  }

  strokeOccludedPolygon(
    ctx,
    polygon.id,
    polygon.zIndex,
    points,
    theme.triangle.stroke,
    theme.triangle.lineWidthPx,
    options,
  );

  ctx.restore();
}

function strokePolygon(
  ctx: CanvasRenderingContext2D,
  points: readonly ScreenPoint[],
  strokeStyle: string,
  lineWidth: number,
): void {
  const first = points[0];

  if (!first) {
    return;
  }

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(first.x, first.y);

  for (const point of points.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.closePath();
  ctx.stroke();
}


function strokeOccludedPolygon(
  ctx: CanvasRenderingContext2D,
  id: string,
  zIndex: number | undefined,
  points: readonly ScreenPoint[],
  strokeStyle: string,
  lineWidth: number,
  options: LinearOcclusionOptions,
): void {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;

  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];

    if (!a || !b) {
      continue;
    }

    drawOccludedSegment(
      ctx,
      {
        id,
        ...(zIndex === undefined ? {} : { zIndex }),
        a,
        b,
      },
      options,
    );
  }
}
