import type { ScreenPoint, Viewport } from "@euclid-forge/core";
import type { RenderTheme } from "./theme";
import type { ParallelMarkCounts } from "./parallelMarks";

export type GeometryRenderLayer = "AREA" | "LINEAR" | "POINT";

export type GeometryRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  hiddenNodeIds?: ReadonlySet<string>;
  lassoPolygon?: readonly ScreenPoint[];
  parallelMarkCounts?: ParallelMarkCounts;
  theme?: RenderTheme;
}>;

export type GeometryRenderContext = Readonly<{
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  options: GeometryRenderOptions;
}>;
