import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";
import type { EvaluatedScene } from "@euclid-forge/core";
import {
  renderEvaluatedGeometry as renderGeometryValue,
  renderLayerForGeometry as renderLayerForGeometryValue,
} from "./geometryRenderers";
import type {
  GeometryRenderLayer,
  GeometryRenderOptions,
} from "./geometryRenderingContext";
import { renderLassoOverlay } from "./lassoRenderer";
import type { Viewport } from "@euclid-forge/core";

export type RenderSceneOptions = GeometryRenderOptions;

const RENDER_LAYER_ORDER: Readonly<Record<GeometryRenderLayer, number>> =
  Object.freeze({
    AREA: 0,
    LINEAR: 1,
    POINT: 2,
  });

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
  options: RenderSceneOptions = {},
): void {
  const hidden = options.hiddenNodeIds ?? new Set<string>();
  const visible = scene.ordered.filter((value) => !hidden.has(value.id));

  for (const value of renderOrderedValues(visible)) {
    renderGeometryValue(value, {
      ctx,
      viewport,
      options,
    });
  }

  if (options.lassoPolygon) {
    renderLassoOverlay(ctx, options.lassoPolygon);
  }
}

function renderOrderedValues(
  values: readonly EvaluatedGeometry[],
): readonly EvaluatedGeometry[] {
  return [...values].sort(
    (a, b) =>
      RENDER_LAYER_ORDER[renderLayerForGeometryValue(a)] -
        RENDER_LAYER_ORDER[renderLayerForGeometryValue(b)] ||
      zIndexOf(a) - zIndexOf(b),
  );
}

function zIndexOf(value: EvaluatedGeometry): number {
  return value.zIndex ?? 0;
}
