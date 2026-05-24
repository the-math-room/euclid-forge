import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import type {
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";
import { renderPoints } from "./pointRenderer";
import type { PointRenderOptions } from "./pointRenderer";
import { renderSegments } from "./segmentRenderer";
import { renderTriangles } from "./triangleRenderer";
import type { Viewport } from "./viewport";

export type RenderSceneOptions = PointRenderOptions;

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
  options: RenderSceneOptions = {},
): void {
  const triangles = scene.ordered.filter(
    (value): value is EvaluatedTriangle => value.kind === "TRIANGLE",
  );

  const segments = scene.ordered.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = scene.ordered.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  renderTriangles(ctx, viewport, triangles);
  renderSegments(ctx, viewport, segments);
  renderPoints(ctx, viewport, points, options);
}
