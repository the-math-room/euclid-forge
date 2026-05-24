import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateGraph";
import {
  handleKeyDown,
  handlePointerCancel,
  handlePointerDown,
  handlePointerLeave,
  handlePointerMove,
  handlePointerUp,
} from "./appController";
import type { AppTransition, PointerCaptureEffect } from "./appController";
import { initialAppState } from "./appState";
import type { AppState } from "./appState";
import {
  eventPoint,
  get2DContext,
  getCanvas,
  resizeCanvasToDisplaySize,
  viewportForCanvas,
} from "./canvasSurface";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import { createRenderScheduler } from "./renderScheduler";
import { renderScene } from "../rendering/renderScene";
import {
  emptyViewportMotionState,
  isViewportMotionActive,
  startViewportRotation,
  stepViewportMotion,
  stopViewportRotation,
} from "./viewportMotion";

function render(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  state: AppState,
): void {
  resizeCanvasToDisplaySize(canvas, ctx);

  const rect = canvas.getBoundingClientRect();
  const viewport = viewportForCanvas(canvas, state.viewState);
  const evaluated = evaluateGraph(state.graph);

  ctx.clearRect(0, 0, rect.width, rect.height);
  renderScene(ctx, viewport, evaluated, {
    selectedNodeIds: state.viewState.selectedNodeIds,
    hoveredNodeId: state.viewState.hoveredNodeId,
    hiddenNodeIds: effectiveHiddenNodeIds(state.graph, state.viewState),
  });
}

function applyTransition(
  canvas: HTMLCanvasElement,
  event: Event,
  transition: AppTransition,
  setState: (state: AppState) => void,
  requestRender: () => void,
): void {
  setState(transition.state);

  if (transition.pointerCapture) {
    applyPointerCaptureEffect(canvas, transition.pointerCapture);
  }

  if (transition.shouldRender) {
    requestRender();
  }

  if (transition.shouldPreventDefault) {
    event.preventDefault();
  }
}

function applyPointerCaptureEffect(
  canvas: HTMLCanvasElement,
  effect: PointerCaptureEffect,
): void {
  switch (effect.kind) {
    case "SET_POINTER_CAPTURE":
      canvas.setPointerCapture(effect.pointerId);
      break;

    case "RELEASE_POINTER_CAPTURE":
      if (canvas.hasPointerCapture(effect.pointerId)) {
        canvas.releasePointerCapture(effect.pointerId);
      }
      break;
  }
}



function viewportRotationDirectionForKey(key: string): -1 | 1 | null {
  if (key === "[") {
    return 1;
  }

  if (key === "]") {
    return -1;
  }

  return null;
}

function shouldIgnoreKeyDownTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);

  let state = initialAppState();
  let viewportMotion = emptyViewportMotionState();
  let viewportMotionFrame: number | null = null;

  const setState = (next: AppState): void => {
    state = next;
  };

  const requestRender = createRenderScheduler(() => {
    render(canvas, ctx, state);
  });

  const requestViewportMotionFrame = (): void => {
    if (viewportMotionFrame !== null) {
      return;
    }

    viewportMotionFrame = requestAnimationFrame((timestampMs) => {
      viewportMotionFrame = null;

      const step = stepViewportMotion(state, viewportMotion, timestampMs);
      viewportMotion = step.motion;

      if (step.state !== state) {
        state = step.state;
      }

      if (step.shouldRender) {
        requestRender();
      }

      if (isViewportMotionActive(viewportMotion)) {
        requestViewportMotionFrame();
      }
    });
  };

  window.addEventListener("resize", () => {
    requestRender();
  });

  window.addEventListener("keydown", (event) => {
    if (shouldIgnoreKeyDownTarget(event.target)) {
      return;
    }

    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection !== null) {
      viewportMotion = startViewportRotation(viewportMotion, rotateDirection);
      requestViewportMotionFrame();
      event.preventDefault();
      return;
    }

    applyTransition(
      canvas,
      event,
      handleKeyDown(state, { key: event.key }),
      setState,
      requestRender,
    );
  });

  window.addEventListener("keyup", (event) => {
    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection === null) {
      return;
    }

    viewportMotion = stopViewportRotation(viewportMotion, rotateDirection);
    event.preventDefault();
  });

  canvas.addEventListener("pointerdown", (event) => {
    applyTransition(
      canvas,
      event,
      handlePointerDown(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
      setState,
      requestRender,
    );
  });

  canvas.addEventListener("pointermove", (event) => {
    applyTransition(
      canvas,
      event,
      handlePointerMove(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
      setState,
      requestRender,
    );
  });

  canvas.addEventListener("pointerup", (event) => {
    applyTransition(
      canvas,
      event,
      handlePointerUp(state, event.pointerId),
      setState,
      requestRender,
    );
  });

  canvas.addEventListener("pointercancel", (event) => {
    applyTransition(
      canvas,
      event,
      handlePointerCancel(state, event.pointerId),
      setState,
      requestRender,
    );
  });

  canvas.addEventListener("pointerleave", (event) => {
    applyTransition(
      canvas,
      event,
      handlePointerLeave(state),
      setState,
      requestRender,
    );
  });


  requestRender();
}

main();
