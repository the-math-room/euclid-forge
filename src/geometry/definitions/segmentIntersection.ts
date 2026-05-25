import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import { segmentIntersection } from "../../meaning/vec2";
import {
  segmentIntersectionNode,
  type GeometryNode,
  type NodeId,
} from "../../representation/node";
import { renderPoint } from "../../rendering/pointRenderer";
import type { ConstructionContext } from "../constructionContext";
import type { EvaluationContext } from "../evaluationContext";
import type {
  GeometryDefinition,
  NodeByKind,
} from "../geometryDefinition";
import { hitPointValue } from "../hitGeometry";
import type {
  GeometryHitCandidate,
  GeometryHitContext,
} from "../interactionContext";
import type { GeometryRenderContext } from "../renderingContext";

export const segmentIntersectionDefinition: GeometryDefinition<"SEGMENT_INTERSECTION"> =
  Object.freeze({
    kind: "SEGMENT_INTERSECTION",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"SEGMENT_INTERSECTION">) => [
        node.segmentA,
        node.segmentB,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"SEGMENT_INTERSECTION">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const segmentA = context.getSegment(node.segmentA);
        const segmentB = context.getSegment(node.segmentB);
        const point = segmentIntersection(segmentA.a, segmentA.b, segmentB.a, segmentB.b);

        if (!point) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; segments ${node.segmentA} and ${node.segmentB} do not have a unique bounded intersection`,
            "NO_UNIQUE_INTERSECTION",
          );
        }

        return {
          kind: "POINT",
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          point,
          label: node.label,
          role: "INTERSECTION",
        };
      },
    }),

    interaction: Object.freeze({
      hitClass: "POINT",
      hitTest: (
        value: EvaluatedGeometry,
        context: GeometryHitContext,
      ): GeometryHitCandidate | null => {
        if (value.kind !== "POINT") {
          return null;
        }

        const target = hitPointValue(value, context);

        return target
          ? {
              hitClass: "POINT",
              target,
            }
          : null;
      },
    }),

    rendering: Object.freeze({
      layer: "POINT",
      render: (
        value: EvaluatedGeometry,
        context: GeometryRenderContext,
      ): void => {
        if (value.kind !== "POINT") {
          throw new Error(
            `Expected POINT evaluated value for SEGMENT_INTERSECTION, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),

    construction: Object.freeze({
      factories: Object.freeze({
        segmentIntersection: (
          { graph }: ConstructionContext,
          segmentA: NodeId,
          segmentB: NodeId,
        ): readonly GeometryNode[] =>
          segmentIntersectionConstructionNodes(graph, segmentA, segmentB),
      }),
    }),
  });

function segmentIntersectionConstructionNodes(
  graph: Readonly<{
    nodes: readonly GeometryNode[];
    byId: ReadonlyMap<NodeId, GeometryNode>;
  }>,
  segmentA: NodeId,
  segmentB: NodeId,
): readonly GeometryNode[] {
  if (segmentA === segmentB) {
    throw new Error("Cannot create segment intersection from duplicate segments");
  }

  for (const id of [segmentA, segmentB]) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create segment intersection with missing segment: ${id}`);
    }

    if (node.kind !== "SEGMENT") {
      throw new Error(`Cannot create segment intersection with non-segment: ${id}`);
    }
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "SEGMENT_INTERSECTION" &&
      ((candidate.segmentA === segmentA && candidate.segmentB === segmentB) ||
        (candidate.segmentA === segmentB && candidate.segmentB === segmentA)),
  );

  if (existing) {
    return Object.freeze([]);
  }

  const id = nextSegmentIntersectionId(graph);

  return Object.freeze([segmentIntersectionNode(id, segmentA, segmentB, id)]);
}

function nextSegmentIntersectionId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`X${index}`)) {
    index += 1;
  }

  return `X${index}`;
}
