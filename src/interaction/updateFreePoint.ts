import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import { freePoint } from "../representation/node";
import type { NodeId } from "../representation/node";

export function updateFreePoint(
  graph: Graph,
  id: NodeId,
  point: Vec2,
): Graph {
  const node = graph.byId.get(id);

  if (!node) {
    throw new Error(`Cannot update missing node: ${id}`);
  }

  if (node.kind !== "FREE_POINT") {
    throw new Error(`Cannot directly update constrained node: ${id}`);
  }

  return createGraph(
    graph.nodes.map((candidate) => {
      if (candidate.id !== id) {
        return candidate;
      }

      return freePoint(node.id, point.x, point.y, node.label);
    }),
  );
}