import type { EvaluatedPointRole } from "@euclid-forge/core/evaluation/evaluated";

export type PointStyle = Readonly<{
  fill: string;
  radiusPx: number;
}>;

export type PointLabelPillTheme = Readonly<{
  fill: string;
  stroke: string;
  strokeWidthPx: number;
  paddingXPx: number;
  paddingYPx: number;
  radiusPx: number;
  fallbackAscentPx: number;
  fallbackDescentPx: number;
}>;

export type PointTheme = Readonly<{
  styles: Readonly<Record<EvaluatedPointRole, PointStyle>>;

  hoverStroke: string;
  hoverRingOffsetPx: number;

  selectedStroke: string;
  selectedRingOffsetPx: number;

  labelFill: string;
  labelFont: string;
  labelOffsetX: number;
  labelOffsetY: number;
  labelPill: PointLabelPillTheme;
}>;

export type LinearTheme = Readonly<{
  stroke: string;
  lineWidthPx: number;

  hoverStroke: string;
  hoverLineWidthPx: number;

  selectedStroke: string;
  selectedLineWidthPx: number;
}>;

export type CircleTheme = Readonly<{
  strokeStyle: string;
  lineWidth: number;
  selectedStrokeStyle: string;
  selectedLineWidth: number;
  hoverStrokeStyle: string;
  hoverLineWidth: number;
}>;

export type LineTheme = Readonly<{
  strokeStyle: string;
  lineWidth: number;
  selectedStrokeStyle: string;
  selectedLineWidth: number;
  hoverStrokeStyle: string;
  hoverLineWidth: number;
}>;

export type RenderTheme = Readonly<{
  background: string;
  point: PointTheme;
  segment: LinearTheme;
  circle: CircleTheme;
  line: LineTheme;
  triangle: LinearTheme;
}>;

export const SCREEN_RENDER_THEME: RenderTheme = Object.freeze({
  background: "#0f172a",

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
    }),

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

  circle: Object.freeze({
    strokeStyle: "#e5e7eb",
    lineWidth: 2,
    selectedStrokeStyle: "#fbbf24",
    selectedLineWidth: 5,
    hoverStrokeStyle: "#94a3b8",
    hoverLineWidth: 5,
  }),

  line: Object.freeze({
    strokeStyle: "#e5e7eb",
    lineWidth: 2,
    selectedStrokeStyle: "#fbbf24",
    selectedLineWidth: 5,
    hoverStrokeStyle: "#94a3b8",
    hoverLineWidth: 5,
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

export const HIGH_CONTRAST_RENDER_THEME: RenderTheme = Object.freeze({
  background: "#ffffff",

  point: Object.freeze({
    styles: Object.freeze({
      FREE: Object.freeze({
        fill: "#b45309",
        radiusPx: 6,
      }),
      MIDPOINT: Object.freeze({
        fill: "#047857",
        radiusPx: 5,
      }),
      CENTROID: Object.freeze({
        fill: "#1d4ed8",
        radiusPx: 5,
      }),
      INTERSECTION: Object.freeze({
        fill: "#be185d",
        radiusPx: 5,
      }),
    }),

    hoverStroke: "#64748b",
    hoverRingOffsetPx: 4,

    selectedStroke: "#2563eb",
    selectedRingOffsetPx: 6,

    labelFill: "#111827",
    labelFont: "14px system-ui, sans-serif",
    labelOffsetX: 10,
    labelOffsetY: -10,
    labelPill: Object.freeze({
      fill: "rgb(255 255 255 / 0.86)",
      stroke: "rgb(17 24 39 / 0.24)",
      strokeWidthPx: 1,
      paddingXPx: 4,
      paddingYPx: 2,
      radiusPx: 5,
      fallbackAscentPx: 11,
      fallbackDescentPx: 3,
    }),
  }),

  segment: Object.freeze({
    stroke: "#111827",
    lineWidthPx: 2,

    hoverStroke: "#64748b",
    hoverLineWidthPx: 5,

    selectedStroke: "#2563eb",
    selectedLineWidthPx: 6,
  }),

  circle: Object.freeze({
    strokeStyle: "#111827",
    lineWidth: 2,
    selectedStrokeStyle: "#2563eb",
    selectedLineWidth: 5,
    hoverStrokeStyle: "#64748b",
    hoverLineWidth: 5,
  }),

  line: Object.freeze({
    strokeStyle: "#111827",
    lineWidth: 2,
    selectedStrokeStyle: "#2563eb",
    selectedLineWidth: 5,
    hoverStrokeStyle: "#64748b",
    hoverLineWidth: 5,
  }),

  triangle: Object.freeze({
    stroke: "#111827",
    lineWidthPx: 2,

    hoverStroke: "#64748b",
    hoverLineWidthPx: 4,

    selectedStroke: "#2563eb",
    selectedLineWidthPx: 5,
  }),
});

export const PRINT_RENDER_THEME: RenderTheme = Object.freeze({
  background: "#ffffff",

  point: Object.freeze({
    styles: Object.freeze({
      FREE: Object.freeze({
        fill: "#111827",
        radiusPx: 6,
      }),
      MIDPOINT: Object.freeze({
        fill: "#374151",
        radiusPx: 5,
      }),
      CENTROID: Object.freeze({
        fill: "#4b5563",
        radiusPx: 5,
      }),
      INTERSECTION: Object.freeze({
        fill: "#111827",
        radiusPx: 5,
      }),
    }),

    hoverStroke: "#111827",
    hoverRingOffsetPx: 4,

    selectedStroke: "#111827",
    selectedRingOffsetPx: 6,

    labelFill: "#111827",
    labelFont: "14px system-ui, sans-serif",
    labelOffsetX: 10,
    labelOffsetY: -10,
    labelPill: Object.freeze({
      fill: "rgb(255 255 255 / 0.86)",
      stroke: "rgb(17 24 39 / 0.24)",
      strokeWidthPx: 1,
      paddingXPx: 4,
      paddingYPx: 2,
      radiusPx: 5,
      fallbackAscentPx: 11,
      fallbackDescentPx: 3,
    }),
  }),

  segment: Object.freeze({
    stroke: "#111827",
    lineWidthPx: 2,

    hoverStroke: "#111827",
    hoverLineWidthPx: 4,

    selectedStroke: "#111827",
    selectedLineWidthPx: 4,
  }),

  circle: Object.freeze({
    strokeStyle: "#111827",
    lineWidth: 2,
    selectedStrokeStyle: "#111827",
    selectedLineWidth: 4,
    hoverStrokeStyle: "#111827",
    hoverLineWidth: 4,
  }),

  line: Object.freeze({
    strokeStyle: "#111827",
    lineWidth: 2,
    selectedStrokeStyle: "#111827",
    selectedLineWidth: 4,
    hoverStrokeStyle: "#111827",
    hoverLineWidth: 4,
  }),

  triangle: Object.freeze({
    stroke: "#111827",
    lineWidthPx: 2,

    hoverStroke: "#111827",
    hoverLineWidthPx: 4,

    selectedStroke: "#111827",
    selectedLineWidthPx: 4,
  }),
});

export type RenderThemeScale = "normal" | "large" | "extra-large";

export function scaledRenderTheme(
  theme: RenderTheme,
  scale: RenderThemeScale,
): RenderTheme {
  const factor = scaleFactor(scale);

  if (factor === 1) {
    return theme;
  }

  return Object.freeze({
    ...theme,
    point: Object.freeze({
      ...theme.point,
      styles: Object.freeze({
        FREE: scalePointStyle(theme.point.styles.FREE, factor),
        MIDPOINT: scalePointStyle(theme.point.styles.MIDPOINT, factor),
        CENTROID: scalePointStyle(theme.point.styles.CENTROID, factor),
        INTERSECTION: scalePointStyle(theme.point.styles.INTERSECTION, factor),
      }),
      hoverRingOffsetPx: theme.point.hoverRingOffsetPx * factor,
      selectedRingOffsetPx: theme.point.selectedRingOffsetPx * factor,
      labelFont: scaledFont(theme.point.labelFont, factor),
      labelOffsetX: theme.point.labelOffsetX * factor,
      labelOffsetY: theme.point.labelOffsetY * factor,
      labelPill: Object.freeze({
        ...theme.point.labelPill,
        strokeWidthPx: theme.point.labelPill.strokeWidthPx * factor,
        paddingXPx: theme.point.labelPill.paddingXPx * factor,
        paddingYPx: theme.point.labelPill.paddingYPx * factor,
        radiusPx: theme.point.labelPill.radiusPx * factor,
        fallbackAscentPx: theme.point.labelPill.fallbackAscentPx * factor,
        fallbackDescentPx: theme.point.labelPill.fallbackDescentPx * factor,
      }),
    }),
    segment: scaleLinearTheme(theme.segment, factor),
    circle: Object.freeze({
      ...theme.circle,
      lineWidth: theme.circle.lineWidth * factor,
      selectedLineWidth: theme.circle.selectedLineWidth * factor,
      hoverLineWidth: theme.circle.hoverLineWidth * factor,
    }),
    line: Object.freeze({
      ...theme.line,
      lineWidth: theme.line.lineWidth * factor,
      selectedLineWidth: theme.line.selectedLineWidth * factor,
      hoverLineWidth: theme.line.hoverLineWidth * factor,
    }),
    triangle: scaleLinearTheme(theme.triangle, factor),
  });
}

function scalePointStyle(style: PointStyle, factor: number): PointStyle {
  return Object.freeze({
    ...style,
    radiusPx: style.radiusPx * factor,
  });
}

function scaleLinearTheme(theme: LinearTheme, factor: number): LinearTheme {
  return Object.freeze({
    ...theme,
    lineWidthPx: theme.lineWidthPx * factor,
    hoverLineWidthPx: theme.hoverLineWidthPx * factor,
    selectedLineWidthPx: theme.selectedLineWidthPx * factor,
  });
}

function scaledFont(font: string, factor: number): string {
  return font.replace(/(\d+(?:\.\d+)?)px/, (_match, size: string) => {
    return `${Number(size) * factor}px`;
  });
}

function scaleFactor(scale: RenderThemeScale): number {
  switch (scale) {
    case "normal":
      return 1;

    case "large":
      return 1.35;

    case "extra-large":
      return 1.75;
  }
}

export const RENDER_THEME = SCREEN_RENDER_THEME;
