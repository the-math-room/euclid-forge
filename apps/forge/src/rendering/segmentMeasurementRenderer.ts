import type { EvaluatedSegmentMeasurement } from "@euclid-forge/core/evaluation/evaluated";
import type { Viewport } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { renderMeasurementPill } from "./measurementPill";
import { RENDER_THEME, type RenderTheme } from "./theme";

const MEASUREMENT_OFFSET_PX = 16;

export type SegmentMeasurementRenderOptions = Readonly<{
  theme?: RenderTheme;
}>;

export function renderSegmentMeasurement(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  measurement: EvaluatedSegmentMeasurement,
  options: SegmentMeasurementRenderOptions = {},
): void {
  const theme = options.theme ?? RENDER_THEME;
  const a = worldToScreen(viewport, measurement.a);
  const b = worldToScreen(viewport, measurement.b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  if (length < 1e-9) {
    return;
  }

  const normal = {
    x: -dy / length,
    y: dx / length,
  };
  const midpoint = {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };

  ctx.save();
  renderMeasurementPill(
    ctx,
    theme.point.labelPill,
    theme.point.labelFill,
    theme.point.labelFont,
    midpoint.x + normal.x * MEASUREMENT_OFFSET_PX,
    midpoint.y + normal.y * MEASUREMENT_OFFSET_PX,
    measurement.label,
  );
  ctx.restore();
}
