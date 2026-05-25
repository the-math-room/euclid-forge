import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";
import { renderCircle } from "./circleRenderer";
import { renderPoint } from "./pointRenderer";
import { renderSegment } from "./segmentRenderer";
import { renderTriangle } from "./triangleRenderer";
import type { GeometryRenderContext } from "./geometryRenderingContext";

export type RenderLayer = "AREA" | "LINEAR" | "POINT";

export function renderLayerForGeometry(value: EvaluatedGeometry): RenderLayer {
  switch (value.kind) {
    case "TRIANGLE":
      return "AREA";

    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
      return "LINEAR";

    case "POINT":
      return "POINT";
  }
}

export function renderEvaluatedGeometry(
  value: EvaluatedGeometry,
  context: GeometryRenderContext,
): void {
  switch (value.kind) {
    case "POINT":
      renderPoint(context.ctx, context.viewport, value, context.options);
      return;

    case "SEGMENT":
      renderSegment(context.ctx, context.viewport, value, context.options);
      return;

    case "LINE":
      renderSegment(
        context.ctx,
        context.viewport,
        {
          ...value,
          kind: "SEGMENT",
          sourceKind: "SEGMENT",
        },
        context.options,
      );
      return;

    case "CIRCLE":
      renderCircle(context.ctx, context.viewport, value, context.options);
      return;

    case "TRIANGLE":
      renderTriangle(context.ctx, context.viewport, value, context.options);
      return;
  }
}
