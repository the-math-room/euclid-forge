import type { AppState } from "./appState";
import type { AppTransition, PointerCaptureEffect } from "./appController";

export type ApplyTransitionInput = Readonly<{
  canvas: HTMLCanvasElement;
  event: Event;
  transition: AppTransition;
  setState: (state: AppState) => void;
  requestRender: () => void;
  commitStateToHistory: (state: AppState) => void;
  showStatusMessage: (message: string | null) => void;
}>;

export function applyTransition(input: ApplyTransitionInput): void {
  input.setState(input.transition.state);

  if (input.transition.history === "commit") {
    input.commitStateToHistory(input.transition.state);
  }

  if (input.transition.statusMessage) {
    input.showStatusMessage(input.transition.statusMessage);
  }

  if (input.transition.pointerCapture) {
    applyPointerCaptureEffect(input.canvas, input.transition.pointerCapture);
  }

  if (input.transition.shouldRender) {
    input.requestRender();
  }

  if (input.transition.shouldPreventDefault) {
    input.event.preventDefault();
  }
}

export function applyPointerCaptureEffect(
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
