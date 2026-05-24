import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import {
  visibleEvaluatedScene,
} from "../evaluation/visibleScene";
import type {
  EvaluatedCircle,
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
import { renderCircles } from "./circleRenderer";
import type { CircleRenderOptions } from "./circleRenderer";
import type { Viewport } from "./viewport";

export type RenderSceneOptions = PointRenderOptions &
  SegmentRenderOptions &
  CircleRenderOptions &
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

  const circles = visible.filter(
    (value): value is EvaluatedCircle => value.kind === "CIRCLE",
  );

  const segments = visible.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = visible.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  renderTriangles(ctx, viewport, triangles, options);
  renderCircles(ctx, viewport, circles, options);
  renderSegments(ctx, viewport, segments, options);
  renderPoints(ctx, viewport, points, options);
}
