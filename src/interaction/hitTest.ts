import type { EvaluatedScene } from "../evaluation/evaluateScene";
import type { EvaluatedPoint } from "../evaluation/evaluated";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import type { ScreenPoint, Viewport } from "../rendering/viewport";
import { worldToScreen } from "../rendering/viewport";

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

    if (!isFreePoint(graph, value)) {
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

function isFreePoint(graph: Graph, value: EvaluatedPoint): boolean {
  return graph.byId.get(value.id)?.kind === "FREE_POINT";
}
