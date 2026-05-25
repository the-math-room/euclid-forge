import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { GeometryNode, NodeId } from "../representation/node";
import type { ConstructionFactory } from "./constructionContext";
import type { EvaluationContext } from "./evaluationContext";
import { centroidDefinition } from "./definitions/centroid";
import { circleDefinition } from "./definitions/circle";
import { freePointDefinition } from "./definitions/freePoint";
import { midpointDefinition } from "./definitions/midpoint";
import { segmentDefinition } from "./definitions/segment";
import { triangleDefinition } from "./definitions/triangle";
import type {
  AnyGeometryDefinition,
  GeometryDefinition,
  GeometryKind,
} from "./geometryDefinition";
import { eraseGeometryDefinition } from "./geometryDefinition";
import type {
  GeometryHitCandidate,
  GeometryHitContext,
} from "./interactionContext";
import type {
  GeometryRenderContext,
  GeometryRenderLayer,
} from "./renderingContext";

const geometryDefinitions = Object.freeze([
  eraseGeometryDefinition(freePointDefinition),
  eraseGeometryDefinition(segmentDefinition),
  eraseGeometryDefinition(circleDefinition),
  eraseGeometryDefinition(triangleDefinition),
  eraseGeometryDefinition(midpointDefinition),
  eraseGeometryDefinition(centroidDefinition),
] satisfies readonly AnyGeometryDefinition[]);

const geometryDefinitionsByKind: ReadonlyMap<
  GeometryKind,
  AnyGeometryDefinition
> = new Map(
  geometryDefinitions.map((definition) => [definition.kind, definition]),
);

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
  return requireAnyGeometryDefinition(node.kind).representation.dependencies(
    node,
  );
}

export function evaluateGeometryNode(
  node: GeometryNode,
  context: EvaluationContext,
): EvaluatedGeometry {
  return requireAnyGeometryDefinition(node.kind).evaluation.evaluate(
    node,
    context,
  );
}

export function renderGeometryValue(
  value: EvaluatedGeometry,
  context: GeometryRenderContext,
): void {
  const definition = requireAnyGeometryDefinition(
    evaluatedValueToGeometryKind(value),
  );

  if (!definition.rendering) {
    throw new Error(`Missing renderer for evaluated kind: ${value.kind}`);
  }

  definition.rendering.render(value, context);
}

export function renderLayerForGeometryValue(
  value: EvaluatedGeometry,
): GeometryRenderLayer {
  const definition = requireAnyGeometryDefinition(
    evaluatedValueToGeometryKind(value),
  );

  if (!definition.rendering) {
    throw new Error(`Missing renderer for evaluated kind: ${value.kind}`);
  }

  return definition.rendering.layer;
}

export function hitGeometryValue(
  value: EvaluatedGeometry,
  context: GeometryHitContext,
): GeometryHitCandidate | null {
  const definition = requireAnyGeometryDefinition(
    evaluatedValueToGeometryKind(value),
  );

  return definition.interaction?.hitTest(value, context) ?? null;
}

export function constructionFactoryForGeometryKind(
  kind: GeometryKind,
  name: string,
): ConstructionFactory {
  const definition = requireAnyGeometryDefinition(kind);
  const factory = definition.construction?.factories[name];

  if (!factory) {
    throw new Error(`Missing ${name} construction factory for kind: ${kind}`);
  }

  return factory;
}

function requireAnyGeometryDefinition(kind: GeometryKind): AnyGeometryDefinition {
  const definition = geometryDefinitionsByKind.get(kind);

  if (!definition) {
    throw new Error(`Missing geometry definition for kind: ${kind}`);
  }

  return definition;
}

function evaluatedValueToGeometryKind(value: EvaluatedGeometry): GeometryKind {
  return value.sourceKind;
}
