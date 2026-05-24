import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { NodeId } from "../representation/node";
import type { ScreenPoint, Viewport } from "../rendering/viewport";

export type GeometryHitClass = "POINT" | "LINEAR" | "AREA";

export type PointHit = Readonly<{
  kind: "POINT";
  id: NodeId;
  distancePx: number;
}>;

export type SegmentHit = Readonly<{
  kind: "SEGMENT";
  id: NodeId;
  distancePx: number;
}>;

export type CircleHit = Readonly<{
  kind: "CIRCLE";
  id: NodeId;
  distancePx: number;
}>;

export type TriangleHitTarget = Readonly<{
  kind: "TRIANGLE";
  id: NodeId;
}>;

export type HitTarget = PointHit | SegmentHit | CircleHit | TriangleHitTarget;

export type GeometryHitContext = Readonly<{
  viewport: Viewport;
  screenPoint: ScreenPoint;
}>;

export type GeometryHitCandidate = Readonly<{
  hitClass: GeometryHitClass;
  target: HitTarget;
}>;

export type EvaluatedByKind<K extends EvaluatedGeometry["kind"]> = Extract<
  EvaluatedGeometry,
  { kind: K }
>;
