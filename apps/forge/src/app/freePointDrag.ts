import { vec2 } from "@euclid-forge/core/meaning/vec2";
import type { Vec2 } from "@euclid-forge/core/meaning/vec2";
import type { Graph } from "@euclid-forge/core/representation/graph";
import type { NodeId } from "@euclid-forge/core/representation/node";

export type FreePointPositionSnapshot = ReadonlyMap<NodeId, Vec2>;

export function initialFreePointPositions(
  graph: Graph,
  ids: readonly NodeId[],
  description = "drag",
): FreePointPositionSnapshot {
  const positions = new Map<NodeId, Vec2>();

  for (const id of ids) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot start ${description} with missing point: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(
        `Cannot start ${description} with constrained point: ${id}`,
      );
    }

    positions.set(id, vec2(node.x, node.y));
  }

  return positions;
}

export function translatedFreePointPositions(
  initialPositions: FreePointPositionSnapshot,
  delta: Vec2,
): FreePointPositionSnapshot {
  const positions = new Map<NodeId, Vec2>();

  for (const [id, point] of initialPositions) {
    positions.set(id, vec2(point.x + delta.x, point.y + delta.y));
  }

  return positions;
}
