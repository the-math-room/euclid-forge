import type { EvaluatedCircle } from "@euclid-forge/core/evaluation/evaluated";
import type { Viewport } from "@euclid-forge/core/view/viewport";
import { worldToScreen } from "@euclid-forge/core/view/viewport";

export type CircleRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
}>;

export function renderCircle(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  circle: EvaluatedCircle,
  options: CircleRenderOptions = {},
): void {
  const center = worldToScreen(viewport, circle.center);
  const edge = worldToScreen(viewport, {
    x: circle.center.x + circle.radius,
    y: circle.center.y,
  });
  const radiusPx = Math.hypot(edge.x - center.x, edge.y - center.y);
  const hovered = options.hoveredNodeId === circle.id;
  const selected = options.selectedNodeIds?.has(circle.id) ?? false;

  ctx.save();

  if (selected || hovered) {
    ctx.strokeStyle = selected ? "#fbbf24" : "#94a3b8";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;

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
