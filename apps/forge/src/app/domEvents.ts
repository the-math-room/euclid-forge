import {
  handleKeyDown,
  handlePointerCancel,
  handlePointerDown,
  handlePointerLeave,
  handlePointerMove,
  handlePointerUp,
} from "./appController";
import type { AppRuntime } from "./appRuntime";
import { eventPoint, viewportForCanvas } from "./canvasSurface";
import {
  isOpenShortcut,
  isRedoShortcut,
  isSaveShortcut,
  isUndoShortcut,
  shouldIgnoreKeyDownTarget,
  viewportRotationDirectionForKey,
} from "./keyboardShortcuts";
import type { WorkspaceActionEnvironment } from "./workspaceActions";
import { openWorkspace, saveWorkspace } from "./workspaceActions";
import { startViewportRotation, stopViewportRotation } from "./viewportMotion";
import type { ViewportMotionState } from "./viewportMotion";

export type DomEventBindingsInput = Readonly<{
  windowTarget: Pick<Window, "addEventListener">;
  canvas: HTMLCanvasElement;
  runtime: AppRuntime;
  workspaceEnvironment: WorkspaceActionEnvironment;
  getViewportMotion: () => ViewportMotionState;
  setViewportMotion: (motion: ViewportMotionState) => void;
  requestViewportMotionFrame: () => void;
}>;

export function connectDomEvents(input: DomEventBindingsInput): void {
  input.windowTarget.addEventListener("resize", () => {
    input.runtime.requestRender();
  });

  input.windowTarget.addEventListener("keydown", (event) => {
    if (shouldIgnoreKeyDownTarget(event.target)) {
      return;
    }

    if (isSaveShortcut(event)) {
      saveWorkspace(input.workspaceEnvironment, input.runtime.getState());
      event.preventDefault();
      return;
    }

    if (isOpenShortcut(event)) {
      void openWorkspace({
        environment: input.workspaceEnvironment,
        setState: input.runtime.setState,
        setHistory: input.runtime.setHistory,
        requestRender: input.runtime.requestRender,
      });
      event.preventDefault();
      return;
    }

    if (isUndoShortcut(event)) {
      input.runtime.undo(event);
      return;
    }

    if (isRedoShortcut(event)) {
      input.runtime.redo(event);
      return;
    }

    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection !== null) {
      input.setViewportMotion(
        startViewportRotation(input.getViewportMotion(), rotateDirection),
      );
      input.requestViewportMotionFrame();
      event.preventDefault();
      return;
    }

    input.runtime.applyTransition(
      event,
      handleKeyDown(input.runtime.getState(), {
        key: event.key,
        shiftKey: event.shiftKey,
      }),
    );
  });

  input.windowTarget.addEventListener("keyup", (event) => {
    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection === null) {
      return;
    }

    input.setViewportMotion(
      stopViewportRotation(input.getViewportMotion(), rotateDirection),
    );
    event.preventDefault();
  });

  input.canvas.addEventListener("pointerdown", (event) => {
    const state = input.runtime.getState();

    input.runtime.applyTransition(
      event,
      handlePointerDown(state, {
        pointerId: event.pointerId,
        point: eventPoint(input.canvas, event),
        viewport: viewportForCanvas(input.canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
    );
  });

  input.canvas.addEventListener("pointermove", (event) => {
    const state = input.runtime.getState();

    input.runtime.applyTransition(
      event,
      handlePointerMove(state, {
        pointerId: event.pointerId,
        point: eventPoint(input.canvas, event),
        viewport: viewportForCanvas(input.canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
    );
  });

  input.canvas.addEventListener("pointerup", (event) => {
    input.runtime.applyTransition(
      event,
      handlePointerUp(input.runtime.getState(), event.pointerId),
    );
  });

  input.canvas.addEventListener("pointercancel", (event) => {
    input.runtime.applyTransition(
      event,
      handlePointerCancel(input.runtime.getState(), event.pointerId),
    );
  });

  input.canvas.addEventListener("pointerleave", (event) => {
    input.runtime.applyTransition(
      event,
      handlePointerLeave(input.runtime.getState()),
    );
  });
}
