import type { ScreenPoint } from "@euclid-forge/core";
import { appState } from "./appState";
import {
  createPinchGesture,
  viewStateForPinchGesture,
  type PinchGesture,
} from "./pinchZoom";
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
  viewportMotionInputForKey,
} from "./keyboardShortcuts";
import type { WorkspaceActionEnvironment } from "./workspaceActions";
import { openWorkspace, saveWorkspace } from "./workspaceActions";
import { startViewportMotion, stopViewportMotion } from "./viewportMotion";
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

type PendingPointerMove = Readonly<{
  event: PointerEvent;
  pointerId: number;
  point: ScreenPoint;
  shiftKey: boolean;
}>;

export function connectDomEvents(input: DomEventBindingsInput): void {
  let pendingPointerMove: PendingPointerMove | null = null;
  let pointerMoveFrame: number | null = null;
  const activePointers = new Map<number, ScreenPoint>();
  let pinchGesture: PinchGesture | null = null;

  const flushPendingPointerMove = (cancelScheduledFrame: boolean): void => {
    if (cancelScheduledFrame && pointerMoveFrame !== null) {
      cancelAnimationFrame(pointerMoveFrame);
    }

    pointerMoveFrame = null;

    const pending = pendingPointerMove;
    pendingPointerMove = null;

    if (!pending) {
      return;
    }

    const state = input.runtime.getState();

    input.runtime.applyTransition(
      pending.event,
      handlePointerMove(state, {
        pointerId: pending.pointerId,
        point: pending.point,
        viewport: viewportForCanvas(input.canvas, state.viewState),
        shiftKey: pending.shiftKey,
      }),
    );
  };

  const requestPointerMoveFrame = (): void => {
    if (pointerMoveFrame !== null) {
      return;
    }

    pointerMoveFrame = requestAnimationFrame(() => {
      flushPendingPointerMove(false);
    });
  };

  const updatePinchGesture = (): void => {
    if (!pinchGesture) {
      return;
    }

    const pointerA = activePointers.get(pinchGesture.pointerAId);
    const pointerB = activePointers.get(pinchGesture.pointerBId);

    if (!pointerA || !pointerB) {
      pinchGesture = null;
      return;
    }

    const currentState = input.runtime.getState();
    const nextViewState = viewStateForPinchGesture(
      pinchGesture,
      pointerA,
      pointerB,
    );

    if (nextViewState === currentState.viewState) {
      return;
    }

    input.runtime.setState(
      appState(
        currentState.graph,
        nextViewState,
        null,
        currentState.activeTool,
      ),
    );
    input.runtime.requestRender();
  };

  const maybeStartPinchGesture = (): boolean => {
    if (pinchGesture || activePointers.size !== 2) {
      return pinchGesture !== null;
    }

    const entries = [...activePointers.entries()];
    const first = entries[0];
    const second = entries[1];

    if (!first || !second) {
      return false;
    }

    flushPendingPointerMove(true);

    const currentState = input.runtime.getState();
    const gesture = createPinchGesture(
      first[0],
      first[1],
      second[0],
      second[1],
      viewportForCanvas(input.canvas, currentState.viewState),
      currentState.viewState,
    );

    if (!gesture) {
      return false;
    }

    pinchGesture = gesture;

    input.runtime.setState(
      appState(
        currentState.graph,
        currentState.viewState,
        null,
        currentState.activeTool,
      ),
    );

    return true;
  };

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

    const viewportMotionInput = viewportMotionInputForKey(event.key);

    if (viewportMotionInput !== null) {
      input.setViewportMotion(
        startViewportMotion(input.getViewportMotion(), viewportMotionInput),
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
    const viewportMotionInput = viewportMotionInputForKey(event.key);

    if (viewportMotionInput === null) {
      return;
    }

    input.setViewportMotion(
      stopViewportMotion(input.getViewportMotion(), viewportMotionInput),
    );
    event.preventDefault();
  });

  input.canvas.addEventListener("pointerdown", (event) => {
    flushPendingPointerMove(true);

    const point = eventPoint(input.canvas, event);
    activePointers.set(event.pointerId, point);

    if (maybeStartPinchGesture()) {
      event.preventDefault();
      return;
    }

    const state = input.runtime.getState();

    input.runtime.applyTransition(
      event,
      handlePointerDown(state, {
        pointerId: event.pointerId,
        point,
        viewport: viewportForCanvas(input.canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
    );
  });

  input.canvas.addEventListener("pointermove", (event) => {
    const point = eventPoint(input.canvas, event);

    if (activePointers.has(event.pointerId)) {
      activePointers.set(event.pointerId, point);
    }

    if (pinchGesture || activePointers.size >= 2) {
      if (maybeStartPinchGesture()) {
        updatePinchGesture();
        event.preventDefault();
        return;
      }
    }

    pendingPointerMove = {
      event,
      pointerId: event.pointerId,
      point,
      shiftKey: event.shiftKey,
    };

    event.preventDefault();
    requestPointerMoveFrame();
  });

  input.canvas.addEventListener("pointerup", (event) => {
    flushPendingPointerMove(true);
    activePointers.delete(event.pointerId);

    if (pinchGesture) {
      if (
        event.pointerId === pinchGesture.pointerAId ||
        event.pointerId === pinchGesture.pointerBId
      ) {
        pinchGesture = null;
      }

      event.preventDefault();
      return;
    }

    input.runtime.applyTransition(
      event,
      handlePointerUp(input.runtime.getState(), event.pointerId),
    );
  });

  input.canvas.addEventListener("pointercancel", (event) => {
    flushPendingPointerMove(true);
    activePointers.delete(event.pointerId);

    if (pinchGesture) {
      if (
        event.pointerId === pinchGesture.pointerAId ||
        event.pointerId === pinchGesture.pointerBId
      ) {
        pinchGesture = null;
      }

      event.preventDefault();
      return;
    }

    input.runtime.applyTransition(
      event,
      handlePointerCancel(input.runtime.getState(), event.pointerId),
    );
  });

  input.canvas.addEventListener("pointerleave", (event) => {
    flushPendingPointerMove(true);
    activePointers.delete(event.pointerId);
    pinchGesture = null;

    input.runtime.applyTransition(
      event,
      handlePointerLeave(input.runtime.getState()),
    );
  });
}
