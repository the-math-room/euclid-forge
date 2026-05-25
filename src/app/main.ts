import "../styles/app.css";

import { evaluateGraph } from "@euclid-forge/core/evaluation/evaluateGraph";
import { createAppRuntime } from "./appRuntime";
import { initialAppState } from "./appState";
import type { AppState } from "./appState";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import { initialHistory } from "./history";
import { connectDomEvents } from "./domEvents";
import {
  get2DContext,
  getCanvas,
  resizeCanvasToDisplaySize,
  viewportForCanvas,
} from "./canvasSurface";
import { createRenderScheduler } from "./renderScheduler";
import { statusSurfaceForDocument } from "./statusSurface";
import { renderScene } from "../rendering/renderScene";
import { browserWorkspaceActionEnvironment } from "./workspaceActions";
import {
  emptyViewportMotionState,
  isViewportMotionActive,
  stepViewportMotion,
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

  connectDomEvents({
    windowTarget: window,
    canvas,
    runtime,
    workspaceEnvironment,
    getViewportMotion: () => viewportMotion,
    setViewportMotion: (next) => {
      viewportMotion = next;
    },
    requestViewportMotionFrame,
  });

  runtime.requestRender();
}

main();
