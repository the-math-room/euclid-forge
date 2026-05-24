import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import type { EvaluatedTriangle } from "../evaluation/evaluated";
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

export function hitTestFreePoint(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  radiusPx = 12,
): NodeId | null {
  let best: Readonly<{
    id: NodeId;
    distance: number;
  }> | null = null;

  for (const value of evaluated.ordered) {
    if (value.kind !== "POINT") {
      continue;
    }

    if (!isFreePoint(graph, value.id)) {
      continue;
    }

    const screen = worldToScreen(viewport, value.point);
    const distance = Math.hypot(screen.x - screenPoint.x, screen.y - screenPoint.y);

    if (distance <= radiusPx && (!best || distance < best.distance)) {
      best = {
        id: value.id,
        distance,
      };
    }
  }

  return best?.id ?? null;
}

export function hitTestTriangleSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleSelectionHit | null {
  const worldPoint = screenToWorld(viewport, screenPoint);

  for (const value of evaluated.ordered) {
    if (value.kind !== "TRIANGLE") {
      continue;
    }

    if (!pointInTriangle(worldPoint, value)) {
      continue;
    }

    return {
      id: value.id,
    };
  }

  return null;
}

export function hitTestTriangleInterior(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleHit | null {
  const worldPoint = screenToWorld(viewport, screenPoint);

  for (const value of evaluated.ordered) {
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
