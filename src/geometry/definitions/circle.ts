import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const circleDefinition: GeometryDefinition<"CIRCLE"> = Object.freeze({
  kind: "CIRCLE",

  representation: Object.freeze({
    dependencies: (node: NodeByKind<"CIRCLE">) => [node.center, node.through],
  }),
});
