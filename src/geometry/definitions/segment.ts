import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const segmentDefinition: GeometryDefinition<"SEGMENT"> = Object.freeze({
  kind: "SEGMENT",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"SEGMENT">) => [node.a, node.b],
  }),
});
