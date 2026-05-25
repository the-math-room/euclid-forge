import type { Vec2 } from "@euclid-forge/core";
import type { NodeId } from "@euclid-forge/core";
import type { FreePointPositionSnapshot } from "./freePointDrag";

export type DragState =
  | Readonly<{
      kind: "FREE_POINT";
      nodeId: NodeId;
    }>
  | Readonly<{
      kind: "BODY";
      nodeId: NodeId;
      sourcePointIds: readonly NodeId[];
      initialPointerWorld: Vec2;
      initialSourcePointPositions: FreePointPositionSnapshot;
    }>;
