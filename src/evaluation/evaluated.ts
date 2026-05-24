import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";

export type EvaluatedPointSource = "FREE" | "CONSTRAINED";

export type EvaluatedPoint = Readonly<{
  kind: "POINT";
  id: NodeId;
  point: Vec2;
  label: string;
  source: EvaluatedPointSource;
}>;

export type EvaluatedSegment = Readonly<{
  kind: "SEGMENT";
  id: NodeId;
  a: Vec2;
  b: Vec2;
}>;

export type EvaluatedTriangle = Readonly<{
  kind: "TRIANGLE";
  id: NodeId;
  a: Vec2;
  b: Vec2;
  c: Vec2;
}>;

export type EvaluatedGeometry =
  | EvaluatedPoint
  | EvaluatedSegment
  | EvaluatedTriangle;
