import type { Vec2 } from "../meaning/vec2";
import type { Graph } from "./graph";
import { freePoint, type FreePointNode, type NodeId } from "./node";
import { nextPointLabel } from "./pointLabelPlanning";

export type PlannedFreePoint = Readonly<{
  id: NodeId;
  node: FreePointNode;
}>;

export function nextFreePointId(graph: Graph): NodeId {
  for (let index = 1; ; index += 1) {
    const id = `P${index}`;

    if (!graph.byId.has(id)) {
      return id;
    }
  }
}

export function planFreePoint(graph: Graph, point: Vec2): PlannedFreePoint {
  const id = nextFreePointId(graph);

  return {
    id,
    node: freePoint(id, point.x, point.y, nextPointLabel(graph)),
  };
}
