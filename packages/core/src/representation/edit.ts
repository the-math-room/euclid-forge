import { evaluateGraph } from "../evaluation/evaluateGraph";
import { constrainedDirectionForLinearGeometry } from "../geometry/linearConstraint";
import type { Vec2 } from "../meaning/vec2";
import { createGraph, type Graph } from "./graph";
import { freePoint, type GraphNode, type NodeId } from "./node";
import { canDeleteNodes, cascadingDeleteIds } from "./deletePolicy";
import { planFreePoint } from "./freePointPlanning";

export type GraphEdit = Readonly<
  | {
      kind: "ADD_FREE_POINT";
      point: Vec2;
    }
  | {
      kind: "ADD_NODES";
      nodes: readonly GraphNode[];
    }
  | {
      kind: "MOVE_FREE_POINT";
      id: NodeId;
      point: Vec2;
    }
  | {
      kind: "MOVE_CONSTRAINED_POINT";
      id: NodeId;
      point: Vec2;
    }
  | {
      kind: "TRANSLATE_FREE_POINTS";
      ids: readonly NodeId[];
      delta: Vec2;
    }
  | {
      kind: "SET_FREE_POINT_POSITIONS";
      positions: ReadonlyMap<NodeId, Vec2>;
    }
  | {
      kind: "DELETE_NODES";
      ids: readonly NodeId[];
    }
  | {
      kind: "SET_NODE_Z_INDICES";
      zIndices: ReadonlyMap<NodeId, number>;
    }
>;

export function applyGraphEdit(graph: Graph, edit: GraphEdit): Graph {
  switch (edit.kind) {
    case "ADD_FREE_POINT":
      return addFreePoint(graph, edit.point);

    case "ADD_NODES":
      return addNodes(graph, edit.nodes);

    case "MOVE_FREE_POINT":
      return moveFreePoint(graph, edit.id, edit.point);

    case "MOVE_CONSTRAINED_POINT":
      return moveConstrainedPoint(graph, edit.id, edit.point);

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

function addFreePoint(graph: Graph, point: Vec2): Graph {
  return addNodes(graph, [planFreePoint(graph, point).node]);
}

function addNodes(graph: Graph, nodes: readonly GraphNode[]): Graph {
  if (nodes.length === 0) {
    return graph;
  }

  return createGraph([...graph.nodes, ...nodes]);
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
    graph.nodes.map((candidate) =>
      candidate.id === id
        ? {
            ...node,
            x: point.x,
            y: point.y,
          }
        : candidate,
    ),
  );
}

function moveConstrainedPoint(graph: Graph, id: NodeId, point: Vec2): Graph {
  const node = graph.byId.get(id);

  if (!node) {
    throw new Error(`Cannot move missing node: ${id}`);
  }

  if (node.kind !== "LINEAR_CONSTRAINED_POINT") {
    throw new Error(`Cannot move non-constrained point: ${id}`);
  }

  const evaluated = evaluateGraph(graph);
  const reference = evaluated.values.get(node.reference);
  const anchor = evaluated.values.get(node.anchor);

  if (!reference) {
    throw new Error(
      `Cannot move ${id}; missing evaluated reference: ${node.reference}`,
    );
  }

  if (reference.kind === "SEGMENT_MEASUREMENT") {
    throw new Error(
      `Cannot move ${id}; reference ${node.reference} is not evaluated geometry`,
    );
  }

  if (!anchor || anchor.kind !== "POINT") {
    throw new Error(
      `Cannot move ${id}; missing evaluated anchor: ${node.anchor}`,
    );
  }

  const direction = constrainedDirectionForLinearGeometry(
    reference,
    node.mode,
  );

  if (!direction) {
    throw new Error(
      `Cannot move ${id}; reference ${node.reference} is not a non-degenerate line or segment`,
    );
  }

  const offset =
    (point.x - anchor.point.x) * direction.x +
    (point.y - anchor.point.y) * direction.y;

  return createGraph(
    graph.nodes.map((candidate) =>
      candidate.id === id
        ? {
            ...node,
            offset,
          }
        : candidate,
    ),
  );
}

function translateFreePoints(
  graph: Graph,
  ids: readonly NodeId[],
  delta: Vec2,
): Graph {
  if (ids.length === 0) {
    return graph;
  }

  const positions = new Map<NodeId, Vec2>();

  for (const id of ids) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot translate missing node: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(`Cannot directly translate constrained node: ${id}`);
    }

    positions.set(id, { x: node.x + delta.x, y: node.y + delta.y });
  }

  return setFreePointPositions(graph, positions);
}

function setFreePointPositions(
  graph: Graph,
  positions: ReadonlyMap<NodeId, Vec2>,
): Graph {
  if (positions.size === 0) {
    return graph;
  }

  for (const [id] of positions) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot set missing node position: ${id}`);
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

      return {
        ...node,
        x: point.x,
        y: point.y,
      };
    }),
  );
}

function deleteNodes(graph: Graph, ids: readonly NodeId[]): Graph {
  if (!canDeleteNodes(graph, ids)) {
    throw new Error("Cannot delete nodes.");
  }

  const idsToDelete = cascadingDeleteIds(graph, ids);

  return createGraph(graph.nodes.filter((node) => !idsToDelete.has(node.id)));
}

function setNodeZIndices(
  graph: Graph,
  updates: ReadonlyMap<NodeId, number>,
): Graph {
  if (updates.size === 0) {
    return graph;
  }

  for (const [id] of updates) {
    if (!graph.byId.has(id)) {
      throw new Error(`Cannot set z-index for missing node: ${id}`);
    }
  }

  return createGraph(
    graph.nodes.map((node) => {
      const zIndex = updates.get(node.id);

      return zIndex === undefined
        ? node
        : {
            ...node,
            zIndex,
          };
    }),
  );
}
