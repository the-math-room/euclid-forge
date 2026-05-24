import type { EvaluatedPointRole } from "../evaluation/evaluated";

export type PointStyle = Readonly<{
  fill: string;
  radiusPx: number;
}>;

export const RENDER_THEME = Object.freeze({
  point: Object.freeze({
    styles: Object.freeze({
      FREE: Object.freeze({
        fill: "#fbbf24",
        radiusPx: 6,
      }),
      MIDPOINT: Object.freeze({
        fill: "#34d399",
        radiusPx: 5,
      }),
      CENTROID: Object.freeze({
        fill: "#60a5fa",
        radiusPx: 5,
      }),
    } satisfies Record<EvaluatedPointRole, PointStyle>),

    hoverStroke: "#94a3b8",
    hoverRingOffsetPx: 4,

    selectedStroke: "#f9fafb",
    selectedRingOffsetPx: 6,

    labelFill: "#f9fafb",
    labelFont: "14px system-ui, sans-serif",
    labelOffsetX: 10,
    labelOffsetY: -10,
  }),

  segment: Object.freeze({
    stroke: "#e5e7eb",
    lineWidthPx: 2,

    hoverStroke: "#94a3b8",
    hoverLineWidthPx: 5,
  }),

  triangle: Object.freeze({
    stroke: "#e5e7eb",
    lineWidthPx: 2,

    hoverStroke: "#94a3b8",
    hoverLineWidthPx: 4,

    selectedStroke: "#f8fafc",
    selectedLineWidthPx: 5,
  }),
});
