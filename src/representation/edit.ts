import type { Vec2 } from "../meaning/vec2";
import { createGraph } from "./graph";
import type { Graph } from "./graph";
import {
  centroidNode,
  freePoint,
  midpointNode,
  segmentNode,
  triangleNode,
} from "./node";
import type { GeometryNode, MidpointNode, NodeId, SegmentNode, TriangleNode } from "./node";

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
    }>
  | Readonly<{
      kind: "SET_FREE_POINT_POSITIONS";
      positions: ReadonlyMap<NodeId, Vec2>;
    }>
  | Readonly<{
      kind: "ADD_TRIANGLE";
      vertices: readonly [NodeId, NodeId, NodeId];
    }>
  | Readonly<{
      kind: "ADD_CENTROID";
      triangle: NodeId;
    }>
  | Readonly<{
      kind: "ADD_MIDPOINTS";
      triangle: NodeId;
    }>;

export function applyGraphEdit(graph: Graph, edit: GraphEdit): Graph {
  switch (edit.kind) {
    case "ADD_FREE_POINT":
      return addFreePoint(graph, edit.point);

    case "MOVE_FREE_POINT":
      return moveFreePoint(graph, edit.id, edit.point);

    case "TRANSLATE_FREE_POINTS":
      return translateFreePoints(graph, edit.ids, edit.delta);

    case "SET_FREE_POINT_POSITIONS":
      return setFreePointPositions(graph, edit.positions);

    case "ADD_TRIANGLE":
      return addTriangle(graph, edit.vertices);

    case "ADD_CENTROID":
      return addCentroid(graph, edit.triangle);

    case "ADD_MIDPOINTS":
      return addTriangleSideMidpoints(graph, edit.triangle);
  }
}

function addFreePoint(graph: Graph, point: Vec2): Graph {
  const id = nextPointId(graph);

  return createGraph([...graph.nodes, freePoint(id, point.x, point.y, id)]);
}

function addTriangle(
  graph: Graph,
  vertices: readonly [NodeId, NodeId, NodeId],
): Graph {
  const uniqueVertices = new Set(vertices);

  if (uniqueVertices.size !== 3) {
    throw new Error("Cannot create triangle from duplicate vertices");
  }

  for (const id of vertices) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create triangle with missing vertex: ${id}`);
    }

    if (node.kind !== "FREE_POINT") {
      throw new Error(`Cannot create triangle with constrained vertex: ${id}`);
    }
  }

  const id = nextTriangleId(graph);

  return createGraph([
    ...graph.nodes,
    triangleNode(id, vertices[0], vertices[1], vertices[2]),
  ]);
}

function addCentroid(graph: Graph, triangle: NodeId): Graph {
  const node = graph.byId.get(triangle);

  if (!node) {
    throw new Error(`Cannot create centroid for missing triangle: ${triangle}`);
  }

  if (node.kind !== "TRIANGLE") {
    throw new Error(`Cannot create centroid for non-triangle node: ${triangle}`);
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "CENTROID" && candidate.triangle === triangle,
  );

  if (existing) {
    return graph;
  }

  const id = nextCentroidId(graph);

  return createGraph([...graph.nodes, centroidNode(id, triangle, id)]);
}

function addTriangleSideMidpoints(graph: Graph, triangle: NodeId): Graph {
  const node = graph.byId.get(triangle);

  if (!node) {
    throw new Error(`Cannot create side midpoints for missing triangle: ${triangle}`);
  }

  if (node.kind !== "TRIANGLE") {
    throw new Error(`Cannot create side midpoints for non-triangle node: ${triangle}`);
  }

  let nodes = [...graph.nodes];
  let changed = false;

  for (const [a, b] of triangleEdges(node)) {
    const segment = findSegmentBetween(nodes, a, b);

    if (!segment) {
      const segmentId = nextSegmentId(nodes, a, b);
      nodes = [...nodes, segmentNode(segmentId, a, b)];
      changed = true;
    }

    const currentSegment = findSegmentBetween(nodes, a, b);

    if (!currentSegment) {
      throw new Error(`Internal segment creation error for ${a}, ${b}`);
    }

    const midpoint = findMidpointForSegment(nodes, currentSegment.id);

    if (!midpoint) {
      const midpointId = nextMidpointId(nodes, currentSegment.id);
      nodes = [...nodes, midpointNode(midpointId, currentSegment.id, midpointId)];
      changed = true;
    }
  }

  if (!changed) {
    return graph;
  }

  return createGraph(nodes);
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

function findSegmentBetween(
  nodes: readonly GeometryNode[],
  a: NodeId,
  b: NodeId,
): SegmentNode | null {
  const found = nodes.find(
    (node): node is SegmentNode =>
      node.kind === "SEGMENT" &&
      ((node.a === a && node.b === b) || (node.a === b && node.b === a)),
  );

  return found ?? null;
}

function findMidpointForSegment(
  nodes: readonly GeometryNode[],
  segment: NodeId,
): MidpointNode | null {
  const found = nodes.find(
    (node): node is MidpointNode =>
      node.kind === "MIDPOINT" && node.segment === segment,
  );

  return found ?? null;
}

function triangleEdges(
  triangle: TriangleNode,
): readonly (readonly [NodeId, NodeId])[] {
  return [
    [triangle.a, triangle.b],
    [triangle.b, triangle.c],
    [triangle.c, triangle.a],
  ];
}

function endpointKey(a: NodeId, b: NodeId): string {
  return [a, b].sort().join("_");
}

function nextPointId(graph: Graph): NodeId {
  let index = 1;

  while (graph.byId.has(`P${index}`)) {
    index += 1;
  }

  return `P${index}`;
}

function nextTriangleId(graph: Graph): NodeId {
  let index = 1;

  while (graph.byId.has(`T${index}`)) {
    index += 1;
  }

  return `T${index}`;
}

function nextCentroidId(graph: Graph): NodeId {
  let index = 1;

  while (graph.byId.has(`G${index}`)) {
    index += 1;
  }

  return `G${index}`;
}

function nextSegmentId(
  nodes: readonly { id: NodeId }[],
  a: NodeId,
  b: NodeId,
): NodeId {
  const base = `S_${endpointKey(a, b)}`;

  if (!nodes.some((node) => node.id === base)) {
    return base;
  }

  let index = 1;

  while (nodes.some((node) => node.id === `${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
}

function nextMidpointId(
  nodes: readonly { id: NodeId }[],
  segment: NodeId,
): NodeId {
  const base = `M_${segment}`;

  if (!nodes.some((node) => node.id === base)) {
    return base;
  }

  let index = 1;

  while (nodes.some((node) => node.id === `${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
}
