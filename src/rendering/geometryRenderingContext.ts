import type { Viewport } from "../meaning/viewport";

export type GeometryRenderLayer = "AREA" | "LINEAR" | "POINT";

export type GeometryRenderOptions = Readonly<{
  hoveredNodeId?: string | null;
  selectedNodeIds?: ReadonlySet<string>;
  hiddenNodeIds?: ReadonlySet<string>;
}>;

export type GeometryRenderContext = Readonly<{
  ctx: CanvasRenderingContext2D;
  viewport: Viewport;
  options: GeometryRenderOptions;
}>;
