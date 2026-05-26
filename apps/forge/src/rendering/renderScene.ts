import type { EvaluatedSceneItem } from "@euclid-forge/core/evaluation/evaluated";
import type { EvaluatedScene } from "@euclid-forge/core";
import {
  renderEvaluatedSceneItem,
  renderLayerForSceneItem,
} from "./geometryRenderers";
import type { GeometryRenderOptions } from "./geometryRenderingContext";
import type { RenderLayer } from "./geometryRenderers";
import { renderLassoOverlay } from "./lassoRenderer";
import { polygonOccludersForScene } from "./linearOcclusion";
import { renderZLevelOverlay } from "./zLevelOverlay";
import type { Viewport } from "@euclid-forge/core";

export type RenderSceneOptions = GeometryRenderOptions;

const RENDER_LAYER_ORDER: Readonly<Record<RenderLayer, number>> =
  Object.freeze({
    AREA: 0,
    LINEAR: 1,
    ANNOTATION: 2,
    POINT: 3,
  });

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
  options: RenderSceneOptions = {},
): void {
  const hidden = options.hiddenNodeIds ?? new Set<string>();
  const visible = scene.ordered.filter((value) => !hidden.has(value.id));
  const renderOptions = {
    ...options,
    polygonOccluders: options.showOccludedLines
      ? polygonOccludersForScene(visible, viewport)
      : [],
  };

  for (const value of renderOrderedValues(visible)) {
    renderEvaluatedSceneItem(value, {
      ctx,
      viewport,
      options: renderOptions,
    });
  }

  if (options.showZLevels) {
    renderZLevelOverlay(ctx, viewport, visible, options.theme);
  }

  if (options.lassoPolygon) {
    renderLassoOverlay(ctx, options.lassoPolygon);
  }
}

function renderOrderedValues(
  values: readonly EvaluatedSceneItem[],
): readonly EvaluatedSceneItem[] {
  return [...values].sort(
    (a, b) =>
      zIndexOf(a) - zIndexOf(b) ||
      RENDER_LAYER_ORDER[renderLayerForSceneItem(a)] -
        RENDER_LAYER_ORDER[renderLayerForSceneItem(b)],
  );
}

function zIndexOf(value: EvaluatedSceneItem): number {
  return value.zIndex ?? 0;
}
