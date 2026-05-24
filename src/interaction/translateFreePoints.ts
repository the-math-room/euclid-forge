import { vec2 } from "../meaning/vec2";
import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import { freePoint } from "../representation/node";
import type { NodeId } from "../representation/node";

export function translateFreePoints(
  graph: Graph,
  ids: readonly NodeId[],
  delta: Vec2,
): Graph {
  const idSet = new Set(ids);

  for (const id of idSet) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot translate missing node: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(`Cannot directly translate constrained node: ${id}`);
    }
  }

  return createGraph(
    graph.nodes.map((node) => {
      if (!idSet.has(node.id)) {
        return node;
      }

      if (node.kind !== "FREE_POINT") {
        throw new Error(`Cannot directly translate constrained node: ${node.id}`);
      }

      return freePoint(
        node.id,
        node.x + delta.x,
        node.y + delta.y,
        node.label,
      );
    }),
  );
}

export function deltaBetween(a: Vec2, b: Vec2): Vec2 {
  return vec2(b.x - a.x, b.y - a.y);
}
