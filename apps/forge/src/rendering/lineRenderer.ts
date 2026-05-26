import type { EvaluatedLine } from "@euclid-forge/core/evaluation/evaluated";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";

import { RENDER_THEME } from "./theme";
import { renderParallelMarks } from "./parallelMarkRenderer";
import { drawOccludedSegment } from "./linearOcclusion";
import type { LinearOcclusionOptions } from "./linearOcclusion";
import type { RenderTheme } from "./theme";

export type LineRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  theme?: RenderTheme;
  parallelMarkCounts?: ReadonlyMap<string, 1 | 2 | 3>;
}> &
  LinearOcclusionOptions;

export function renderLine(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  line: EvaluatedLine,
  options: LineRenderOptions = {},
): void {
  const theme = options.theme ?? RENDER_THEME;
  const endpoints = viewportLineEndpoints(viewport, line);

  if (!endpoints) {
    return;
  }

  const hovered = options.hoveredNodeId === line.id;
  const selected = options.selectedNodeIds?.has(line.id) ?? false;

  ctx.save();

  if (selected) {
    ctx.strokeStyle = theme.line.selectedStrokeStyle;
    ctx.lineWidth = theme.line.selectedLineWidth;

    ctx.beginPath();
    ctx.moveTo(endpoints.start.x, endpoints.start.y);
    ctx.lineTo(endpoints.end.x, endpoints.end.y);
    ctx.stroke();
  }

  if (hovered) {
    ctx.strokeStyle = theme.line.hoverStrokeStyle;
    ctx.lineWidth = theme.line.hoverLineWidth;

    ctx.beginPath();
    ctx.moveTo(endpoints.start.x, endpoints.start.y);
    ctx.lineTo(endpoints.end.x, endpoints.end.y);
    ctx.stroke();
  }

  ctx.strokeStyle = theme.line.strokeStyle;
  ctx.lineWidth = theme.line.lineWidth;

  drawOccludedSegment(
    ctx,
    {
      id: line.id,
      ...(line.zIndex === undefined ? {} : { zIndex: line.zIndex }),
      a: endpoints.start,
      b: endpoints.end,
    },
    options,
  );

  const parallelMarkCount = options.parallelMarkCounts?.get(line.id);

  if (parallelMarkCount) {
    renderParallelMarks(
      ctx,
      {
        a: markStartPoint(endpoints.start, endpoints.end, viewport),
        b: markEndPoint(endpoints.start, endpoints.end, viewport),
      },
      parallelMarkCount,
      theme,
    );
  }

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

function markStartPoint(
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
  viewport: Viewport,
): Readonly<{ x: number; y: number }> {
  const center = {
    x: viewport.width / 2,
    y: viewport.height / 2,
  };
  const direction = unitDirection(start, end);

  return {
    x: center.x - direction.x * 48,
    y: center.y - direction.y * 48,
  };
}

function markEndPoint(
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
  viewport: Viewport,
): Readonly<{ x: number; y: number }> {
  const center = {
    x: viewport.width / 2,
    y: viewport.height / 2,
  };
  const direction = unitDirection(start, end);

  return {
    x: center.x + direction.x * 48,
    y: center.y + direction.y * 48,
  };
}

function unitDirection(
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
): Readonly<{ x: number; y: number }> {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length < 1e-9) {
    return {
      x: 1,
      y: 0,
    };
  }

  return {
    x: dx / length,
    y: dy / length,
  };
}
