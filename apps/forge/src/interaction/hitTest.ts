import {
  isEvaluatedGeometry,
  type EvaluatedGeometry,
} from "@euclid-forge/core/evaluation/evaluated";
import type { EvaluatedScene } from "@euclid-forge/core";
import {
  bodyDragForGeometryNode,
  hitGeometryValue,
} from "./geometryHitAdapters";
import type {
  CircleHit,
  GeometryHitCandidate,
  GeometryHitClass,
  HitTarget,
  PointHit,
  SegmentHit,
  TriangleHitTarget,
} from "./geometryInteractionContext";
import type { Graph } from "@euclid-forge/core";
import type { NodeId } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";

export type { CircleHit, HitTarget, PointHit, SegmentHit, TriangleHitTarget };

export type TriangleSelectionHit = Readonly<{
  id: NodeId;
}>;

export type TriangleInteriorHit = Readonly<{
  id: NodeId;
  vertexIds: readonly [NodeId, NodeId, NodeId];
}>;

export type AreaBodyDragHit = Readonly<{
  id: NodeId;
  sourcePointIds: readonly NodeId[];
}>;

export function hitTestTargetByClass(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  hitClass: GeometryHitClass,
): HitTarget | null {
  return (
    bestHitForClass(evaluated, viewport, screenPoint, hitClass)?.target ?? null
  );
}

export function hitTestSelectionTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): HitTarget | null {
  return (
    hitTestTargetByClass(evaluated, viewport, screenPoint, "POINT") ??
    hitTestTargetByClass(evaluated, viewport, screenPoint, "LINEAR") ??
    hitTestTargetByClass(evaluated, viewport, screenPoint, "AREA")
  );
}

export function hitTestDraggableAreaBody(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): AreaBodyDragHit | null {
  let best: Readonly<{
    value: EvaluatedGeometry;
    target: HitTarget;
    sourcePointIds: readonly NodeId[];
  }> | null = null;

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (!isEvaluatedGeometry(value)) {
      continue;
    }

    const candidate = hitGeometryValue(value, {
      viewport,
      screenPoint,
    });

    if (!candidate || candidate.hitClass !== "AREA") {
      continue;
    }

    const bodyDrag = bodyDragForGeometryNode(graph, candidate.target.id);

    if (!bodyDrag) {
      continue;
    }

    if (
      !best ||
      isBetterHit(value, candidate.target, best.value, best.target)
    ) {
      best = {
        value,
        target: candidate.target,
        sourcePointIds: bodyDrag.sourcePointIds,
      };
    }
  }

  return best
    ? {
        id: best.target.id,
        sourcePointIds: best.sourcePointIds,
      }
    : null;
}

export function hitTestPointTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): PointHit | null {
  const hit = hitTestTargetByClass(evaluated, viewport, screenPoint, "POINT");

  return hit?.kind === "POINT" ? hit : null;
}

export function hitTestPoint(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): NodeId | null {
  return hitTestPointTarget(evaluated, viewport, screenPoint)?.id ?? null;
}

export function hitTestFreePointTarget(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): PointHit | null {
  const hit = bestHitForClass(
    evaluated,
    viewport,
    screenPoint,
    "POINT",
    (value) => value.kind === "POINT" && isFreePoint(graph, value.id),
  )?.target;

  return hit?.kind === "POINT" ? hit : null;
}

export function hitTestFreePoint(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): NodeId | null {
  return (
    hitTestFreePointTarget(graph, evaluated, viewport, screenPoint)?.id ?? null
  );
}

export function hitTestDraggablePointTarget(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): PointHit | null {
  const hit = bestHitForClass(
    evaluated,
    viewport,
    screenPoint,
    "POINT",
    (value) => value.kind === "POINT" && isDraggablePoint(graph, value.id),
  )?.target;

  return hit?.kind === "POINT" ? hit : null;
}

export function hitTestSegmentTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): SegmentHit | null {
  const hit = hitTestTargetByClass(evaluated, viewport, screenPoint, "LINEAR");

  return hit?.kind === "SEGMENT" ? hit : null;
}

export function hitTestSegmentSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): NodeId | null {
  return hitTestSegmentTarget(evaluated, viewport, screenPoint)?.id ?? null;
}

export function hitTestCircleTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): CircleHit | null {
  const hit = bestHitForClass(
    evaluated,
    viewport,
    screenPoint,
    "AREA",
    (value) => value.kind === "CIRCLE",
  )?.target;

  return hit?.kind === "CIRCLE" ? hit : null;
}

export function hitTestCircleSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): NodeId | null {
  return hitTestCircleTarget(evaluated, viewport, screenPoint)?.id ?? null;
}

export function hitTestTriangleTarget(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleHitTarget | null {
  const hit = bestHitForClass(
    evaluated,
    viewport,
    screenPoint,
    "AREA",
    (value) => value.kind === "TRIANGLE",
  )?.target;

  return hit?.kind === "TRIANGLE" ? hit : null;
}

export function hitTestTriangleSelection(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleSelectionHit | null {
  const hit = hitTestTriangleTarget(evaluated, viewport, screenPoint);

  return hit ? { id: hit.id } : null;
}

export function hitTestTriangleInterior(
  graph: Graph,
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
): TriangleInteriorHit | null {
  const hit = bestHitForClass(
    evaluated,
    viewport,
    screenPoint,
    "AREA",
    (value) =>
      value.kind === "TRIANGLE" && isBodyDraggableTriangle(graph, value.id),
  )?.target;

  if (hit?.kind !== "TRIANGLE") {
    return null;
  }

  const node = graph.byId.get(hit.id);

  if (node?.kind !== "TRIANGLE") {
    return null;
  }

  return {
    id: hit.id,
    vertexIds: [node.a, node.b, node.c],
  };
}

function bestHitForClass(
  evaluated: EvaluatedScene,
  viewport: Viewport,
  screenPoint: ScreenPoint,
  hitClass: GeometryHitClass,
  includeValue: (value: EvaluatedGeometry) => boolean = () => true,
): GeometryHitCandidate | null {
  let best: Readonly<{
    value: EvaluatedGeometry;
    candidate: GeometryHitCandidate;
  }> | null = null;

  for (const value of reverseVisualOrder(evaluated.ordered)) {
    if (!isEvaluatedGeometry(value) || !includeValue(value)) {
      continue;
    }

    const candidate = hitGeometryValue(value, {
      viewport,
      screenPoint,
    });

    if (!candidate || candidate.hitClass !== hitClass) {
      continue;
    }

    if (
      !best ||
      isBetterHit(value, candidate.target, best.value, best.candidate.target)
    ) {
      best = {
        value,
        candidate,
      };
    }
  }

  return best?.candidate ?? null;
}

function isBetterHit(
  candidateValue: EvaluatedGeometry,
  candidate: HitTarget,
  currentValue: EvaluatedGeometry,
  current: HitTarget,
): boolean {
  const candidateZIndex = zIndexOf(candidateValue);
  const currentZIndex = zIndexOf(currentValue);

  if (candidateZIndex !== currentZIndex) {
    return candidateZIndex > currentZIndex;
  }

  if ("distancePx" in candidate && "distancePx" in current) {
    return candidate.distancePx < current.distancePx;
  }

  return false;
}

function zIndexOf(value: EvaluatedGeometry): number {
  return value.zIndex ?? 0;
}

function reverseVisualOrder<T>(values: readonly T[]): readonly T[] {
  return [...values].reverse();
}

function isFreePoint(graph: Graph, id: NodeId): boolean {
  return graph.byId.get(id)?.kind === "FREE_POINT";
}

function isDraggablePoint(graph: Graph, id: NodeId): boolean {
  const node = graph.byId.get(id);

  return node?.kind === "FREE_POINT" || node?.kind === "LINEAR_CONSTRAINED_POINT";
}

function isBodyDraggableTriangle(graph: Graph, id: NodeId): boolean {
  const node = graph.byId.get(id);

  if (node?.kind !== "TRIANGLE") {
    return false;
  }

  return (
    graph.byId.get(node.a)?.kind === "FREE_POINT" &&
    graph.byId.get(node.b)?.kind === "FREE_POINT" &&
    graph.byId.get(node.c)?.kind === "FREE_POINT"
  );
}
