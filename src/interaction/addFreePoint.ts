import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "../representation/graph";
import type { Graph } from "../representation/graph";
import { freePoint } from "../representation/node";
import type { NodeId } from "../representation/node";

export function addFreePoint(graph: Graph, point: Vec2): Graph {
  const id = nextPointId(graph);

  return createGraph([
    ...graph.nodes,
    freePoint(id, point.x, point.y, id),
  ]);
}

function nextPointId(graph: Graph): NodeId {
  let index = 1;

  while (graph.byId.has(`P${index}`)) {
    index += 1;
  }

  return `P${index}`;
}
