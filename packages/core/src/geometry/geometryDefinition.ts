import type { EvaluatedSceneItem } from "../evaluation/evaluated";
import type { GeometryNode, GraphNode, NodeId } from "../representation/node";
import type { GeometryConstructionFactories } from "./constructionContext";
import type { EvaluationContext } from "./evaluationContext";

export type GeometryKind = GraphNode["kind"];

export type NodeByKind<K extends GeometryKind> = Extract<
  GraphNode,
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
    ) => EvaluatedSceneItem;
  }>;

  construction?: Readonly<{
    factories: GeometryConstructionFactories;
  }>;
}>;

export type AnyGeometryDefinition = Readonly<{
  kind: GeometryKind;

  representation: Readonly<{
    dependencies: (node: GraphNode) => readonly NodeId[];
  }>;

  evaluation: Readonly<{
    evaluate: (
      node: GraphNode,
      context: EvaluationContext,
    ) => EvaluatedSceneItem;
  }>;

  construction?: Readonly<{
    factories: GeometryConstructionFactories;
  }>;
}>;

export function eraseGeometryDefinition<K extends GeometryKind>(
  definition: GeometryDefinition<K>,
): AnyGeometryDefinition {
  return definition as unknown as AnyGeometryDefinition;
}
