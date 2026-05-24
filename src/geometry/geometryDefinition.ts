import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { GeometryNode, NodeId } from "../representation/node";
import type { GeometryConstructionFactories } from "./constructionContext";
import type { EvaluationContext } from "./evaluationContext";
import type {
  GeometryHitCandidate,
  GeometryHitClass,
  GeometryHitContext,
} from "./interactionContext";
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

  interaction?: Readonly<{
    hitClass: GeometryHitClass;
    hitTest: (
      value: EvaluatedGeometry,
      context: GeometryHitContext,
    ) => GeometryHitCandidate | null;
  }>;

  construction?: Readonly<{
    factories: GeometryConstructionFactories;
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

  interaction?: Readonly<{
    hitClass: GeometryHitClass;
    hitTest: (
      value: EvaluatedGeometry,
      context: GeometryHitContext,
    ) => GeometryHitCandidate | null;
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
