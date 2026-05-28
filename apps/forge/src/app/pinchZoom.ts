import { screenToWorld, worldToScreen } from "@euclid-forge/core";
import type { ScreenPoint, ViewState, Viewport } from "@euclid-forge/core";

export type PinchGesture = Readonly<{
  pointerAId: number;
  pointerBId: number;
  initialDistancePx: number;
  initialMidpoint: ScreenPoint;
  initialViewport: Viewport;
  initialViewState: ViewState;
  anchorWorld: Readonly<{ x: number; y: number }>;
}>;

const MIN_PINCH_DISTANCE_PX = 8;
const MIN_VIEWPORT_ZOOM = 16;
const MAX_VIEWPORT_ZOOM = 640;

export function createPinchGesture(
  pointerAId: number,
  pointerA: ScreenPoint,
  pointerBId: number,
  pointerB: ScreenPoint,
  viewport: Viewport,
  viewState: ViewState,
): PinchGesture | null {
  const initialDistancePx = distance(pointerA, pointerB);

  if (initialDistancePx < MIN_PINCH_DISTANCE_PX) {
    return null;
  }

  const initialMidpoint = midpoint(pointerA, pointerB);

  return Object.freeze({
    pointerAId,
    pointerBId,
    initialDistancePx,
    initialMidpoint,
    initialViewport: viewport,
    initialViewState: viewState,
    anchorWorld: screenToWorld(viewport, initialMidpoint),
  });
}

export function viewStateForPinchGesture(
  gesture: PinchGesture,
  pointerA: ScreenPoint,
  pointerB: ScreenPoint,
): ViewState {
  const currentDistancePx = distance(pointerA, pointerB);
  const currentMidpoint = midpoint(pointerA, pointerB);
  const zoom = clampZoom(
    gesture.initialViewState.viewportZoom *
      (currentDistancePx / gesture.initialDistancePx),
  );

  const provisionalViewport: Viewport = Object.freeze({
    ...gesture.initialViewport,
    center: gesture.initialViewState.viewportCenter,
    zoom,
  });
  const anchorScreen = worldToScreen(provisionalViewport, gesture.anchorWorld);
  const screenDelta = {
    x: currentMidpoint.x - anchorScreen.x,
    y: currentMidpoint.y - anchorScreen.y,
  };
  const centerDelta = screenDeltaToWorldDelta(
    screenDelta,
    zoom,
    gesture.initialViewState.viewportRotation,
  );

  return Object.freeze({
    ...gesture.initialViewState,
    viewportZoom: zoom,
    viewportCenter: Object.freeze({
      x: gesture.initialViewState.viewportCenter.x - centerDelta.x,
      y: gesture.initialViewState.viewportCenter.y - centerDelta.y,
    }),
  });
}

function midpoint(a: ScreenPoint, b: ScreenPoint): ScreenPoint {
  return Object.freeze({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
}

function distance(a: ScreenPoint, b: ScreenPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function screenDeltaToWorldDelta(
  screenDelta: Readonly<{ x: number; y: number }>,
  viewportZoom: number,
  viewportRotation: number,
): Readonly<{ x: number; y: number }> {
  const screenWorldX = screenDelta.x / viewportZoom;
  const screenWorldY = -screenDelta.y / viewportZoom;
  const cos = Math.cos(viewportRotation);
  const sin = Math.sin(viewportRotation);

  return Object.freeze({
    x: cos * screenWorldX + sin * screenWorldY,
    y: -sin * screenWorldX + cos * screenWorldY,
  });
}

function clampZoom(value: number): number {
  return Math.max(MIN_VIEWPORT_ZOOM, Math.min(MAX_VIEWPORT_ZOOM, value));
}
