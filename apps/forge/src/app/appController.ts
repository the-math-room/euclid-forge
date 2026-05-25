import { deltaBetween, vec2 } from "@euclid-forge/core";
import { applyGraphEdit } from "@euclid-forge/core";
import type { NodeId } from "@euclid-forge/core";
import type { ScreenPoint, Viewport } from "@euclid-forge/core";
import { screenToWorld } from "@euclid-forge/core";
import { appCommandDisabledReason, appCommandForKey } from "./commands";
import { handleActiveToolPointerDown } from "./activeToolPointer";
import { changed, preventOnly, transition, unchanged } from "./appTransition";
import type { AppTransition } from "./appTransition";
import { hoverIntent, pointerDownIntent } from "./pointerIntent";
import { appState } from "./appState";
import type { AppState } from "./appState";

import {
  clearSelection,
  panViewport,
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
            initialPointerWorld: screenToWorld(input.viewport, input.point),
            initialViewportCenter: viewState.viewportCenter,
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
      const currentWorld = screenToWorld(input.viewport, input.point);
      const delta = deltaBetween(
        currentWorld,
        state.dragState.initialPointerWorld,
      );
      const baseViewState = {
        ...viewState,
        viewportCenter: state.dragState.initialViewportCenter,
      };
      const nextViewState = panViewport(baseViewState, delta);

      return changed(appState(state.graph, nextViewState, state.dragState));
    }

    case "FREE_POINT":
      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "MOVE_FREE_POINT",
            id: state.dragState.nodeId,
            point: world,
          }),
          viewState,
          state.dragState,
        ),
      );

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
  return handlePointerUp(state, pointerId);
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
