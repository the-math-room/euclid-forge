import type { GeometryNode, NodeId } from "../representation/node";
import type {
  AnyGeometryDefinition,
  GeometryDefinition,
  GeometryKind,
} from "./geometryDefinition";
import { eraseGeometryDefinition } from "./geometryDefinition";
import { centroidDefinition } from "./definitions/centroid";
import { circleDefinition } from "./definitions/circle";
import { freePointDefinition } from "./definitions/freePoint";
import { midpointDefinition } from "./definitions/midpoint";
import { segmentDefinition } from "./definitions/segment";
import { triangleDefinition } from "./definitions/triangle";

const geometryDefinitions = Object.freeze([
  eraseGeometryDefinition(freePointDefinition),
  eraseGeometryDefinition(segmentDefinition),
  eraseGeometryDefinition(circleDefinition),
  eraseGeometryDefinition(triangleDefinition),
  eraseGeometryDefinition(midpointDefinition),
  eraseGeometryDefinition(centroidDefinition),
] satisfies readonly AnyGeometryDefinition[]);

const geometryDefinitionsByKind: ReadonlyMap<GeometryKind, AnyGeometryDefinition> =
  new Map(geometryDefinitions.map((definition) => [definition.kind, definition]));

export function geometryDefinitionForKind<K extends GeometryKind>(
  kind: K,
): GeometryDefinition<K> {
  const definition = geometryDefinitionsByKind.get(kind);

  if (!definition) {
    throw new Error(`Missing geometry definition for kind: ${kind}`);
  }

  return definition as unknown as GeometryDefinition<K>;
}

export function dependenciesForGeometryNode(
  node: GeometryNode,
): readonly NodeId[] {
  return requireAnyGeometryDefinition(node.kind).representation.dependencies(node);
}

export function evaluateGeometryNode(
  node: GeometryNode,
  context: import("./evaluationContext").EvaluationContext,
): import("../evaluation/evaluated").EvaluatedGeometry {
  return requireAnyGeometryDefinition(node.kind).evaluation.evaluate(node, context);
}

function requireAnyGeometryDefinition(kind: GeometryKind): AnyGeometryDefinition {
  const definition = geometryDefinitionsByKind.get(kind);

  if (!definition) {
    throw new Error(`Missing geometry definition for kind: ${kind}`);
  }

  return definition;
}


export function renderGeometryValue(
  value: import("../evaluation/evaluated").EvaluatedGeometry,
  context: import("./renderingContext").GeometryRenderContext,
): void {
  const definition = requireAnyGeometryDefinition(
    evaluatedValueToGeometryKind(value),
  );

  if (!definition.rendering) {
    throw new Error(`Missing renderer for evaluated kind: ${value.kind}`);
  }

  definition.rendering.render(value, context);
}

function evaluatedValueToGeometryKind(
  value: import("../evaluation/evaluated").EvaluatedGeometry,
): GeometryKind {
  switch (value.kind) {
    case "POINT":
      switch (value.role) {
        case "FREE":
          return "FREE_POINT";

        case "MIDPOINT":
          return "MIDPOINT";

        case "CENTROID":
          return "CENTROID";
      }

    case "SEGMENT":
      return "SEGMENT";

    case "CIRCLE":
      return "CIRCLE";

    case "TRIANGLE":
      return "TRIANGLE";
  }
}
