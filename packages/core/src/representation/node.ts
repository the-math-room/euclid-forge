import type { Vec2 } from "../meaning/vec2";

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
  | LinearConstrainedPointNode;

export type AnnotationNode = SegmentMeasurementNode;

export type GraphNode = GeometryNode | AnnotationNode;

export type LinearConstraintMode = "PARALLEL" | "PERPENDICULAR";
export type SegmentMeasurementPrecision = "auto";

export type FreePointNode = Readonly<{
  kind: "FREE_POINT";
  id: NodeId;
  zIndex?: number;
  x: number;
  y: number;
  label: string;
  labelOffsetPx?: Vec2;
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
  labelOffsetPx?: Vec2;
}>;

export type CentroidNode = Readonly<{
  kind: "CENTROID";
  id: NodeId;
  zIndex?: number;
  triangle: NodeId;
  label: string;
  labelOffsetPx?: Vec2;
}>;

export type SegmentIntersectionNode = Readonly<{
  kind: "SEGMENT_INTERSECTION";
  id: NodeId;
  zIndex?: number;
  segmentA: NodeId;
  segmentB: NodeId;
  label: string;
  labelOffsetPx?: Vec2;
}>;

export type CurveIntersectionNode = Readonly<{
  kind: "CURVE_INTERSECTION";
  id: NodeId;
  zIndex?: number;
  curveA: NodeId;
  curveB: NodeId;
  branchKey: string;
  label: string;
  labelOffsetPx?: Vec2;
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
  labelOffsetPx?: Vec2;
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
  labelOffsetPx?: Vec2,
): FreePointNode {
  return Object.freeze({
    kind: "FREE_POINT",
    id,
    x,
    y,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
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
  labelOffsetPx?: Vec2,
): MidpointNode {
  return Object.freeze({
    kind: "MIDPOINT",
    id,
    segment,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
  });
}

export function centroidNode(
  id: NodeId,
  triangle: NodeId,
  label: string,
  labelOffsetPx?: Vec2,
): CentroidNode {
  return Object.freeze({
    kind: "CENTROID",
    id,
    triangle,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
  });
}

export function segmentIntersectionNode(
  id: NodeId,
  segmentA: NodeId,
  segmentB: NodeId,
  label: string,
  labelOffsetPx?: Vec2,
): SegmentIntersectionNode {
  return Object.freeze({
    kind: "SEGMENT_INTERSECTION",
    id,
    segmentA,
    segmentB,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
  });
}

export function curveIntersectionNode(
  id: NodeId,
  curveA: NodeId,
  curveB: NodeId,
  branchKey: string,
  label: string,
  labelOffsetPx?: Vec2,
): CurveIntersectionNode {
  return Object.freeze({
    kind: "CURVE_INTERSECTION",
    id,
    curveA,
    curveB,
    branchKey,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
  });
}

export function linearConstrainedPointNode(
  id: NodeId,
  reference: NodeId,
  anchor: NodeId,
  mode: LinearConstraintMode,
  offset: number,
  label: string,
  labelOffsetPx?: Vec2,
): LinearConstrainedPointNode {
  return Object.freeze({
    kind: "LINEAR_CONSTRAINED_POINT",
    id,
    reference,
    anchor,
    mode,
    offset,
    label,
    ...(labelOffsetPx === undefined ? {} : { labelOffsetPx }),
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
