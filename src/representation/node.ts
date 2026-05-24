export type NodeId = string;

export type GeometryNode =
  | FreePointNode
  | SegmentNode
  | TriangleNode
  | MidpointNode;

export type FreePointNode = Readonly<{
  kind: "FREE_POINT";
  id: NodeId;
  x: number;
  y: number;
  label: string;
}>;

export type SegmentNode = Readonly<{
  kind: "SEGMENT";
  id: NodeId;
  a: NodeId;
  b: NodeId;
}>;

export type TriangleNode = Readonly<{
  kind: "TRIANGLE";
  id: NodeId;
  a: NodeId;
  b: NodeId;
  c: NodeId;
}>;

export type MidpointNode = Readonly<{
  kind: "MIDPOINT";
  id: NodeId;
  segment: NodeId;
  label: string;
}>;

export function freePoint(
  id: NodeId,
  x: number,
  y: number,
  label: string,
): FreePointNode {
  return Object.freeze({
    kind: "FREE_POINT",
    id,
    x,
    y,
    label,
  });
}

export function segmentNode(
  id: NodeId,
  a: NodeId,
  b: NodeId,
): SegmentNode {
  return Object.freeze({
    kind: "SEGMENT",
    id,
    a,
    b,
  });
}

export function triangleNode(
  id: NodeId,
  a: NodeId,
  b: NodeId,
  c: NodeId,
): TriangleNode {
  return Object.freeze({
    kind: "TRIANGLE",
    id,
    a,
    b,
    c,
  });
}

export function midpointNode(
  id: NodeId,
  segment: NodeId,
  label: string,
): MidpointNode {
  return Object.freeze({
    kind: "MIDPOINT",
    id,
    segment,
    label,
  });
}
