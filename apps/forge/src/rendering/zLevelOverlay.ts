import type { EvaluatedSceneItem } from "@euclid-forge/core/evaluation/evaluated";
import { worldToScreen } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";
import { RENDER_THEME, type RenderTheme } from "./theme";

export function renderZLevelOverlay(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  values: readonly EvaluatedSceneItem[],
  theme: RenderTheme = RENDER_THEME,
): void {
  ctx.save();
  ctx.font = theme.point.labelFont;
  ctx.textBaseline = "alphabetic";

  for (const value of values) {
    const anchor = zLevelAnchor(viewport, value);
    const label = `z:${value.zIndex ?? 0}`;
    const x = anchor.x + 8;
    const y = anchor.y + 18;
    const metrics = ctx.measureText(label);
    const ascent = metrics.actualBoundingBoxAscent || 11;
    const descent = metrics.actualBoundingBoxDescent || 3;
    const width = metrics.width || label.length * 8;
    const paddingX = 4;
    const paddingY = 2;

    ctx.fillStyle = "rgb(251 191 36 / 0.9)";
    ctx.fillRect(
      x - paddingX,
      y - ascent - paddingY,
      width + paddingX * 2,
      ascent + descent + paddingY * 2,
    );

    ctx.fillStyle = "#111827";
    ctx.fillText(label, x, y);
  }

  ctx.restore();
}

function zLevelAnchor(
  viewport: Viewport,
  value: EvaluatedSceneItem,
): ScreenPoint {
  switch (value.kind) {
    case "POINT":
      return worldToScreen(viewport, value.point);

    case "SEGMENT":
    case "LINE":
      return worldToScreen(viewport, value.a);

    case "CIRCLE":
      return worldToScreen(viewport, value.center);

    case "TRIANGLE":
      return worldToScreen(viewport, value.a);


    case "SEGMENT_MEASUREMENT":
      return worldToScreen(viewport, {
        x: (value.a.x + value.b.x) / 2,
        y: (value.a.y + value.b.y) / 2,
      });
  }
}
