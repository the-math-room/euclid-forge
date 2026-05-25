import type { RenderTheme } from "./theme";

export type ParallelMarkSegment = Readonly<{
  a: Readonly<{ x: number; y: number }>;
  b: Readonly<{ x: number; y: number }>;
}>;

export function renderParallelMarks(
  ctx: CanvasRenderingContext2D,
  segment: ParallelMarkSegment,
  count: 1 | 2 | 3,
  theme: RenderTheme,
): void {
  const dx = segment.b.x - segment.a.x;
  const dy = segment.b.y - segment.a.y;
  const length = Math.hypot(dx, dy);

  if (length < 1e-9) {
    return;
  }

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const center = {
    x: (segment.a.x + segment.b.x) / 2,
    y: (segment.a.y + segment.b.y) / 2,
  };
  const spacing = 9;
  const size = 9;

  ctx.save();
  ctx.strokeStyle = theme.line.strokeStyle;
  ctx.lineWidth = Math.max(1.4, theme.line.lineWidth * 0.9);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let index = 0; index < count; index += 1) {
    const offset = (index - (count - 1) / 2) * spacing;
    const apex = {
      x: center.x + nx * offset + ux * size * 0.55,
      y: center.y + ny * offset + uy * size * 0.55,
    };
    const tailCenter = {
      x: center.x + nx * offset - ux * size * 0.45,
      y: center.y + ny * offset - uy * size * 0.45,
    };
    const wing = size * 0.45;

    ctx.beginPath();
    ctx.moveTo(tailCenter.x + nx * wing, tailCenter.y + ny * wing);
    ctx.lineTo(apex.x, apex.y);
    ctx.lineTo(tailCenter.x - nx * wing, tailCenter.y - ny * wing);
    ctx.stroke();
  }

  ctx.restore();
}
