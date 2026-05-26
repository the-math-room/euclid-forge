export type LabelPillLayoutTheme = Readonly<{
  paddingXPx: number;
  paddingYPx: number;
  fallbackAscentPx: number;
  fallbackDescentPx: number;
}>;

export type LabelPillBounds = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type TextMeasureContext = Pick<
  CanvasRenderingContext2D,
  "font" | "measureText" | "textBaseline"
>;

export function labelPillBounds(
  ctx: TextMeasureContext,
  pill: LabelPillLayoutTheme,
  labelFont: string,
  textX: number,
  textY: number,
  label: string,
): LabelPillBounds {
  ctx.font = labelFont;
  ctx.textBaseline = "alphabetic";

  const metrics = ctx.measureText(label);
  const actualLeft = metrics.actualBoundingBoxLeft || 0;
  const actualRight = metrics.actualBoundingBoxRight || metrics.width;
  const actualAscent = metrics.actualBoundingBoxAscent || pill.fallbackAscentPx;
  const actualDescent =
    metrics.actualBoundingBoxDescent || pill.fallbackDescentPx;

  return Object.freeze({
    x: textX - actualLeft - pill.paddingXPx,
    y: textY - actualAscent - pill.paddingYPx,
    width: actualLeft + actualRight + pill.paddingXPx * 2,
    height: actualAscent + actualDescent + pill.paddingYPx * 2,
  });
}
