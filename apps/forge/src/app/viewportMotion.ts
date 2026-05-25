import { appState } from "./appState";
import type { AppState } from "./appState";
import { rotateViewport } from "./viewState";

export type ViewportRotationDirection = -1 | 0 | 1;

export type ViewportMotionState = Readonly<{
  rotateDirection: ViewportRotationDirection;
  lastTimestampMs: number | null;
}>;

export type ViewportMotionStep = Readonly<{
  state: AppState;
  motion: ViewportMotionState;
  shouldRender: boolean;
}>;

const VIEW_ROTATION_RATE_RADIANS_PER_SECOND = Math.PI / 2;
const MAX_FRAME_DELTA_SECONDS = 0.05;

export function emptyViewportMotionState(): ViewportMotionState {
  return Object.freeze({
    rotateDirection: 0,
    lastTimestampMs: null,
  });
}

export function startViewportRotation(
  motion: ViewportMotionState,
  rotateDirection: Exclude<ViewportRotationDirection, 0>,
): ViewportMotionState {
  if (motion.rotateDirection === rotateDirection) {
    return motion;
  }

  return Object.freeze({
    rotateDirection,
    lastTimestampMs: null,
  });
}

export function stopViewportRotation(
  motion: ViewportMotionState,
  rotateDirection: Exclude<ViewportRotationDirection, 0>,
): ViewportMotionState {
  if (motion.rotateDirection !== rotateDirection) {
    return motion;
  }

  return emptyViewportMotionState();
}

export function isViewportMotionActive(
  motion: ViewportMotionState,
): boolean {
  return motion.rotateDirection !== 0;
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

  const deltaRadians =
    motion.rotateDirection *
    VIEW_ROTATION_RATE_RADIANS_PER_SECOND *
    deltaSeconds;

  const nextViewState = rotateViewport(state.viewState, deltaRadians);

  if (nextViewState === state.viewState) {
    return Object.freeze({
      state,
      motion: nextMotion,
      shouldRender: false,
    });
  }

  return Object.freeze({
    state: appState(state.graph, nextViewState, state.dragState),
    motion: nextMotion,
    shouldRender: true,
  });
}
