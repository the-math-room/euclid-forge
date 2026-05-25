import type {
  EvaluatedCircle,
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "@euclid-forge/core/evaluation/evaluated";
import { screenToWorld, worldToScreen } from "@euclid-forge/core/view/viewport";
import type { GeometryHitContext } from "./geometryInteractionContext";
import type {
  CircleHit,
  PointHit,
  SegmentHit,
  TriangleHitTarget,
} from "./geometryInteractionContext";

export function hitPointValue(
  value: EvaluatedPoint,
  context: GeometryHitContext,
  radiusPx = 12,
): PointHit | null {
  const screen = worldToScreen(context.viewport, value.point);
  const distancePx = Math.hypot(
    screen.x - context.screenPoint.x,
    screen.y - context.screenPoint.y,
  );

  if (distancePx > radiusPx) {
    return null;
  }

  return {
    kind: "POINT",
    id: value.id,
    distancePx,
  };
}

export function hitSegmentValue(
  value: EvaluatedSegment,
  context: GeometryHitContext,
  radiusPx = 8,
): SegmentHit | null {
  const distancePx = distanceToSegmentScreen(
    context.viewport,
    context.screenPoint,
    value,
  );

  if (distancePx > radiusPx) {
    return null;
  }

  return {
    kind: "SEGMENT",
    id: value.id,
    distancePx,
  };
}

export function hitCircleValue(
  value: EvaluatedCircle,
  context: GeometryHitContext,
): CircleHit | null {
  const center = worldToScreen(context.viewport, value.center);
  const edge = worldToScreen(context.viewport, {
    x: value.center.x + value.radius,
    y: value.center.y,
  });
  const radiusPx = Math.hypot(edge.x - center.x, edge.y - center.y);
  const distancePx = Math.hypot(
    context.screenPoint.x - center.x,
    context.screenPoint.y - center.y,
  );

  if (distancePx > radiusPx) {
    return null;
  }

  return {
    kind: "CIRCLE",
    id: value.id,
    distancePx,
  };
}

export function hitTriangleValue(
  value: EvaluatedTriangle,
  context: GeometryHitContext,
): TriangleHitTarget | null {
  const worldPoint = screenToWorld(context.viewport, context.screenPoint);

  if (!pointInTriangle(worldPoint, value)) {
    return null;
  }

  return {
    kind: "TRIANGLE",
    id: value.id,
  };
}

export function distanceToSegmentScreen(
  viewport: GeometryHitContext["viewport"],
  screenPoint: GeometryHitContext["screenPoint"],
  segment: EvaluatedSegment,
): number {
  const a = worldToScreen(viewport, segment.a);
  const b = worldToScreen(viewport, segment.b);

  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = screenPoint.x - a.x;
  const apy = screenPoint.y - a.y;

  const abLengthSquared = abx * abx + aby * aby;

  if (abLengthSquared === 0) {
    return Math.hypot(apx, apy);
  }

  const t = Math.max(
    0,
    Math.min(1, (apx * abx + apy * aby) / abLengthSquared),
  );
  const closest = {
    x: a.x + t * abx,
    y: a.y + t * aby,
  };

  return Math.hypot(screenPoint.x - closest.x, screenPoint.y - closest.y);
}

export function pointInTriangle(
  point: Readonly<{ x: number; y: number }>,
  triangle: EvaluatedTriangle,
): boolean {
  const area = signedTriangleArea(triangle.a, triangle.b, triangle.c);
  const area1 = signedTriangleArea(point, triangle.b, triangle.c);
  const area2 = signedTriangleArea(triangle.a, point, triangle.c);
  const area3 = signedTriangleArea(triangle.a, triangle.b, point);

  if (area === 0) {
    return false;
  }

  const epsilon = 1e-9;

  return (
    Math.abs(area - (area1 + area2 + area3)) < epsilon &&
    sameSign(area, area1) &&
    sameSign(area, area2) &&
    sameSign(area, area3)
  );
}

function signedTriangleArea(
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
  c: Readonly<{ x: number; y: number }>,
): number {
  return (
    (a.x * (b.y - c.y) +
      b.x * (c.y - a.y) +
      c.x * (a.y - b.y)) /
    2
  );
}

function sameSign(a: number, b: number): boolean {
  return a === 0 || b === 0 || Math.sign(a) === Math.sign(b);
}
