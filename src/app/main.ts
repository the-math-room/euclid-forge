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
import type { AppTransition } from "./appController";
import { initialAppState } from "./appState";
import {
  isOpenShortcut,
  isRedoShortcut,
  isSaveShortcut,
  isUndoShortcut,
  shouldIgnoreKeyDownTarget,
  viewportRotationDirectionForKey,
} from "./keyboardShortcuts";
import type { AppState } from "./appState";
import {
  eventPoint,
  get2DContext,
  getCanvas,
  resizeCanvasToDisplaySize,
  viewportForCanvas,
} from "./canvasSurface";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import {
  appStateFromHistory,
  commitHistory,
  initialHistory,
  redoHistory,
  undoHistory,
} from "./history";
import { createRenderScheduler } from "./renderScheduler";
import { applyTransition } from "./transitionEffects";
import { renderScene } from "../rendering/renderScene";
import {
  browserWorkspaceActionEnvironment,
  openWorkspace,
  saveWorkspace,
} from "./workspaceActions";
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

function getStatusElement(): HTMLElement {
  const existing = document.querySelector<HTMLElement>("#status-message");

  if (existing) {
    return existing;
  }

  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const status = document.createElement("div");
  status.id = "status-message";
  status.role = "status";
  status.setAttribute("aria-live", "polite");
  status.hidden = true;

  app.append(status);

  return status;
}

function showStatusMessage(status: HTMLElement, message: string | null): void {
  status.textContent = message ?? "";
  status.hidden = !message;
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);
  const status = getStatusElement();
  const workspaceEnvironment = browserWorkspaceActionEnvironment();

  let state = initialAppState();
  let history = initialHistory(state);
  let viewportMotion = emptyViewportMotionState();
  let viewportMotionFrame: number | null = null;

  const setState = (next: AppState): void => {
    state = next;
  };

  const commitStateToHistory = (next: AppState): void => {
    history = commitHistory(history, next);
  };

  const setHistory = (next: typeof history): void => {
    history = next;
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

    if (isSaveShortcut(event)) {
      saveWorkspace(workspaceEnvironment, state);
      event.preventDefault();
      return;
    }

    if (isOpenShortcut(event)) {
      void openWorkspace({
        environment: workspaceEnvironment,
        setState,
        setHistory,
        requestRender,
      });
      event.preventDefault();
      return;
    }

    if (isUndoShortcut(event)) {
      history = undoHistory(history);
      state = appStateFromHistory(history);
      requestRender();
      event.preventDefault();
      return;
    }

    if (isRedoShortcut(event)) {
      history = redoHistory(history);
      state = appStateFromHistory(history);
      requestRender();
      event.preventDefault();
      return;
    }

    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection !== null) {
      viewportMotion = startViewportRotation(viewportMotion, rotateDirection);
      requestViewportMotionFrame();
      event.preventDefault();
      return;
    }

    applyTransition({
      canvas,
      event,
      transition: handleKeyDown(state, { key: event.key }),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
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
    applyTransition({
      canvas,
      event,
      transition: handlePointerDown(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
  });

  canvas.addEventListener("pointermove", (event) => {
    applyTransition({
      canvas,
      event,
      transition: handlePointerMove(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
  });

  canvas.addEventListener("pointerup", (event) => {
    applyTransition({
      canvas,
      event,
      transition: handlePointerUp(state, event.pointerId),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
  });

  canvas.addEventListener("pointercancel", (event) => {
    applyTransition({
      canvas,
      event,
      transition: handlePointerCancel(state, event.pointerId),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
  });

  canvas.addEventListener("pointerleave", (event) => {
    applyTransition({
      canvas,
      event,
      transition: handlePointerLeave(state),
      setState,
      requestRender,
      commitStateToHistory,
      showStatusMessage: (message) => showStatusMessage(status, message),
    });
  });

  requestRender();
}

main();
