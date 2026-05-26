import { deltaBetween } from "@euclid-forge/core";
import { applyGraphEdit } from "@euclid-forge/core";
import type { NodeId, ScreenPoint } from "@euclid-forge/core";
import type { Viewport } from "@euclid-forge/core";
import { evaluateGraph, visibleEvaluatedScene } from "@euclid-forge/core";
import { screenToWorld } from "@euclid-forge/core";
import { appCommandDisabledReason, appCommandForKey } from "./commands";
import { handleActiveToolPointerDown } from "./activeToolPointer";
import { changed, preventOnly, transition, unchanged } from "./appTransition";
import type { AppTransition } from "./appTransition";
import { hoverIntent, pointerDownIntent } from "./pointerIntent";
import { appState } from "./appState";
import type { AppState } from "./appState";
import { viewportCenterForDrag } from "./viewportDrag";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import { lassoSelectableNodeIds } from "./lassoSelection";

import {
  clearSelection,
  setHoveredNode,
  toggleSelectedNode,
} from "./viewState";
import {
  initialFreePointPositions,
  translatedFreePointPositions,
} from "./freePointDrag";

export type KeyInput = Readonly<{
  key: string;
  shiftKey?: boolean;
}>;

export type PointerInput = Readonly<{
  pointerId: number;
  point: ScreenPoint;
  viewport: Viewport;
  shiftKey: boolean;
}>;

const MIN_LASSO_POINTS = 3;
const MIN_LASSO_DISTANCE_PX = 6;
const LASSO_POINT_SPACING_PX = 2;

export function handleKeyDown(state: AppState, input: KeyInput): AppTransition {
  const command = appCommandForKey(input.key, {
    shiftKey: input.shiftKey ?? false,
  });

  if (!command) {
    return unchanged(state);
  }

  const disabledReason = appCommandDisabledReason(command, state);

  if (disabledReason !== null) {
    return disabledReason
      ? changed(state, "ignore", disabledReason)
      : unchanged(state);
  }

  const result = command.run(state);

  return changed(result.state, result.history, result.statusMessage);
}

export function handlePointerDown(
  state: AppState,
  input: PointerInput,
): AppTransition {
  const viewState = setHoveredNode(state.viewState, null);

  if (state.activeTool.kind !== "select") {
    return handleActiveToolPointerDown(
      appState(state.graph, viewState, state.dragState, state.activeTool),
      input,
    );
  }

  const intent = pointerDownIntent(
    appState(state.graph, viewState, state.dragState, state.activeTool),
    input,
  );

  switch (intent.kind) {
    case "SELECT_NODE":
      return changed(
        appState(state.graph, toggleSelectedNode(viewState, intent.id), null),
        "commit",
      );

    case "DRAG_FREE_POINT":
      return transition({
        state: appState(state.graph, viewState, {
          kind: "FREE_POINT",
          nodeId: intent.id,
        }),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });

    case "DRAG_LABEL": {
      const node = state.graph.byId.get(intent.id);
      const initialLabelOffsetPx =
        node && "labelOffsetPx" in node && node.labelOffsetPx
          ? node.labelOffsetPx
          : { x: 0, y: 0 };

      return transition({
        state: appState(state.graph, viewState, {
          kind: "LABEL",
          nodeId: intent.id,
          initialPointerScreen: input.point,
          initialLabelOffsetPx,
        }),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });
    }

    case "DRAG_BODY":
      return transition({
        state: appState(state.graph, viewState, {
          kind: "BODY",
          nodeId: intent.id,
          sourcePointIds: intent.sourcePointIds,
          initialPointerWorld: screenToWorld(input.viewport, input.point),
          initialSourcePointPositions: initialFreePointPositions(
            state.graph,
            intent.sourcePointIds,
            "body drag",
          ),
        }),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });

    case "ADD_FREE_POINT":
      return transition({
        state: appState(
          state.graph,
          clearSelection(viewState),
          {
            kind: "VIEWPORT",
            initialPointerScreen: input.point,
            initialViewportCenter: viewState.viewportCenter,
            initialViewportZoom: viewState.viewportZoom,
            initialViewportRotation: viewState.viewportRotation,
          },
          state.activeTool,
        ),
        shouldRender: false,
        shouldPreventDefault: true,
        effects: [
          {
            kind: "SET_POINTER_CAPTURE",
            pointerId: input.pointerId,
          },
        ],
      });

    case "NONE":
      if (input.shiftKey) {
        return transition({
          state: appState(
            state.graph,
            viewState,
            {
              kind: "LASSO",
              points: [input.point],
              viewport: input.viewport,
            },
            state.activeTool,
          ),
          shouldRender: false,
          shouldPreventDefault: true,
          effects: [
            {
              kind: "SET_POINTER_CAPTURE",
              pointerId: input.pointerId,
            },
          ],
        });
      }

      return preventOnly(
        appState(state.graph, viewState, null, state.activeTool),
      );
  }
}

export function handlePointerMove(
  state: AppState,
  input: PointerInput,
): AppTransition {
  if (!state.dragState) {
    const hoveredNodeId = hitTestHoverTarget(state, input);
    const viewState = setHoveredNode(state.viewState, hoveredNodeId);

    if (viewState === state.viewState) {
      return unchanged(state);
    }

    return changed(appState(state.graph, viewState, null, state.activeTool));
  }

  const world = screenToWorld(input.viewport, input.point);
  const viewState = setHoveredNode(state.viewState, null);

  switch (state.dragState.kind) {
    case "VIEWPORT": {
      const nextViewState = {
        ...viewState,
        viewportCenter: viewportCenterForDrag(state.dragState, input.point),
      };

      return changed(
        appState(state.graph, nextViewState, state.dragState, state.activeTool),
      );
    }

    case "LASSO": {
      const points = appendLassoPoint(state.dragState.points, input.point);

      if (points === state.dragState.points && viewState === state.viewState) {
        return unchanged(state);
      }

      return changed(
        appState(
          state.graph,
          viewState,
          {
            kind: "LASSO",
            points,
            viewport: state.dragState.viewport,
          },
          state.activeTool,
        ),
      );
    }

    case "FREE_POINT": {
      const node = state.graph.byId.get(state.dragState.nodeId);
      const edit =
        node?.kind === "LINEAR_CONSTRAINED_POINT"
          ? {
              kind: "MOVE_CONSTRAINED_POINT" as const,
              id: state.dragState.nodeId,
              point: world,
            }
          : {
              kind: "MOVE_FREE_POINT" as const,
              id: state.dragState.nodeId,
              point: world,
            };

      return changed(
        appState(
          applyGraphEdit(state.graph, edit),
          viewState,
          state.dragState,
          state.activeTool,
        ),
      );
    }

    case "LABEL": {
      const delta = deltaBetween(
        state.dragState.initialPointerScreen,
        input.point,
      );

      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_POINT_LABEL_OFFSET",
            id: state.dragState.nodeId,
            offsetPx: {
              x: state.dragState.initialLabelOffsetPx.x + delta.x,
              y: state.dragState.initialLabelOffsetPx.y + delta.y,
            },
          }),
          viewState,
          state.dragState,
          state.activeTool,
        ),
      );
    }

    case "BODY": {
      const delta = deltaBetween(state.dragState.initialPointerWorld, world);

      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_FREE_POINT_POSITIONS",
            positions: translatedFreePointPositions(
              state.dragState.initialSourcePointPositions,
              delta,
            ),
          }),
          viewState,
          state.dragState,
          state.activeTool,
        ),
      );
    }
  }
}

export function handlePointerLeave(state: AppState): AppTransition {
  const viewState = setHoveredNode(state.viewState, null);

  if (viewState === state.viewState) {
    return unchanged(state);
  }

  return changed(
    appState(state.graph, viewState, state.dragState, state.activeTool),
  );
}

export function handlePointerUp(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (!state.dragState) {
    return unchanged(state);
  }

  if (state.dragState.kind === "LASSO") {
    return completeLassoSelection(state, pointerId);
  }

  return transition({
    state: appState(state.graph, state.viewState, null, state.activeTool),
    shouldRender: false,
    shouldPreventDefault: true,
    history: "commit",
    effects: [
      {
        kind: "RELEASE_POINTER_CAPTURE",
        pointerId,
      },
    ],
  });
}

export function handlePointerCancel(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (state.dragState?.kind === "LASSO") {
    return transition({
      state: appState(state.graph, state.viewState, null, state.activeTool),
      shouldRender: true,
      shouldPreventDefault: true,
      effects: [
        {
          kind: "RELEASE_POINTER_CAPTURE",
          pointerId,
        },
      ],
    });
  }

  return handlePointerUp(state, pointerId);
}

function completeLassoSelection(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (state.dragState?.kind !== "LASSO") {
    return unchanged(state);
  }

  const polygon = state.dragState.points;

  if (!isUsableLasso(polygon)) {
    return transition({
      state: appState(state.graph, state.viewState, null, state.activeTool),
      shouldRender: true,
      shouldPreventDefault: true,
      effects: [
        {
          kind: "RELEASE_POINTER_CAPTURE",
          pointerId,
        },
      ],
    });
  }

  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);
  const evaluated = visibleEvaluatedScene(
    evaluateGraph(state.graph),
    hiddenNodeIds.size > 0 ? { hiddenNodeIds } : {},
  );
  const selectedNodeIds = new Set(
    lassoSelectableNodeIds({
      evaluated,
      viewport: state.dragState.viewport,
      polygon,
    }),
  );

  const nextViewState = {
    ...state.viewState,
    hoveredNodeId: null,
    selectedNodeIds,
  };

  return transition({
    state: appState(state.graph, nextViewState, null, state.activeTool),
    shouldRender: true,
    shouldPreventDefault: true,
    history: selectedSetsEqual(state.viewState.selectedNodeIds, selectedNodeIds)
      ? "ignore"
      : "commit",
    effects: [
      {
        kind: "RELEASE_POINTER_CAPTURE",
        pointerId,
      },
    ],
  });
}

function hitTestHoverTarget(
  state: AppState,
  input: PointerInput,
): NodeId | null {
  const intent = hoverIntent(state, input);

  switch (intent.kind) {
    case "HOVER_NODE":
      return intent.id;

    case "NONE":
      return null;
  }
}

function appendLassoPoint(
  points: readonly ScreenPoint[],
  point: ScreenPoint,
): readonly ScreenPoint[] {
  const last = points.at(-1);

  if (last && distance(last, point) < LASSO_POINT_SPACING_PX) {
    return points;
  }

  return Object.freeze([...points, point]);
}

function isUsableLasso(points: readonly ScreenPoint[]): boolean {
  const first = points[0];
  const last = points.at(-1);

  return (
    points.length >= MIN_LASSO_POINTS &&
    !!first &&
    !!last &&
    distance(first, last) >= MIN_LASSO_DISTANCE_PX
  );
}

function selectedSetsEqual(
  a: ReadonlySet<NodeId>,
  b: ReadonlySet<NodeId>,
): boolean {
  if (a.size !== b.size) {
    return false;
  }

  for (const id of a) {
    if (!b.has(id)) {
      return false;
    }
  }

  return true;
}

function distance(
  a: Readonly<{ x: number; y: number }>,
  b: Readonly<{ x: number; y: number }>,
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
