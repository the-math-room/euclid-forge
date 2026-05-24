import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const centroidDefinition: GeometryDefinition<"CENTROID"> =
  Object.freeze({
    kind: "CENTROID",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"CENTROID">) => [node.triangle],
    }),
  });
