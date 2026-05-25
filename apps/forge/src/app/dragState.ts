import type { NodeId, Vec2 } from "@euclid-forge/core";

export type DragState =
  | Readonly<{
      kind: "VIEWPORT";
      initialPointerScreen: Vec2;
      initialViewportCenter: Vec2;
      initialViewportZoom: number;
      initialViewportRotation: number;
    }>
  | Readonly<{
      kind: "FREE_POINT";
      nodeId: NodeId;
    }>
  | Readonly<{
      kind: "BODY";
      nodeId: NodeId;
      sourcePointIds: readonly NodeId[];
      initialPointerWorld: Vec2;
      initialSourcePointPositions: ReadonlyMap<NodeId, Vec2>;
    }>;
