import type {
  EvaluatedPoint,
  EvaluatedPointRole,
} from "../evaluation/evaluated";
import type { Viewport } from "./viewport";
import { worldToScreen } from "./viewport";

type PointStyle = Readonly<{
  fill: string;
  radiusPx: number;
}>;

const POINT_STYLES: Record<EvaluatedPointRole, PointStyle> = {
  FREE: {
    fill: "#fbbf24",
    radiusPx: 6,
  },
  MIDPOINT: {
    fill: "#34d399",
    radiusPx: 5,
  },
  CENTROID: {
    fill: "#60a5fa",
    radiusPx: 5,
  },
};

export function renderPoint(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  point: EvaluatedPoint,
): void {
  const screen = worldToScreen(viewport, point.point);
  const style = POINT_STYLES[point.role];

  ctx.save();

  ctx.fillStyle = style.fill;

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, style.radiusPx, 0, Math.PI * 2);
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
