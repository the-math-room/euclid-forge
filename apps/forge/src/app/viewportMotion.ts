import { appState } from "./appState";
import type { AppState } from "./appState";
import type {
  ViewportMotionDirection,
  ViewportMotionInput,
} from "./keyboardShortcuts";
import { screenDeltaToWorldDelta } from "./viewportDrag";
import { rotateViewport } from "./viewState";

export type ViewportAxisDirection = -1 | 0 | 1;
export type ViewportRotationDirection = ViewportAxisDirection;

export type ViewportMotionState = Readonly<{
  panXDirection: ViewportAxisDirection;
  panYDirection: ViewportAxisDirection;
  zoomDirection: ViewportAxisDirection;
  rotateDirection: ViewportAxisDirection;
  lastTimestampMs: number | null;
}>;

export type ViewportMotionStep = Readonly<{
  state: AppState;
  motion: ViewportMotionState;
  shouldRender: boolean;
}>;

const VIEW_PAN_UNITS_PER_SECOND = 3;
const VIEW_ZOOM_EXPONENT_PER_SECOND = 1.75;
const VIEW_ROTATION_RATE_RADIANS_PER_SECOND = Math.PI / 2;
const MIN_VIEWPORT_ZOOM = 16;
const MAX_VIEWPORT_ZOOM = 640;
const MAX_FRAME_DELTA_SECONDS = 0.05;

export function emptyViewportMotionState(): ViewportMotionState {
  return Object.freeze({
    panXDirection: 0,
    panYDirection: 0,
    zoomDirection: 0,
    rotateDirection: 0,
    lastTimestampMs: null,
  });
}

export function startViewportMotion(
  motion: ViewportMotionState,
  input: ViewportMotionInput,
): ViewportMotionState {
  const next = withMotionDirection(motion, input, input.direction);

  if (sameMotionDirections(motion, next)) {
    return motion;
  }

  return Object.freeze({
    ...next,
    lastTimestampMs: null,
  });
}

export function stopViewportMotion(
  motion: ViewportMotionState,
  input: ViewportMotionInput,
): ViewportMotionState {
  const currentDirection = motionDirection(motion, input);

  if (currentDirection !== input.direction) {
    return motion;
  }

  const next = withMotionDirection(motion, input, 0);

  if (!hasActiveDirection(next)) {
    return emptyViewportMotionState();
  }

  return Object.freeze({
    ...next,
    lastTimestampMs: motion.lastTimestampMs,
  });
}

export function startViewportRotation(
  motion: ViewportMotionState,
  rotateDirection: Exclude<ViewportRotationDirection, 0>,
): ViewportMotionState {
  return startViewportMotion(motion, {
    kind: "ROTATE",
    direction: rotateDirection,
  });
}

export function stopViewportRotation(
  motion: ViewportMotionState,
  rotateDirection: Exclude<ViewportRotationDirection, 0>,
): ViewportMotionState {
  return stopViewportMotion(motion, {
    kind: "ROTATE",
    direction: rotateDirection,
  });
}

export function isViewportMotionActive(motion: ViewportMotionState): boolean {
  return hasActiveDirection(motion);
}

export function stepViewportMotion(
  state: AppState,
  motion: ViewportMotionState,
  timestampMs: number,
): ViewportMotionStep {
  if (!isViewportMotionActive(motion)) {
    return Object.freeze({
      state,
      motion: emptyViewportMotionState(),
      shouldRender: false,
    });
  }

  if (motion.lastTimestampMs === null) {
    return Object.freeze({
      state,
      motion: Object.freeze({
        ...motion,
        lastTimestampMs: timestampMs,
      }),
      shouldRender: false,
    });
  }

  const deltaSeconds = Math.max(
    0,
    Math.min(
      MAX_FRAME_DELTA_SECONDS,
      (timestampMs - motion.lastTimestampMs) / 1000,
    ),
  );

  const nextMotion = Object.freeze({
    ...motion,
    lastTimestampMs: timestampMs,
  });

  if (deltaSeconds === 0) {
    return Object.freeze({
      state,
      motion: nextMotion,
      shouldRender: false,
    });
  }

  const nextViewState = applyViewportMotion(
    state.viewState,
    motion,
    deltaSeconds,
  );

  if (nextViewState === state.viewState) {
    return Object.freeze({
      state,
      motion: nextMotion,
      shouldRender: false,
    });
  }

  return Object.freeze({
    state: appState(
      state.graph,
      nextViewState,
      state.dragState,
      state.activeTool,
    ),
    motion: nextMotion,
    shouldRender: true,
  });
}

function applyViewportMotion(
  viewState: AppState["viewState"],
  motion: ViewportMotionState,
  deltaSeconds: number,
): AppState["viewState"] {
  let nextViewState = viewState;

  if (motion.panXDirection !== 0 || motion.panYDirection !== 0) {
    const panDelta = VIEW_PAN_UNITS_PER_SECOND * deltaSeconds;
    const screenDelta = {
      x: motion.panXDirection * panDelta * nextViewState.viewportZoom,
      y: -motion.panYDirection * panDelta * nextViewState.viewportZoom,
    };
    const worldDelta = screenDeltaToWorldDelta(
      screenDelta,
      nextViewState.viewportZoom,
      nextViewState.viewportRotation,
    );

    nextViewState = Object.freeze({
      ...nextViewState,
      viewportCenter: Object.freeze({
        x: nextViewState.viewportCenter.x + worldDelta.x,
        y: nextViewState.viewportCenter.y + worldDelta.y,
      }),
    });
  }

  if (motion.zoomDirection !== 0) {
    const zoomFactor = Math.exp(
      motion.zoomDirection * VIEW_ZOOM_EXPONENT_PER_SECOND * deltaSeconds,
    );

    nextViewState = Object.freeze({
      ...nextViewState,
      viewportZoom: clampZoom(nextViewState.viewportZoom * zoomFactor),
    });
  }

  if (motion.rotateDirection !== 0) {
    nextViewState = rotateViewport(
      nextViewState,
      motion.rotateDirection *
        VIEW_ROTATION_RATE_RADIANS_PER_SECOND *
        deltaSeconds,
    );
  }

  return nextViewState;
}

function motionDirection(
  motion: ViewportMotionState,
  input: ViewportMotionInput,
): ViewportAxisDirection {
  switch (input.kind) {
    case "PAN_X":
      return motion.panXDirection;

    case "PAN_Y":
      return motion.panYDirection;

    case "ZOOM":
      return motion.zoomDirection;

    case "ROTATE":
      return motion.rotateDirection;
  }
}

function withMotionDirection(
  motion: ViewportMotionState,
  input: ViewportMotionInput,
  direction: ViewportAxisDirection,
): ViewportMotionState {
  switch (input.kind) {
    case "PAN_X":
      return Object.freeze({
        ...motion,
        panXDirection: direction,
      });

    case "PAN_Y":
      return Object.freeze({
        ...motion,
        panYDirection: direction,
      });

    case "ZOOM":
      return Object.freeze({
        ...motion,
        zoomDirection: direction,
      });

    case "ROTATE":
      return Object.freeze({
        ...motion,
        rotateDirection: direction,
      });
  }
}

function sameMotionDirections(
  a: ViewportMotionState,
  b: ViewportMotionState,
): boolean {
  return (
    a.panXDirection === b.panXDirection &&
    a.panYDirection === b.panYDirection &&
    a.zoomDirection === b.zoomDirection &&
    a.rotateDirection === b.rotateDirection
  );
}

function hasActiveDirection(motion: ViewportMotionState): boolean {
  return (
    motion.panXDirection !== 0 ||
    motion.panYDirection !== 0 ||
    motion.zoomDirection !== 0 ||
    motion.rotateDirection !== 0
  );
}

function clampZoom(zoom: number): number {
  return Math.max(MIN_VIEWPORT_ZOOM, Math.min(MAX_VIEWPORT_ZOOM, zoom));
}

export type { ViewportMotionDirection };
