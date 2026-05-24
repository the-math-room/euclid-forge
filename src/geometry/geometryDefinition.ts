import type { GeometryNode, NodeId } from "../representation/node";

export type GeometryKind = GeometryNode["kind"];

export type NodeByKind<K extends GeometryKind> = Extract<
  GeometryNode,
  { kind: K }
>;

export type GeometryDefinition<K extends GeometryKind> = Readonly<{
  kind: K;

  representation: Readonly<{
    dependencies: (node: NodeByKind<K>) => readonly NodeId[];
  }>;
}>;

export type AnyGeometryDefinition = Readonly<{
  kind: GeometryKind;

  representation: Readonly<{
    dependencies: (node: GeometryNode) => readonly NodeId[];
  }>;
}>;

export function eraseGeometryDefinition<K extends GeometryKind>(
  definition: GeometryDefinition<K>,
): AnyGeometryDefinition {
  return definition as unknown as AnyGeometryDefinition;
}
