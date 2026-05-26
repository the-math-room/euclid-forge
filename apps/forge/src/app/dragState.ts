import type { NodeId, ScreenPoint, Vec2, Viewport } from "@euclid-forge/core";

export type DragState =
  | Readonly<{
      kind: "VIEWPORT";
      initialPointerScreen: Vec2;
      initialViewportCenter: Vec2;
      initialViewportZoom: number;
      initialViewportRotation: number;
    }>
  | Readonly<{
      kind: "LASSO";
      points: readonly ScreenPoint[];
      viewport: Viewport;
    }>
  | Readonly<{
      kind: "FREE_POINT";
      nodeId: NodeId;
    }>
  | Readonly<{
      kind: "LABEL";
      nodeId: NodeId;
      initialPointerScreen: ScreenPoint;
      initialLabelOffsetPx: Vec2;
    }>
  | Readonly<{
      kind: "BODY";
      nodeId: NodeId;
      sourcePointIds: readonly NodeId[];
      initialPointerWorld: Vec2;
      initialSourcePointPositions: ReadonlyMap<NodeId, Vec2>;
    }>;
