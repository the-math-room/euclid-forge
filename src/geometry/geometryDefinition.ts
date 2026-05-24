import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { GeometryNode, NodeId } from "../representation/node";
import type { EvaluationContext } from "./evaluationContext";
import type { GeometryRenderContext } from "./renderingContext";

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

  evaluation: Readonly<{
    evaluate: (
      node: NodeByKind<K>,
      context: EvaluationContext,
    ) => EvaluatedGeometry;
  }>;

  rendering?: Readonly<{
    render: (
      value: EvaluatedGeometry,
      context: GeometryRenderContext,
    ) => void;
  }>;
}>;

export type AnyGeometryDefinition = Readonly<{
  kind: GeometryKind;

  representation: Readonly<{
    dependencies: (node: GeometryNode) => readonly NodeId[];
  }>;

  evaluation: Readonly<{
    evaluate: (
      node: GeometryNode,
      context: EvaluationContext,
    ) => EvaluatedGeometry;
  }>;

  rendering?: Readonly<{
    render: (
      value: EvaluatedGeometry,
      context: GeometryRenderContext,
    ) => void;
  }>;
}>;

export function eraseGeometryDefinition<K extends GeometryKind>(
  definition: GeometryDefinition<K>,
): AnyGeometryDefinition {
  return definition as unknown as AnyGeometryDefinition;
}
