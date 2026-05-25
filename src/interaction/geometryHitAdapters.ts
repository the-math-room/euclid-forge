import type { EvaluatedGeometry } from "../evaluation/evaluated";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import {
  definitionForEvaluatedGeometry,
  definitionForGeometryNode,
} from "../geometry/geometryRegistry";
import type {
  GeometryBodyDrag,
  GeometryHitCandidate,
  GeometryHitContext,
} from "../geometry/interactionContext";

export function hitGeometryValue(
  value: EvaluatedGeometry,
  context: GeometryHitContext,
): GeometryHitCandidate | null {
  const interaction = definitionForEvaluatedGeometry(value).interaction;

  if (!interaction) {
    return null;
  }

  return interaction.hitTest(value, context);
}

export function bodyDragForGeometryNode(
  graph: Graph,
  nodeId: NodeId,
): GeometryBodyDrag | null {
  const node = graph.byId.get(nodeId);

  if (!node) {
    return null;
  }

  const bodyDrag = definitionForGeometryNode(node).interaction?.bodyDrag;

  if (!bodyDrag) {
    return null;
  }

  const sourcePointIds = bodyDrag.sourcePointIds(
    node,
    Object.freeze({
      areFreePoints: (ids: readonly NodeId[]): boolean =>
        ids.every((id) => graph.byId.get(id)?.kind === "FREE_POINT"),
    }),
  );

  if (!sourcePointIds) {
    return null;
  }

  return Object.freeze({ sourcePointIds });
}
