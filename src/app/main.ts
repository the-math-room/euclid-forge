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
import { createAppRuntime } from "./appRuntime";
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
import { initialHistory } from "./history";
import { createRenderScheduler } from "./renderScheduler";
import { statusSurfaceForDocument } from "./statusSurface";
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

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);
  const statusSurface = statusSurfaceForDocument(document);
  const workspaceEnvironment = browserWorkspaceActionEnvironment();

  const initialState = initialAppState();
  const requestRender = createRenderScheduler(() => {
    render(canvas, ctx, runtime.getState());
  });
  const runtime = createAppRuntime({
    canvas,
    initialState,
    initialHistory: initialHistory(initialState),
    requestRender,
    statusSurface,
  });
  let viewportMotion = emptyViewportMotionState();
  let viewportMotionFrame: number | null = null;

  const requestViewportMotionFrame = (): void => {
    if (viewportMotionFrame !== null) {
      return;
    }

    viewportMotionFrame = requestAnimationFrame((timestampMs) => {
      viewportMotionFrame = null;

      const currentState = runtime.getState();
      const step = stepViewportMotion(currentState, viewportMotion, timestampMs);
      viewportMotion = step.motion;

      if (step.state !== currentState) {
        runtime.setState(step.state);
      }

      if (step.shouldRender) {
        runtime.requestRender();
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
      saveWorkspace(workspaceEnvironment, runtime.getState());
      event.preventDefault();
      return;
    }

    if (isOpenShortcut(event)) {
      void openWorkspace({
        environment: workspaceEnvironment,
        setState: runtime.setState,
        setHistory: runtime.setHistory,
        requestRender: runtime.requestRender,
      });
      event.preventDefault();
      return;
    }

    if (isUndoShortcut(event)) {
      runtime.undo(event);
      return;
    }

    if (isRedoShortcut(event)) {
      runtime.redo(event);
      return;
    }

    const rotateDirection = viewportRotationDirectionForKey(event.key);

    if (rotateDirection !== null) {
      viewportMotion = startViewportRotation(viewportMotion, rotateDirection);
      requestViewportMotionFrame();
      event.preventDefault();
      return;
    }

    runtime.applyTransition(event, handleKeyDown(runtime.getState(), { key: event.key }));
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
    const state = runtime.getState();

    runtime.applyTransition(
      event,
      handlePointerDown(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
    );
  });

  canvas.addEventListener("pointermove", (event) => {
    const state = runtime.getState();

    runtime.applyTransition(
      event,
      handlePointerMove(state, {
        pointerId: event.pointerId,
        point: eventPoint(canvas, event),
        viewport: viewportForCanvas(canvas, state.viewState),
        shiftKey: event.shiftKey,
      }),
    );
  });

  canvas.addEventListener("pointerup", (event) => {
    runtime.applyTransition(
      event,
      handlePointerUp(runtime.getState(), event.pointerId),
    );
  });

  canvas.addEventListener("pointercancel", (event) => {
    runtime.applyTransition(
      event,
      handlePointerCancel(runtime.getState(), event.pointerId),
    );
  });

  canvas.addEventListener("pointerleave", (event) => {
    runtime.applyTransition(event, handlePointerLeave(runtime.getState()));
  });

  requestRender();
}

main();
