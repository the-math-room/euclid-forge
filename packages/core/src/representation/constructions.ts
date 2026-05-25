import { constructionFactoryForGeometryKind } from "../geometry/geometryRegistry";
import { midpointNode, parallelPointNode, segmentNode } from "./node";
import type {
  GeometryNode,
  MidpointNode,
  NodeId,
  SegmentNode,
  TriangleNode,
} from "./node";
import type { Graph } from "./graph";
import { nextAlphabeticLabel } from "./pointLabelPlanning";

export function segmentIntersectionConstruction(
  graph: Graph,
  segmentA: NodeId,
  segmentB: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind(
    "SEGMENT_INTERSECTION",
    "segmentIntersection",
  )({ graph }, segmentA, segmentB);
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

export function lineConstruction(
  graph: Graph,
  a: NodeId,
  b: NodeId,
): readonly GeometryNode[] {
  return constructionFactoryForGeometryKind("LINE", "line")({ graph }, a, b);
}

export function parallelSegmentConstruction(
  graph: Graph,
  reference: NodeId,
  anchor: NodeId,
  offset = 1,
): readonly GeometryNode[] {
  const referenceNode = graph.byId.get(reference);

  if (!referenceNode) {
    throw new Error(
      `Cannot create parallel segment with missing reference: ${reference}`,
    );
  }

  if (referenceNode.kind !== "SEGMENT" && referenceNode.kind !== "LINE") {
    throw new Error(
      `Cannot create parallel segment with non-linear reference: ${reference}`,
    );
  }

  const anchorNode = graph.byId.get(anchor);

  if (!anchorNode) {
    throw new Error(
      `Cannot create parallel segment with missing anchor: ${anchor}`,
    );
  }

  if (
    anchorNode.kind !== "FREE_POINT" &&
    anchorNode.kind !== "MIDPOINT" &&
    anchorNode.kind !== "CENTROID" &&
    anchorNode.kind !== "SEGMENT_INTERSECTION" &&
    anchorNode.kind !== "CURVE_INTERSECTION" &&
    anchorNode.kind !== "PARALLEL_POINT"
  ) {
    throw new Error(
      `Cannot create parallel segment with non-point anchor: ${anchor}`,
    );
  }

  const existingEndpoint = graph.nodes.find(
    (node) =>
      node.kind === "PARALLEL_POINT" &&
      node.reference === reference &&
      node.anchor === anchor,
  );

  if (existingEndpoint) {
    const existingSegment = graph.nodes.find(
      (node) =>
        node.kind === "SEGMENT" &&
        ((node.a === anchor && node.b === existingEndpoint.id) ||
          (node.a === existingEndpoint.id && node.b === anchor)),
    );

    return existingSegment
      ? Object.freeze([])
      : Object.freeze([
          segmentNode(
            nextSegmentId(graph.nodes, anchor, existingEndpoint.id),
            anchor,
            existingEndpoint.id,
          ),
        ]);
  }

  const endpointId = nextParallelPointId(graph.nodes, reference, anchor);
  const endpoint = parallelPointNode(
    endpointId,
    reference,
    anchor,
    offset,
    nextAlphabeticLabel(
      new Set(
        graph.nodes
          .filter((candidate) => "label" in candidate)
          .map((candidate) => candidate.label),
      ),
    ),
  );

  return Object.freeze([
    endpoint,
    segmentNode(
      nextSegmentId([...graph.nodes, endpoint], anchor, endpointId),
      anchor,
      endpointId,
    ),
  ]);
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

export function segmentMidpointConstruction(
  graph: Graph,
  segment: NodeId,
): readonly GeometryNode[] {
  const node = graph.byId.get(segment);

  if (!node) {
    throw new Error(`Cannot create midpoint for missing segment: ${segment}`);
  }

  if (node.kind !== "SEGMENT") {
    throw new Error(`Cannot create midpoint for non-segment node: ${segment}`);
  }

  const existing = findMidpointForSegment(graph.nodes, segment);

  if (existing) {
    return Object.freeze([]);
  }

  return Object.freeze([
    midpointNode(
      nextMidpointId(graph.nodes, segment),
      segment,
      nextAlphabeticLabel(
        new Set(
          graph.nodes
            .filter((candidate) => "label" in candidate)
            .map((candidate) => candidate.label),
        ),
      ),
    ),
  ]);
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
  const usedPointLabels = new Set(
    graph.nodes.filter((node) => "label" in node).map((node) => node.label),
  );
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
      const label = nextAlphabeticLabel(usedPointLabels);
      usedPointLabels.add(label);
      const midpoint = midpointNode(id, segment.id, label);

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

function nextParallelPointId(
  nodes: readonly { id: NodeId }[],
  reference: NodeId,
  anchor: NodeId,
): NodeId {
  const base = `PP_${reference}_${anchor}`;

  if (!nodes.some((node) => node.id === base)) {
    return base;
  }

  let index = 1;

  while (nodes.some((node) => node.id === `${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
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
