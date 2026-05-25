import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";

export type EvaluatedPointRole =
  | "FREE"
  | "MIDPOINT"
  | "CENTROID"
  | "INTERSECTION";

export type EvaluatedPoint = Readonly<{
  kind: "POINT";
  sourceKind:
    | "FREE_POINT"
    | "MIDPOINT"
    | "CENTROID"
    | "SEGMENT_INTERSECTION"
    | "CURVE_INTERSECTION";
  zIndex?: number;
  id: NodeId;
  point: Vec2;
  label: string;
  role: EvaluatedPointRole;
}>;

export type EvaluatedSegment = Readonly<{
  kind: "SEGMENT";
  sourceKind: "SEGMENT";
  zIndex?: number;
  id: NodeId;
  a: Vec2;
  b: Vec2;
}>;

export type EvaluatedCircle = Readonly<{
  kind: "CIRCLE";
  sourceKind: "CIRCLE";
  zIndex?: number;
  id: NodeId;
  center: Vec2;
  radius: number;
}>;

export type EvaluatedTriangle = Readonly<{
  kind: "TRIANGLE";
  sourceKind: "TRIANGLE";
  zIndex?: number;
  id: NodeId;
  a: Vec2;
  b: Vec2;
  c: Vec2;
}>;

export type EvaluatedGeometry =
  | EvaluatedPoint
  | EvaluatedSegment
  | EvaluatedCircle
  | EvaluatedTriangle;
