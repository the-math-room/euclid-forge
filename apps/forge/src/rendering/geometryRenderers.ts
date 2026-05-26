import type { EvaluatedSceneItem } from "@euclid-forge/core/evaluation/evaluated";
import { renderCircle } from "./circleRenderer";
import { renderLine } from "./lineRenderer";
import { renderPoint } from "./pointRenderer";
import { renderPolygon } from "./polygonRenderer";
import { renderSegment } from "./segmentRenderer";
import { renderSegmentMeasurement } from "./segmentMeasurementRenderer";
import { renderTriangle } from "./triangleRenderer";
import type { GeometryRenderContext } from "./geometryRenderingContext";

export type RenderLayer = "AREA" | "LINEAR" | "ANNOTATION" | "POINT";

export function renderLayerForSceneItem(value: EvaluatedSceneItem): RenderLayer {
  switch (value.kind) {
    case "TRIANGLE":
    case "POLYGON":
      return "AREA";

    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
      return "LINEAR";

    case "SEGMENT_MEASUREMENT":
      return "ANNOTATION";

    case "POINT":
      return "POINT";
  }
}

export function renderEvaluatedSceneItem(
  value: EvaluatedSceneItem,
  context: GeometryRenderContext,
): void {
  switch (value.kind) {
    case "POINT":
      renderPoint(context.ctx, context.viewport, value, context.options);
      return;

    case "SEGMENT":
      renderSegment(context.ctx, context.viewport, value, context.options);
      return;

    case "SEGMENT_MEASUREMENT":
      renderSegmentMeasurement(
        context.ctx,
        context.viewport,
        value,
        context.options,
      );
      return;

    case "LINE":
      renderLine(context.ctx, context.viewport, value, context.options);
      return;

    case "CIRCLE":
      renderCircle(context.ctx, context.viewport, value, context.options);
      return;

    case "TRIANGLE":
      renderTriangle(context.ctx, context.viewport, value, context.options);
      return;

    case "POLYGON":
      renderPolygon(context.ctx, context.viewport, value, context.options);
      return;
  }
}
