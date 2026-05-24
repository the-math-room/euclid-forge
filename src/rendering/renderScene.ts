import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import type {
  EvaluatedPoint,
  EvaluatedSegment,
} from "../evaluation/evaluated";
import { renderPoints } from "./pointRenderer";
import { renderSegments } from "./segmentRenderer";
import type { Viewport } from "./viewport";

export function renderScene(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: EvaluatedScene,
): void {
  const segments = scene.ordered.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = scene.ordered.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  renderSegments(ctx, viewport, segments);
  renderPoints(ctx, viewport, points);
}
