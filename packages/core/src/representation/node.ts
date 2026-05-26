export type NodeId = string;

export type GeometryNode =
  | FreePointNode
  | SegmentNode
  | LineNode
  | CircleNode
  | TriangleNode
  | MidpointNode
  | CentroidNode
  | SegmentIntersectionNode
  | CurveIntersectionNode
  | LinearConstrainedPointNode
  | SegmentMeasurementNode;

export type LinearConstraintMode = "PARALLEL" | "PERPENDICULAR";
export type SegmentMeasurementPrecision = "auto";

export type FreePointNode = Readonly<{
  kind: "FREE_POINT";
  id: NodeId;
  zIndex?: number;
  x: number;
  y: number;
  label: string;
}>;

export type SegmentNode = Readonly<{
  kind: "SEGMENT";
  id: NodeId;
  zIndex?: number;
  a: NodeId;
  b: NodeId;
}>;

export type LineNode = Readonly<{
  kind: "LINE";
  id: NodeId;
  zIndex?: number;
  a: NodeId;
  b: NodeId;
}>;

export type CircleNode = Readonly<{
  kind: "CIRCLE";
  id: NodeId;
  zIndex?: number;
  center: NodeId;
  through: NodeId;
}>;

export type TriangleNode = Readonly<{
  kind: "TRIANGLE";
  id: NodeId;
  zIndex?: number;
  a: NodeId;
  b: NodeId;
  c: NodeId;
}>;

export type MidpointNode = Readonly<{
  kind: "MIDPOINT";
  id: NodeId;
  zIndex?: number;
  segment: NodeId;
  label: string;
}>;

export type CentroidNode = Readonly<{
  kind: "CENTROID";
  id: NodeId;
  zIndex?: number;
  triangle: NodeId;
  label: string;
}>;

export type SegmentIntersectionNode = Readonly<{
  kind: "SEGMENT_INTERSECTION";
  id: NodeId;
  zIndex?: number;
  segmentA: NodeId;
  segmentB: NodeId;
  label: string;
}>;

export type CurveIntersectionNode = Readonly<{
  kind: "CURVE_INTERSECTION";
  id: NodeId;
  zIndex?: number;
  curveA: NodeId;
  curveB: NodeId;
  branchKey: string;
  label: string;
}>;

export type LinearConstrainedPointNode = Readonly<{
  kind: "LINEAR_CONSTRAINED_POINT";
  id: NodeId;
  zIndex?: number;
  reference: NodeId;
  anchor: NodeId;
  mode: LinearConstraintMode;
  offset: number;
  label: string;
}>;

export type SegmentMeasurementNode = Readonly<{
  kind: "SEGMENT_MEASUREMENT";
  id: NodeId;
  zIndex?: number;
  segment: NodeId;
  precision: SegmentMeasurementPrecision;
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

export function segmentNode(id: NodeId, a: NodeId, b: NodeId): SegmentNode {
  return Object.freeze({
    kind: "SEGMENT",
    id,
    a,
    b,
  });
}

export function lineNode(id: NodeId, a: NodeId, b: NodeId): LineNode {
  return Object.freeze({
    kind: "LINE",
    id,
    a,
    b,
  });
}

export function circleNode(
  id: NodeId,
  center: NodeId,
  through: NodeId,
): CircleNode {
  return Object.freeze({
    kind: "CIRCLE",
    id,
    center,
    through,
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

export function centroidNode(
  id: NodeId,
  triangle: NodeId,
  label: string,
): CentroidNode {
  return Object.freeze({
    kind: "CENTROID",
    id,
    triangle,
    label,
  });
}

export function segmentIntersectionNode(
  id: NodeId,
  segmentA: NodeId,
  segmentB: NodeId,
  label: string,
): SegmentIntersectionNode {
  return Object.freeze({
    kind: "SEGMENT_INTERSECTION",
    id,
    segmentA,
    segmentB,
    label,
  });
}

export function curveIntersectionNode(
  id: NodeId,
  curveA: NodeId,
  curveB: NodeId,
  branchKey: string,
  label: string,
): CurveIntersectionNode {
  return Object.freeze({
    kind: "CURVE_INTERSECTION",
    id,
    curveA,
    curveB,
    branchKey,
    label,
  });
}

export function linearConstrainedPointNode(
  id: NodeId,
  reference: NodeId,
  anchor: NodeId,
  mode: LinearConstraintMode,
  offset: number,
  label: string,
): LinearConstrainedPointNode {
  return Object.freeze({
    kind: "LINEAR_CONSTRAINED_POINT",
    id,
    reference,
    anchor,
    mode,
    offset,
    label,
  });
}

export function segmentMeasurementNode(
  id: NodeId,
  segment: NodeId,
  precision: SegmentMeasurementPrecision = "auto",
): SegmentMeasurementNode {
  return Object.freeze({
    kind: "SEGMENT_MEASUREMENT",
    id,
    segment,
    precision,
  });
}
