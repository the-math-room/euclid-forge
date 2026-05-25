import { deltaBetween } from "@euclid-forge/core/meaning/vec2";
import { applyGraphEdit } from "@euclid-forge/core/representation/edit";
import type { NodeId } from "@euclid-forge/core/representation/node";
import type { ScreenPoint, Viewport } from "@euclid-forge/core/core/viewport";
import { screenToWorld } from "@euclid-forge/core/core/viewport";
import {
  appCommandDisabledReason,
  appCommandForKey,
} from "./commands";
import {
  hoverIntent,
  pointerDownIntent,
} from "./pointerIntent";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  clearSelection,
  setHoveredNode,
  toggleSelectedNode,
} from "./viewState";
import {
  initialFreePointPositions,
  translatedFreePointPositions,
} from "./freePointDrag";

export type PointerCaptureEffect = Readonly<
  | {
      kind: "SET_POINTER_CAPTURE";
      pointerId: number;
    }
  | {
      kind: "RELEASE_POINTER_CAPTURE";
      pointerId: number;
    }
>;

export type StatusEffect = Readonly<{
  kind: "SHOW_STATUS";
  message: string;
}>;

export type AppEffect = PointerCaptureEffect | StatusEffect;

export type AppTransitionHistoryPolicy = "commit" | "ignore";

export type AppTransition = Readonly<{
  state: AppState;
  shouldRender: boolean;
  shouldPreventDefault: boolean;
  history: AppTransitionHistoryPolicy;
  effects: readonly AppEffect[];
}>;

type AppTransitionInit = Omit<AppTransition, "history" | "effects"> &
  Readonly<{
    history?: AppTransitionHistoryPolicy;
    effects?: readonly AppEffect[];
  }>;

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

export function handleKeyDown(
  state: AppState,
  input: KeyInput,
): AppTransition {
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
  const intent = pointerDownIntent(
    appState(state.graph, viewState, state.dragState),
    input,
  );

  switch (intent.kind) {
    case "SELECT_NODE":
      return changed(
        appState(
          state.graph,
          toggleSelectedNode(viewState, intent.id),
          null,
        ),
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
      return changed(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_FREE_POINT",
            point: intent.point,
          }),
          clearSelection(viewState),
          null,
        ),
        "commit",
      );

    case "NONE":
      return preventOnly(appState(state.graph, viewState, null));
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

    return changed(appState(state.graph, viewState, null));
  }

  const world = screenToWorld(input.viewport, input.point);
  const viewState = setHoveredNode(state.viewState, null);

  switch (state.dragState.kind) {
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

  return changed(appState(state.graph, viewState, state.dragState));
}

export function handlePointerUp(
  state: AppState,
  pointerId: number,
): AppTransition {
  if (!state.dragState) {
    return unchanged(state);
  }

  return transition({
    state: appState(state.graph, state.viewState, null),
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


function unchanged(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: false,
  });
}

function preventOnly(state: AppState): AppTransition {
  return transition({
    state,
    shouldRender: false,
    shouldPreventDefault: true,
  });
}

function changed(
  state: AppState,
  history: AppTransitionHistoryPolicy = "ignore",
  statusMessage?: string,
): AppTransition {
  const effects: readonly AppEffect[] | undefined = statusMessage
    ? [
        {
          kind: "SHOW_STATUS",
          message: statusMessage,
        },
      ]
    : undefined;

  return transition({
    state,
    shouldRender: true,
    shouldPreventDefault: true,
    history,
    ...(effects ? { effects } : {}),
  });
}

function transition(value: AppTransitionInit): AppTransition {
  return Object.freeze({
    history: "ignore",
    ...value,
    effects: Object.freeze([...(value.effects ?? [])]),
  });
}
