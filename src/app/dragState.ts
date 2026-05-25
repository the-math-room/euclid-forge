import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";
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
