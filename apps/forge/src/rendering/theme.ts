import type { EvaluatedPointRole } from "@euclid-forge/core/evaluation/evaluated";

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
      INTERSECTION: Object.freeze({
        fill: "#f472b6",
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
    labelPill: Object.freeze({
      fill: "rgb(15 23 42 / 0.72)",
      stroke: "rgb(248 250 252 / 0.22)",
      strokeWidthPx: 1,
      paddingXPx: 4,
      paddingYPx: 2,
      radiusPx: 5,
      fallbackAscentPx: 11,
      fallbackDescentPx: 3,
    }),
  }),

  segment: Object.freeze({
    stroke: "#e5e7eb",
    lineWidthPx: 2,

    hoverStroke: "#94a3b8",
    hoverLineWidthPx: 5,

    selectedStroke: "#f8fafc",
    selectedLineWidthPx: 6,
  }),

  circle: {
    strokeStyle: "#38bdf8",
    lineWidth: 2,
    selectedStrokeStyle: "#facc15",
    selectedLineWidth: 3,
    hoverStrokeStyle: "#fde68a",
    hoverLineWidth: 3,
  },

  line: {
    strokeStyle: "#94a3b8",
    lineWidth: 1.5,
    selectedStrokeStyle: "#facc15",
    selectedLineWidth: 3,
    hoverStrokeStyle: "#fde68a",
    hoverLineWidth: 3,
  },

  triangle: Object.freeze({
    stroke: "#e5e7eb",
    lineWidthPx: 2,

    hoverStroke: "#94a3b8",
    hoverLineWidthPx: 4,

    selectedStroke: "#f8fafc",
    selectedLineWidthPx: 5,
  }),
});
