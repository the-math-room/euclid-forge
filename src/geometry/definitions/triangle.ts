import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const triangleDefinition: GeometryDefinition<"TRIANGLE"> =
  Object.freeze({
    kind: "TRIANGLE",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"TRIANGLE">) => [node.a, node.b, node.c],
    }),
  });
