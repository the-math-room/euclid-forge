import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { GeometryNode, NodeId } from "../representation/node";
import type {
  ConstructionFactory,
  GeometryConstructionFactories,
} from "./constructionContext";
import type { EvaluationContext } from "./evaluationContext";
import { centroidDefinition } from "./definitions/centroid";
import { circleDefinition } from "./definitions/circle";
import { curveIntersectionDefinition } from "./definitions/curveIntersection";
import { freePointDefinition } from "./definitions/freePoint";
import { lineDefinition } from "./definitions/line";
import { linearConstrainedPointDefinition } from "./definitions/linearConstrainedPoint";
import { midpointDefinition } from "./definitions/midpoint";
import { segmentDefinition } from "./definitions/segment";
import { segmentIntersectionDefinition } from "./definitions/segmentIntersection";
import { triangleDefinition } from "./definitions/triangle";
import {
  eraseGeometryDefinition,
  type AnyGeometryDefinition,
  type GeometryKind,
} from "./geometryDefinition";

const geometryDefinitions = Object.freeze([
  eraseGeometryDefinition(freePointDefinition),
  eraseGeometryDefinition(segmentDefinition),
  eraseGeometryDefinition(lineDefinition),
  eraseGeometryDefinition(circleDefinition),
  eraseGeometryDefinition(triangleDefinition),
  eraseGeometryDefinition(midpointDefinition),
  eraseGeometryDefinition(centroidDefinition),
  eraseGeometryDefinition(segmentIntersectionDefinition),
  eraseGeometryDefinition(curveIntersectionDefinition),
  eraseGeometryDefinition(linearConstrainedPointDefinition),
] satisfies readonly AnyGeometryDefinition[]);

const definitionsByKind: ReadonlyMap<GeometryKind, AnyGeometryDefinition> =
  new Map(
    geometryDefinitions.map((definition) => [definition.kind, definition]),
  );

export function allGeometryDefinitions(): readonly AnyGeometryDefinition[] {
  return geometryDefinitions;
}

export function geometryDefinitionForKind(
  kind: GeometryKind,
): AnyGeometryDefinition {
  return requireAnyGeometryDefinition(kind);
}

export function definitionForGeometryNode(
  node: GeometryNode,
): AnyGeometryDefinition {
  return requireAnyGeometryDefinition(node.kind);
}

export function definitionForEvaluatedGeometry(
  value: EvaluatedGeometry,
): AnyGeometryDefinition {
  return requireAnyGeometryDefinition(value.sourceKind);
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

export function constructionFactoriesForGeometryKind(
  kind: GeometryKind,
): GeometryConstructionFactories | null {
  return requireAnyGeometryDefinition(kind).construction?.factories ?? null;
}

export function constructionFactoryForGeometryKind(
  kind: GeometryKind,
  factory: string,
): ConstructionFactory {
  const constructionFactory =
    constructionFactoriesForGeometryKind(kind)?.[factory];

  if (!constructionFactory) {
    throw new Error(
      `No construction factory registered for ${kind}.${factory}`,
    );
  }

  return constructionFactory;
}

function requireAnyGeometryDefinition(
  kind: GeometryKind,
): AnyGeometryDefinition {
  const definition = definitionsByKind.get(kind);

  if (!definition) {
    throw new Error(`Missing geometry definition for kind: ${kind}`);
  }

  return definition;
}
