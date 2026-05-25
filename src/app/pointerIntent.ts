import { evaluateGraph } from "../evaluation/evaluateGraph";
import { visibleEvaluatedScene } from "../evaluation/visibleScene";
import {
  hitTestDraggableAreaBody,
  hitTestFreePointTarget,
  hitTestSelectionTarget,
} from "../interaction/hitTest";
import type { Vec2 } from "../meaning/vec2";
import type { NodeId } from "../representation/node";
import type { PointerInput } from "./appController";
import type { AppState } from "./appState";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import { screenToWorld } from "../core/viewport";

export type PointerDownIntent =
  | Readonly<{
      kind: "SELECT_NODE";
      id: NodeId;
    }>
  | Readonly<{
      kind: "DRAG_FREE_POINT";
      id: NodeId;
    }>
  | Readonly<{
      kind: "DRAG_BODY";
      id: NodeId;
      sourcePointIds: readonly NodeId[];
    }>
  | Readonly<{
      kind: "ADD_FREE_POINT";
      point: Vec2;
    }>
  | Readonly<{
      kind: "NONE";
    }>;

export type HoverIntent =
  | Readonly<{
      kind: "HOVER_NODE";
      id: NodeId;
    }>
  | Readonly<{
      kind: "NONE";
    }>;

export function pointerDownIntent(
  state: AppState,
  input: PointerInput,
): PointerDownIntent {
  const evaluated = visibleEvaluatedSceneForInteraction(state);

  if (input.shiftKey) {
    const hit = hitTestSelectionTarget(evaluated, input.viewport, input.point);

    if (hit) {
      return {
        kind: "SELECT_NODE",
        id: hit.id,
      };
    }

    return {
      kind: "NONE",
    };
  }

  const freePointHit = hitTestFreePointTarget(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (freePointHit) {
    return {
      kind: "DRAG_FREE_POINT",
      id: freePointHit.id,
    };
  }

  const bodyHit = hitTestDraggableAreaBody(
    state.graph,
    evaluated,
    input.viewport,
    input.point,
  );

  if (bodyHit) {
    return {
      kind: "DRAG_BODY",
      id: bodyHit.id,
      sourcePointIds: bodyHit.sourcePointIds,
    };
  }

  return {
    kind: "ADD_FREE_POINT",
    point: screenToWorld(input.viewport, input.point),
  };
}

export function hoverIntent(
  state: AppState,
  input: PointerInput,
): HoverIntent {
  const intent = pointerDownIntent(state, input);

  switch (intent.kind) {
    case "SELECT_NODE":
      return {
        kind: "HOVER_NODE",
        id: intent.id,
      };

    case "DRAG_FREE_POINT":
      return {
        kind: "HOVER_NODE",
        id: intent.id,
      };

    case "DRAG_BODY":
      return {
        kind: "HOVER_NODE",
        id: intent.id,
      };

    case "ADD_FREE_POINT":
    case "NONE":
      return {
        kind: "NONE",
      };
  }
}

function visibleEvaluatedSceneForInteraction(state: AppState) {
  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);

  return visibleEvaluatedScene(
    evaluateGraph(state.graph),
    hiddenNodeIds.size > 0
      ? {
          hiddenNodeIds,
        }
      : {},
  );
}
