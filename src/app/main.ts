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

  const setState = (next: AppState): void => {
    state = next;
  };

  const requestRender = createRenderScheduler(() => {
    render(canvas, ctx, state);
  });

  window.addEventListener("resize", () => {
    requestRender();
  });

  window.addEventListener("keydown", (event) => {
    if (shouldIgnoreKeyDownTarget(event.target)) {
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
