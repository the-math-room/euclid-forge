import type { EvaluatedPoint } from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

export function renderPoint(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  point: EvaluatedPoint,
): void {
  const screen = worldToScreen(viewport, point.point);

  ctx.save();

  ctx.fillStyle = point.role === "FREE" ? "#fbbf24" : "#34d399";

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, point.role === "FREE" ? 6 : 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f9fafb";
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillText(point.label, screen.x + 10, screen.y - 10);

  ctx.restore();
}

export function renderPoints(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  points: readonly EvaluatedPoint[],
): void {
  for (const point of points) {
    renderPoint(ctx, viewport, point);
  }
}