import type {
  EvaluatedGeometry,
  EvaluatedPoint,
} from "../../evaluation/evaluated";
import { GeometryEvaluationIssueError } from "../../evaluation/evaluationIssue";
import { segmentIntersection } from "../../meaning/vec2";
import {
  lineIntersectionNode,
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

export const lineIntersectionDefinition: GeometryDefinition<"LINE_INTERSECTION"> =
  Object.freeze({
    kind: "LINE_INTERSECTION",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"LINE_INTERSECTION">) => [
        node.lineA,
        node.lineB,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"LINE_INTERSECTION">,
        context: EvaluationContext,
      ): EvaluatedPoint => {
        const lineA = context.getSegment(node.lineA);
        const lineB = context.getSegment(node.lineB);
        const point = segmentIntersection(lineA.a, lineA.b, lineB.a, lineB.b);

        if (!point) {
          throw new GeometryEvaluationIssueError(
            node.id,
            `Cannot evaluate ${node.id}; segments ${node.lineA} and ${node.lineB} do not have a unique bounded intersection`,
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
            `Expected POINT evaluated value for LINE_INTERSECTION, got ${value.kind}`,
          );
        }

        renderPoint(context.ctx, context.viewport, value, context.options);
      },
    }),

    construction: Object.freeze({
      factories: Object.freeze({
        lineIntersection: (
          { graph }: ConstructionContext,
          lineA: NodeId,
          lineB: NodeId,
        ): readonly GeometryNode[] =>
          lineIntersectionConstructionNodes(graph, lineA, lineB),
      }),
    }),
  });

function lineIntersectionConstructionNodes(
  graph: Readonly<{
    nodes: readonly GeometryNode[];
    byId: ReadonlyMap<NodeId, GeometryNode>;
  }>,
  lineA: NodeId,
  lineB: NodeId,
): readonly GeometryNode[] {
  if (lineA === lineB) {
    throw new Error("Cannot create line intersection from duplicate segments");
  }

  for (const id of [lineA, lineB]) {
    const node = graph.byId.get(id);

    if (!node) {
      throw new Error(`Cannot create line intersection with missing segment: ${id}`);
    }

    if (node.kind !== "SEGMENT") {
      throw new Error(`Cannot create line intersection with non-segment: ${id}`);
    }
  }

  const existing = graph.nodes.find(
    (candidate) =>
      candidate.kind === "LINE_INTERSECTION" &&
      ((candidate.lineA === lineA && candidate.lineB === lineB) ||
        (candidate.lineA === lineB && candidate.lineB === lineA)),
  );

  if (existing) {
    return Object.freeze([]);
  }

  const id = nextLineIntersectionId(graph);

  return Object.freeze([lineIntersectionNode(id, lineA, lineB, id)]);
}

function nextLineIntersectionId(
  graph: Readonly<{ byId: ReadonlyMap<NodeId, GeometryNode> }>,
): NodeId {
  let index = 1;

  while (graph.byId.has(`X${index}`)) {
    index += 1;
  }

  return `X${index}`;
}
