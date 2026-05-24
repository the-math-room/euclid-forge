import type {
  EvaluatedCircle,
  EvaluatedGeometry,
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";
import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import { renderGeometryValue } from "../geometry/geometryRegistry";
import type { GeometryRenderOptions } from "../geometry/renderingContext";
import type { Viewport } from "./viewport";

export type RenderSceneOptions = GeometryRenderOptions;

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
  options: RenderSceneOptions = {},
): void {
  const hidden = options.hiddenNodeIds ?? new Set<string>();
  const visible = scene.ordered.filter((value) => !hidden.has(value.id));

  const triangles = visible.filter(
    (value): value is EvaluatedTriangle => value.kind === "TRIANGLE",
  );

  const circles = visible.filter(
    (value): value is EvaluatedCircle => value.kind === "CIRCLE",
  );

  const segments = visible.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = visible.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  for (const value of triangles) {
    renderSceneValue(ctx, viewport, value, options);
  }

  for (const value of circles) {
    renderSceneValue(ctx, viewport, value, options);
  }

  for (const value of segments) {
    renderSceneValue(ctx, viewport, value, options);
  }

  for (const value of points) {
    renderSceneValue(ctx, viewport, value, options);
  }
}

function renderSceneValue(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  value: EvaluatedGeometry,
  options: RenderSceneOptions,
): void {
  renderGeometryValue(value, {
    ctx,
    viewport,
    options,
  });
}
