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
  const definition = geometryDefinitionsByKind.get(node.kind);

  if (!definition) {
    throw new Error(`Missing geometry definition for kind: ${node.kind}`);
  }

  return definition.representation.dependencies(node);
}
