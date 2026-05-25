import type { EvaluatedLine } from "@euclid-forge/core/evaluation/evaluated";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

import { RENDER_THEME } from "./theme";

export type LineRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
}>;

export function renderLine(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  line: EvaluatedLine,
  options: LineRenderOptions = {},
): void {
  const endpoints = viewportLineEndpoints(viewport, line);

  if (!endpoints) {
    return;
  }

  const hovered = options.hoveredNodeId === line.id;
  const selected = options.selectedNodeIds?.has(line.id) ?? false;

  ctx.save();

  if (selected || hovered) {
    ctx.strokeStyle = selected ? "#fbbf24" : "#94a3b8";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(endpoints.start.x, endpoints.start.y);
    ctx.lineTo(endpoints.end.x, endpoints.end.y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(endpoints.start.x, endpoints.start.y);
  ctx.lineTo(endpoints.end.x, endpoints.end.y);
  ctx.stroke();

  ctx.restore();
}

function viewportLineEndpoints(
  viewport: Viewport,
  line: EvaluatedLine,
): Readonly<{
  start: Readonly<{ x: number; y: number }>;
  end: Readonly<{ x: number; y: number }>;
}> | null {
  const a = worldToScreen(viewport, line.a);
  const b = worldToScreen(viewport, line.b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return null;
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const extension = Math.hypot(viewport.width, viewport.height) * 2;

  return Object.freeze({
    start: Object.freeze({
      x: a.x - unitX * extension,
      y: a.y - unitY * extension,
    }),
    end: Object.freeze({
      x: a.x + unitX * extension,
      y: a.y + unitY * extension,
    }),
  });
}
