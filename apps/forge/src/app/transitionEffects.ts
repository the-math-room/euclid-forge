import type { AppState } from "./appState";
import type {
  AppEffect,
  AppTransition,
  PointerCaptureEffect,
} from "./appController";

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

  for (const effect of input.transition.effects) {
    applyAppEffect(input, effect);
  }

  if (input.transition.shouldRender) {
    input.requestRender();
  }

  if (input.transition.shouldPreventDefault) {
    input.event.preventDefault();
  }
}


function applyAppEffect(
  input: ApplyTransitionInput,
  effect: AppEffect,
): void {
  switch (effect.kind) {
    case "SHOW_STATUS":
      input.showStatusMessage(effect.message);
      break;

    case "SET_POINTER_CAPTURE":
    case "RELEASE_POINTER_CAPTURE":
      applyPointerCaptureEffect(input.canvas, effect);
      break;
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
