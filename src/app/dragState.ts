import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";

export type DragState =
  | Readonly<{
      kind: "FREE_POINT";
      nodeId: NodeId;
    }>
  | Readonly<{
      kind: "TRIANGLE";
      vertexIds: readonly NodeId[];
      initialPointerWorld: Vec2;
      initialVertexPositions: ReadonlyMap<NodeId, Vec2>;
    }>;
