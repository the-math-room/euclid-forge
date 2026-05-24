import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import {
  visibleEvaluatedScene,
} from "../evaluation/visibleScene";
import type {
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";
import { renderPoints } from "./pointRenderer";
import type { PointRenderOptions } from "./pointRenderer";
import { renderSegments } from "./segmentRenderer";
import type { SegmentRenderOptions } from "./segmentRenderer";
import { renderTriangles } from "./triangleRenderer";
import type { TriangleRenderOptions } from "./triangleRenderer";
import type { Viewport } from "./viewport";

export type RenderSceneOptions = PointRenderOptions &
  SegmentRenderOptions &
  TriangleRenderOptions &
  Readonly<{
    hiddenNodeIds?: ReadonlySet<string>;
  }>;

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
  options: RenderSceneOptions = {},
): void {
  const visibleScene = visibleEvaluatedScene(
    scene,
    options.hiddenNodeIds
      ? {
          hiddenNodeIds: options.hiddenNodeIds,
        }
      : {},
  );

  const visible = visibleScene.ordered;

  const triangles = visible.filter(
    (value): value is EvaluatedTriangle => value.kind === "TRIANGLE",
  );

  const segments = visible.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = visible.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  renderTriangles(ctx, viewport, triangles, options);
  renderSegments(ctx, viewport, segments, options);
  renderPoints(ctx, viewport, points, options);
}
