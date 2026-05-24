import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "./graph";
import type { Graph } from "./graph";
import { freePoint } from "./node";
import type { NodeId } from "./node";

export type GraphEdit =
  | Readonly<{
      kind: "ADD_FREE_POINT";
      point: Vec2;
    }>
  | Readonly<{
      kind: "MOVE_FREE_POINT";
      id: NodeId;
      point: Vec2;
    }>
  | Readonly<{
      kind: "TRANSLATE_FREE_POINTS";
      ids: readonly NodeId[];
      delta: Vec2;
    }>;

export function applyGraphEdit(graph: Graph, edit: GraphEdit): Graph {
  switch (edit.kind) {
    case "ADD_FREE_POINT":
      return addFreePoint(graph, edit.point);

    case "MOVE_FREE_POINT":
      return moveFreePoint(graph, edit.id, edit.point);

    case "TRANSLATE_FREE_POINTS":
      return translateFreePoints(graph, edit.ids, edit.delta);
  }
}

function addFreePoint(graph: Graph, point: Vec2): Graph {
  const id = nextPointId(graph);

  return createGraph([...graph.nodes, freePoint(id, point.x, point.y, id)]);
}

function moveFreePoint(graph: Graph, id: NodeId, point: Vec2): Graph {
  const node = graph.byId.get(id);

  if (!node) {
    throw new Error(`Cannot move missing node: ${id}`);
  }

  if (node.kind !== "FREE_POINT") {
    throw new Error(`Cannot directly move constrained node: ${id}`);
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

function translateFreePoints(
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

function nextPointId(graph: Graph): NodeId {
  let index = 1;

  while (graph.byId.has(`P${index}`)) {
    index += 1;
  }

  return `P${index}`;
}
