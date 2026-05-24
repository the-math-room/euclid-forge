import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import type { EvaluatedSegment, EvaluatedTriangle } from "../evaluation/evaluated";
import type { Vec2 } from "../meaning/vec2";
import type { Graph } from "../representation/graph";
import type { NodeId, TriangleNode } from "../representation/node";
import type { ScreenPoint, Viewport } from "../rendering/viewport";
import { screenToWorld, worldToScreen } from "../rendering/viewport";

export type TriangleHit = Readonly<{
  id: NodeId;
  vertexIds: readonly [NodeId, NodeId, NodeId];
}>;

export type TriangleSelectionHit = Readonly<{
  id: NodeId;
}>;

export type PointHit = Readonly<{
  kind: "POINT";
  id: NodeId;
  distancePx: number;
}>;

export type SegmentHit = Readonly<{
  kind: "SEGMENT";
  id: NodeId;
  distancePx: number;
}>;

export type TriangleHitTarget = Readonly<{
  kind: "TRIANGLE";
  id: NodeId;
}>;

export type HitTarget = PointHit | SegmentHit | TriangleHitTarget;

export function hitTestPointTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 12,
): PointHit | null {
  let best: PointHit | null = null;

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (value.kind !== "POINT") {
      continue;
    }

    const screen = worldToScreen(viewport, value.point);
    const distancePx = Math.hypot(
      screen.x - screenPoint.x,
      screen.y - screenPoint.y,
    );

    if (distancePx <= radiusPx && (!best || distancePx < best.distancePx)) {
      best = {
        kind: "POINT",
        id: value.id,
        distancePx,
      };
    }
  }

  return best;
}

export function hitTestPoint(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 12,
): NodeId | null {
  return hitTestPointTarget(evaluated, viewport, screenPoint, radiusPx)?.id ?? null;
}

export function hitTestFreePointTarget(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 12,
): PointHit | null {
  let best: PointHit | null = null;

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (value.kind !== "POINT") {
      continue;
    }

    if (!isFreePoint(graph, value.id)) {
      continue;
    }

    const screen = worldToScreen(viewport, value.point);
    const distancePx = Math.hypot(
      screen.x - screenPoint.x,
      screen.y - screenPoint.y,
    );

    if (distancePx <= radiusPx && (!best || distancePx < best.distancePx)) {
      best = {
        kind: "POINT",
        id: value.id,
        distancePx,
      };
    }
  }

  return best;
}

export function hitTestFreePoint(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 12,
): NodeId | null {
  return hitTestFreePointTarget(
    graph,
    evaluated,
    viewport,
    screenPoint,
    radiusPx,
  )?.id ?? null;
}

export function hitTestSegmentTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 8,
): SegmentHit | null {
  let best: SegmentHit | null = null;

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (value.kind !== "SEGMENT") {
      continue;
    }

    const distancePx = distanceToSegmentScreen(viewport, screenPoint, value);

    if (distancePx <= radiusPx && (!best || distancePx < best.distancePx)) {
      best = {
        kind: "SEGMENT",
        id: value.id,
        distancePx,
      };
    }
  }

  return best;
}

export function hitTestSegmentSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 8,
): NodeId | null {
  return hitTestSegmentTarget(evaluated, viewport, screenPoint, radiusPx)?.id ?? null;
}

export function hitTestTriangleTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleHitTarget | null {
  const worldPoint = screenToWorld(viewport, screenPoint);

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (value.kind !== "TRIANGLE") {
      continue;
    }

    if (!pointInTriangle(worldPoint, value)) {
      continue;
    }

    return {
      kind: "TRIANGLE",
      id: value.id,
    };
  }

  return null;
}

export function hitTestTriangleSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleSelectionHit | null {
  const hit = hitTestTriangleTarget(evaluated, viewport, screenPoint);

  return hit ? { id: hit.id } : null;
}

export function hitTestTriangleInterior(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleHit | null {
  const worldPoint = screenToWorld(viewport, screenPoint);

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (value.kind !== "TRIANGLE") {
      continue;
    }

    if (!pointInTriangle(worldPoint, value)) {
      continue;
    }

    const node = graph.byId.get(value.id);

    if (!node || node.kind !== "TRIANGLE") {
      continue;
    }

    const vertexIds = triangleVertexIds(node);

    if (!vertexIds.every((id) => isFreePoint(graph, id))) {
      continue;
    }

    return {
      id: value.id,
      vertexIds,
    };
  }

  return null;
}


function reverseVisualOrder<T>(values: readonly T[]): readonly T[] {
  return [...values].reverse();
}

function isFreePoint(graph: Graph, id: NodeId): boolean {
  return graph.byId.get(id)?.kind === "FREE_POINT";
}

function triangleVertexIds(
  triangle: TriangleNode,
): readonly [NodeId, NodeId, NodeId] {
  return [triangle.a, triangle.b, triangle.c];
}

function pointInTriangle(point: Vec2, triangle: EvaluatedTriangle): boolean {
  const d1 = signedArea(point, triangle.a, triangle.b);
  const d2 = signedArea(point, triangle.b, triangle.c);
  const d3 = signedArea(point, triangle.c, triangle.a);

  const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNegative && hasPositive);
}

function signedArea(a: Vec2, b: Vec2, c: Vec2): number {
  return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
}

function distanceToSegmentScreen(
  viewport: Viewport,
  point: ScreenPoint,
  segment: EvaluatedSegment,
): number {
  const a = worldToScreen(viewport, segment.a);
  const b = worldToScreen(viewport, segment.b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - a.x, point.y - a.y);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared),
  );

  const closest = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };

  return Math.hypot(point.x - closest.x, point.y - closest.y);
}
