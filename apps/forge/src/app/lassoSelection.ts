import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";
import type {
  EvaluatedScene,
  NodeId,
  ScreenPoint,
  Viewport,
} from "@euclid-forge/core";
import { evaluatedGeometryItems } from "@euclid-forge/core";
import { worldToScreen } from "@euclid-forge/core";
import { RENDER_THEME } from "../rendering/theme";

export type LassoSelectionInput = Readonly<{
  evaluated: EvaluatedScene;
  viewport: Viewport;
  polygon: readonly ScreenPoint[];
}>;

const CIRCLE_SAMPLE_COUNT = 48;

export function lassoSelectableNodeIds(
  input: LassoSelectionInput,
): readonly NodeId[] {
  if (!isUsablePolygon(input.polygon)) {
    return [];
  }

  const selected: NodeId[] = [];

  for (const value of evaluatedGeometryItems(input.evaluated)) {
    if (isGeometryFullyContained(value, input.viewport, input.polygon)) {
      selected.push(value.id);
    }
  }

  return Object.freeze(selected);
}

export function isGeometryFullyContained(
  value: EvaluatedGeometry,
  viewport: Viewport,
  polygon: readonly ScreenPoint[],
): boolean {
  switch (value.kind) {
    case "POINT": {
      const style = RENDER_THEME.point.styles[value.role];

      return diskFullyContainedInPolygon(
        worldToScreen(viewport, value.point),
        style.radiusPx,
        polygon,
      );
    }

    case "SEGMENT":
      return segmentFullyContainedInPolygon(
        worldToScreen(viewport, value.a),
        worldToScreen(viewport, value.b),
        polygon,
      );

    case "TRIANGLE":
      return polygonFullyContainedInPolygon(
        [
          worldToScreen(viewport, value.a),
          worldToScreen(viewport, value.b),
          worldToScreen(viewport, value.c),
        ],
        polygon,
      );


    case "CIRCLE": {
      const center = worldToScreen(viewport, value.center);
      const edge = worldToScreen(viewport, {
        x: value.center.x + value.radius,
        y: value.center.y,
      });
      const radiusPx = Math.hypot(edge.x - center.x, edge.y - center.y);

      return sampledCircleFullyContainedInPolygon(center, radiusPx, polygon);
    }

    case "LINE":
      return false;
  }
}

export function diskFullyContainedInPolygon(
  center: ScreenPoint,
  radiusPx: number,
  polygon: readonly ScreenPoint[],
): boolean {
  if (!pointInPolygon(center, polygon)) {
    return false;
  }

  for (const edge of polygonEdges(polygon)) {
    if (distanceToSegment(center, edge.a, edge.b) < radiusPx) {
      return false;
    }
  }

  return true;
}

export function segmentFullyContainedInPolygon(
  a: ScreenPoint,
  b: ScreenPoint,
  polygon: readonly ScreenPoint[],
): boolean {
  if (!pointInPolygon(a, polygon) || !pointInPolygon(b, polygon)) {
    return false;
  }

  return !segmentCrossesPolygonBoundary(a, b, polygon);
}

function polygonFullyContainedInPolygon(
  inner: readonly ScreenPoint[],
  outer: readonly ScreenPoint[],
): boolean {
  if (!isUsablePolygon(inner)) {
    return false;
  }

  if (!inner.every((point) => pointInPolygon(point, outer))) {
    return false;
  }

  for (const edge of polygonEdges(inner)) {
    if (segmentCrossesPolygonBoundary(edge.a, edge.b, outer)) {
      return false;
    }
  }

  return true;
}

function sampledCircleFullyContainedInPolygon(
  center: ScreenPoint,
  radiusPx: number,
  polygon: readonly ScreenPoint[],
): boolean {
  if (!pointInPolygon(center, polygon)) {
    return false;
  }

  for (let index = 0; index < CIRCLE_SAMPLE_COUNT; index += 1) {
    const angle = (Math.PI * 2 * index) / CIRCLE_SAMPLE_COUNT;
    const sample = {
      x: center.x + Math.cos(angle) * radiusPx,
      y: center.y + Math.sin(angle) * radiusPx,
    };

    if (!pointInPolygon(sample, polygon)) {
      return false;
    }
  }

  return true;
}

function segmentCrossesPolygonBoundary(
  a: ScreenPoint,
  b: ScreenPoint,
  polygon: readonly ScreenPoint[],
): boolean {
  return polygonEdges(polygon).some((edge) =>
    properSegmentsIntersect(a, b, edge.a, edge.b),
  );
}

function pointInPolygon(
  point: Readonly<{ x: number; y: number }>,
  polygon: readonly ScreenPoint[],
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const current = polygon[i];
    const previous = polygon[j];

    if (!current || !previous) {
      continue;
    }

    if (pointOnSegment(point, previous, current)) {
      return true;
    }

    const crosses =
      current.y > point.y !== previous.y > point.y &&
      point.x <
        ((previous.x - current.x) * (point.y - current.y)) /
          (previous.y - current.y) +
          current.x;

    if (crosses) {
      inside = !inside;
    }
  }

  return inside;
}

function polygonEdges(
  polygon: readonly ScreenPoint[],
): readonly Readonly<{ a: ScreenPoint; b: ScreenPoint }>[] {
  return polygon.map((point, index) => ({
    a: point,
    b: polygon[(index + 1) % polygon.length] ?? point,
  }));
}

function distanceToSegment(
  point: Readonly<{ x: number; y: number }>,
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;
  const lengthSquared = abx * abx + aby * aby;

  if (lengthSquared === 0) {
    return Math.hypot(apx, apy);
  }

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / lengthSquared));
  const closest = {
    x: a.x + t * abx,
    y: a.y + t * aby,
  };

  return Math.hypot(point.x - closest.x, point.y - closest.y);
}

function properSegmentsIntersect(
  a: ScreenPoint,
  b: ScreenPoint,
  c: ScreenPoint,
  d: ScreenPoint,
): boolean {
  if (
    pointOnSegment(a, c, d) ||
    pointOnSegment(b, c, d) ||
    pointOnSegment(c, a, b) ||
    pointOnSegment(d, a, b)
  ) {
    return false;
  }

  return (
    orientation(a, b, c) !== orientation(a, b, d) &&
    orientation(c, d, a) !== orientation(c, d, b)
  );
}

function pointOnSegment(
  point: Readonly<{ x: number; y: number }>,
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): boolean {
  const cross = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y);

  if (Math.abs(cross) > 1e-9) {
    return false;
  }

  return (
    point.x >= Math.min(a.x, b.x) - 1e-9 &&
    point.x <= Math.max(a.x, b.x) + 1e-9 &&
    point.y >= Math.min(a.y, b.y) - 1e-9 &&
    point.y <= Math.max(a.y, b.y) + 1e-9
  );
}

function orientation(
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
  c: Readonly<{ x: number; y: number }>,
): -1 | 0 | 1 {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);

  if (Math.abs(value) < 1e-9) {
    return 0;
  }

  return value > 0 ? 1 : -1;
}

function isUsablePolygon(polygon: readonly ScreenPoint[]): boolean {
  return polygon.length >= 3;
}
