import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const midpointDefinition: GeometryDefinition<"MIDPOINT"> =
  Object.freeze({
    kind: "MIDPOINT",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"MIDPOINT">) => [node.segment],
    }),
  });
