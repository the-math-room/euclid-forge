import type { NodeId } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";

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

export type GeometryBodyDragContext = Readonly<{
  areFreePoints: (ids: readonly NodeId[]) => boolean;
}>;

export type GeometryBodyDrag = Readonly<{
  sourcePointIds: readonly NodeId[];
}>;
