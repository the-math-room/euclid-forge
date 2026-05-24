import type { GeometryDefinition } from "../geometryDefinition";

export const freePointDefinition: GeometryDefinition<"FREE_POINT"> =
  Object.freeze({
    kind: "FREE_POINT",

    representation: Object.freeze({
      dependencies: () => [],
    }),
  });
