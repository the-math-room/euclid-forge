import type { EvaluatedCircle } from "@euclid-forge/core/evaluation/evaluated";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

import { RENDER_THEME } from "./theme";
import type { RenderTheme } from "./theme";

export type CircleRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  theme?: RenderTheme;
}>;

export function renderCircle(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  circle: EvaluatedCircle,
  options: CircleRenderOptions = {},
): void {
  const theme = options.theme ?? RENDER_THEME;
  const center = worldToScreen(viewport, circle.center);
  const edge = worldToScreen(viewport, {
    x: circle.center.x + circle.radius,
    y: circle.center.y,
  });
  const radiusPx = Math.hypot(edge.x - center.x, edge.y - center.y);
  const hovered = options.hoveredNodeId === circle.id;
  const selected = options.selectedNodeIds?.has(circle.id) ?? false;

  ctx.save();

  if (selected) {
    ctx.strokeStyle = theme.circle.selectedStrokeStyle;
    ctx.lineWidth = theme.circle.selectedLineWidth;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (hovered) {
    ctx.strokeStyle = theme.circle.hoverStrokeStyle;
    ctx.lineWidth = theme.circle.hoverLineWidth;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = theme.circle.strokeStyle;
  ctx.lineWidth = theme.circle.lineWidth;

  ctx.beginPath();
  ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

export function renderCircles(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  circles: readonly EvaluatedCircle[],
  options: CircleRenderOptions = {},
): void {
  for (const circle of circles) {
    renderCircle(ctx, viewport, circle, options);
  }
}
