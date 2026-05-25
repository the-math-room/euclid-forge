import type { ScreenPoint, Viewport } from "@euclid-forge/core";

export type GeometryRenderLayer = "AREA" | "LINEAR" | "POINT";

export type GeometryRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  hiddenNodeIds?: ReadonlySet<string>;
  lassoPolygon?: readonly ScreenPoint[];
}>;

export type GeometryRenderContext = Readonly<{
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  options: GeometryRenderOptions;
}>;
