import type { ScreenPoint } from "@euclid-forge/core";

export function renderLassoOverlay(
  ctx: CanvasRenderingContext2D,
  polygon: readonly ScreenPoint[],
): void {
  if (polygon.length < 2) {
    return;
  }

  ctx.save();

  ctx.fillStyle = "rgb(96 165 250 / 0.12)";
  ctx.strokeStyle = "rgb(147 197 253 / 0.92)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);

  ctx.beginPath();
  ctx.moveTo(polygon[0]?.x ?? 0, polygon[0]?.y ?? 0);

  for (const point of polygon.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }

  if (polygon.length >= 3) {
    ctx.closePath();
    ctx.fill();
  }

  ctx.stroke();
  ctx.restore();
}
