import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "./graph";
import type { Graph } from "./graph";
import { canDeleteNodes } from "./deletePolicy";
import { freePoint } from "./node";
import type { GeometryNode, NodeId } from "./node";

export type GraphEdit =
  | Readonly<{
      kind: "ADD_FREE_POINT";
      point: Vec2;
    }>
  | Readonly<{
      kind: "ADD_NODES";
      nodes: readonly GeometryNode[];
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
    }>
  | Readonly<{
      kind: "SET_FREE_POINT_POSITIONS";
      positions: ReadonlyMap<NodeId, Vec2>;
    }>
  | Readonly<{
      kind: "DELETE_NODES";
      ids: readonly NodeId[];
    }>
  | Readonly<{
      kind: "SET_NODE_Z_INDICES";
      zIndices: ReadonlyMap<NodeId, number>;
    }>;

export function applyGraphEdit(graph: Graph, edit: GraphEdit): Graph {
  switch (edit.kind) {
    case "ADD_FREE_POINT":
      return addFreePoint(graph, edit.point);

    case "ADD_NODES":
      return addNodes(graph, edit.nodes);

    case "MOVE_FREE_POINT":
      return moveFreePoint(graph, edit.id, edit.point);

    case "TRANSLATE_FREE_POINTS":
      return translateFreePoints(graph, edit.ids, edit.delta);

    case "SET_FREE_POINT_POSITIONS":
      return setFreePointPositions(graph, edit.positions);

    case "DELETE_NODES":
      return deleteNodes(graph, edit.ids);

    case "SET_NODE_Z_INDICES":
      return setNodeZIndices(graph, edit.zIndices);
  }
}

function addNodes(graph: Graph, nodes: readonly GeometryNode[]): Graph {
  if (nodes.length === 0) {
    return graph;
  }

  return createGraph([...graph.nodes, ...nodes]);
}

function deleteNodes(graph: Graph, ids: readonly NodeId[]): Graph {
  if (!canDeleteNodes(graph, ids)) {
    throw new Error("Cannot delete nodes with unselected dependents");
  }

  const idSet = new Set(ids);

  return createGraph(graph.nodes.filter((node) => !idSet.has(node.id)));
}

function addFreePoint(graph: Graph, point: Vec2): Graph {
  const id = nextPointId(graph);

  return createGraph([...graph.nodes, freePoint(id, point.x, point.y, id)]);
}

function setFreePointPositions(
  graph: Graph,
  positions: ReadonlyMap<NodeId, Vec2>,
): Graph {
  for (const [id] of positions) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot set position for missing node: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(`Cannot directly set constrained node position: ${id}`);
    }
  }

  return createGraph(
    graph.nodes.map((node) => {
      const point = positions.get(node.id);

      if (!point) {
        return node;
      }

      if (node.kind !== "FREE_POINT") {
        throw new Error(
          `Cannot directly set constrained node position: ${node.id}`,
        );
      }

      return freePoint(node.id, point.x, point.y, node.label);
    }),
  );
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

function setNodeZIndices(
  graph: Graph,
  zIndices: ReadonlyMap<NodeId, number>,
): Graph {
  if (zIndices.size === 0) {
    return graph;
  }

  for (const [id, zIndex] of zIndices) {
    if (!graph.byId.has(id)) {
      throw new Error(`Cannot set z-index for missing node: ${id}`);
    }

    if (!Number.isFinite(zIndex)) {
      throw new Error(`Node z-index must be finite for ${id}: ${zIndex}`);
    }
  }

  return createGraph(
    graph.nodes.map((node) => {
      const zIndex = zIndices.get(node.id);

      if (zIndex === undefined) {
        return node;
      }

      if (node.zIndex === zIndex) {
        return node;
      }

      return Object.freeze({
        ...node,
        zIndex,
      }) as GeometryNode;
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
