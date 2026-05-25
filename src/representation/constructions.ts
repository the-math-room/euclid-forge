import { constructionFactoryForGeometryKind } from "../geometry/geometryRegistry";
import {
  midpointNode,
  segmentNode,
} from "./node";
import type {
  GeometryNode,
  MidpointNode,
  NodeId,
  SegmentNode,
  TriangleNode,
} from "./node";
import type { Graph } from "./graph";

export function segmentIntersectionConstruction(
  graph: Graph,
  lineA: NodeId,
  lineB: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind(
    "SEGMENT_INTERSECTION",
    "segmentIntersection",
  )(
    { graph },
    lineA,
    lineB,
  );
}

export function segmentConstruction(
  graph: Graph,
  a: NodeId,
  b: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind("SEGMENT", "segment")(
    { graph },
    a,
    b,
  );
}

export function circleConstruction(
  graph: Graph,
  center: NodeId,
  through: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind("CIRCLE", "circle")(
    { graph },
    center,
    through,
  );
}

export function triangleConstruction(
  graph: Graph,
  vertices: readonly [NodeId, NodeId, NodeId],
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind("TRIANGLE", "triangle")(
    { graph },
    vertices[0],
    vertices[1],
    vertices[2],
  );
}

export function centroidConstruction(
  graph: Graph,
  triangle: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind("CENTROID", "centroid")(
    { graph },
    triangle,
  );
}

export function triangleSideMidpointConstruction(
  graph: Graph,
  triangle: NodeId,
): readonly GeometryNode[] {
  const node = graph.byId.get(triangle);

  if (!node) {
    throw new Error(
      `Cannot create side midpoints for missing triangle: ${triangle}`,
    );
  }

  if (node.kind !== "TRIANGLE") {
    throw new Error(
      `Cannot create side midpoints for non-triangle node: ${triangle}`,
    );
  }

  const additions: GeometryNode[] = [];
  let nodes = [...graph.nodes];

  for (const [a, b] of triangleEdges(node)) {
    const segment =
      findSegmentBetween(nodes, a, b) ??
      segmentNode(nextSegmentId(nodes, a, b), a, b);

    if (!nodes.some((candidate) => candidate.id === segment.id)) {
      additions.push(segment);
      nodes = [...nodes, segment];
    }

    if (!findMidpointForSegment(nodes, segment.id)) {
      const id = nextMidpointId(nodes, segment.id);
      const midpoint = midpointNode(id, segment.id, id);

      additions.push(midpoint);
      nodes = [...nodes, midpoint];
    }
  }

  return Object.freeze(additions);
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
