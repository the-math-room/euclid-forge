import type { EvaluatedSceneItem } from "@euclid-forge/core/evaluation/evaluated";
import { worldToScreen } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";

export type ScreenPolygonOccluder = Readonly<{
  id: string;
  zIndex: number;
  points: readonly ScreenPoint[];
}>;

export type LinearOcclusionOptions = Readonly<{
  polygonOccluders?: readonly ScreenPolygonOccluder[];
}>;

type SegmentInterval = Readonly<{
  start: number;
  end: number;
  hidden: boolean;
}>;

const EPSILON = 1e-9;
const HIDDEN_DASH_PX = Object.freeze([6, 5]);

export function polygonOccludersForScene(
  values: readonly EvaluatedSceneItem[],
  viewport: Viewport,
): readonly ScreenPolygonOccluder[] {
  return values.flatMap((value): readonly ScreenPolygonOccluder[] => {
    switch (value.kind) {
      case "TRIANGLE":
        return [
          Object.freeze({
            id: value.id,
            zIndex: value.zIndex ?? 0,
            points: Object.freeze([
              worldToScreen(viewport, value.a),
              worldToScreen(viewport, value.b),
              worldToScreen(viewport, value.c),
            ]),
          }),
        ];

      case "CIRCLE":
        return [
          Object.freeze({
            id: value.id,
            zIndex: value.zIndex ?? 0,
            points: circleOccluderPoints(viewport, value.center, value.radius),
          }),
        ];

      case "POINT":
      case "SEGMENT":
      case "LINE":
      case "SEGMENT_MEASUREMENT":
        return [];
    }
  });
}

export function drawOccludedSegment(
  ctx: CanvasRenderingContext2D,
  segment: Readonly<{
    id: string;
    zIndex?: number;
    a: ScreenPoint;
    b: ScreenPoint;
  }>,
  options: LinearOcclusionOptions = {},
): void {
  const intervals = occlusionIntervalsForSegment(
    segment.a,
    segment.b,
    higherPolygonOccluders(segment.zIndex ?? 0, options.polygonOccluders ?? []),
  );

  for (const interval of intervals) {
    const start = interpolate(segment.a, segment.b, interval.start);
    const end = interpolate(segment.a, segment.b, interval.end);

    if (interval.hidden) {
      ctx.setLineDash(HIDDEN_DASH_PX);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  ctx.setLineDash([]);
}

function higherPolygonOccluders(
  zIndex: number,
  occluders: readonly ScreenPolygonOccluder[],
): readonly ScreenPolygonOccluder[] {
  return occluders.filter((occluder) => occluder.zIndex > zIndex);
}

function occlusionIntervalsForSegment(
  a: ScreenPoint,
  b: ScreenPoint,
  occluders: readonly ScreenPolygonOccluder[],
): readonly SegmentInterval[] {
  if (occluders.length === 0) {
    return [Object.freeze({ start: 0, end: 1, hidden: false })];
  }

  const breaks = new Set<number>([0, 1]);

  for (const occluder of occluders) {
    for (let index = 0; index < occluder.points.length; index += 1) {
      const edgeA = occluder.points[index];
      const edgeB = occluder.points[(index + 1) % occluder.points.length];

      if (!edgeA || !edgeB) {
        continue;
      }

      const t = segmentIntersectionT(a, b, edgeA, edgeB);

      if (t !== null && t > EPSILON && t < 1 - EPSILON) {
        breaks.add(clamp01(t));
      }
    }
  }

  const ordered = [...breaks].sort((left, right) => left - right);
  const intervals: SegmentInterval[] = [];

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const start = ordered[index] ?? 0;
    const end = ordered[index + 1] ?? 1;

    if (end - start < EPSILON) {
      continue;
    }

    const midpoint = interpolate(a, b, (start + end) / 2);
    const hidden = occluders.some((occluder) =>
      pointInPolygon(midpoint, occluder.points),
    );

    intervals.push(Object.freeze({ start, end, hidden }));
  }

  return Object.freeze(intervals);
}

function segmentIntersectionT(
  a: ScreenPoint,
  b: ScreenPoint,
  c: ScreenPoint,
  d: ScreenPoint,
): number | null {
  const r = {
    x: b.x - a.x,
    y: b.y - a.y,
  };
  const s = {
    x: d.x - c.x,
    y: d.y - c.y,
  };
  const denominator = cross(r, s);

  if (Math.abs(denominator) < EPSILON) {
    return null;
  }

  const cMinusA = {
    x: c.x - a.x,
    y: c.y - a.y,
  };
  const t = cross(cMinusA, s) / denominator;
  const u = cross(cMinusA, r) / denominator;

  if (t < -EPSILON || t > 1 + EPSILON || u < -EPSILON || u > 1 + EPSILON) {
    return null;
  }

  return clamp01(t);
}

function pointInPolygon(
  point: ScreenPoint,
  polygon: readonly ScreenPoint[],
): boolean {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];

    if (!currentPoint || !previousPoint) {
      continue;
    }

    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y || EPSILON) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function interpolate(a: ScreenPoint, b: ScreenPoint, t: number): ScreenPoint {
  return Object.freeze({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });
}

function cross(
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): number {
  return a.x * b.y - a.y * b.x;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}


function circleOccluderPoints(
  viewport: Viewport,
  center: Readonly<{ x: number; y: number }>,
  radius: number,
): readonly ScreenPoint[] {
  const screenCenter = worldToScreen(viewport, center);
  const screenEdge = worldToScreen(viewport, {
    x: center.x + radius,
    y: center.y,
  });
  const screenRadius = Math.hypot(
    screenEdge.x - screenCenter.x,
    screenEdge.y - screenCenter.y,
  );
  const steps = 64;
  const points: ScreenPoint[] = [];

  for (let index = 0; index < steps; index += 1) {
    const angle = (Math.PI * 2 * index) / steps;

    points.push(
      Object.freeze({
        x: screenCenter.x + Math.cos(angle) * screenRadius,
        y: screenCenter.y + Math.sin(angle) * screenRadius,
      }),
    );
  }

  return Object.freeze(points);
}
