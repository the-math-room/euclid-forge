import "../styles/app.css";

import { installBuildInfoSurface } from "./buildInfo";
import { appState } from "./appState";
import { installToolSurface } from "./toolSurface";
import {
  installDisplayThemeSurface,
  type CanvasDisplaySettings,
} from "./displayThemeSurface";

import { evaluateGraph } from "@euclid-forge/core";
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
import { parallelMarkCountsForGraph } from "../rendering/parallelMarks";
import {
  HIGH_CONTRAST_RENDER_THEME,
  RENDER_THEME,
  scaledRenderTheme,
  type RenderTheme,
} from "../rendering/theme";
import { installPrintSurface } from "./printSurface";
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
  theme: RenderTheme = RENDER_THEME,
  showOccludedLines = false,
  showZLevels = false,
): void {
  resizeCanvasToDisplaySize(canvas, ctx);

  const rect = canvas.getBoundingClientRect();
  const viewport = viewportForCanvas(canvas, state.viewState);
  const evaluated = evaluateGraph(state.graph);

  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, rect.width, rect.height);

  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);
  const renderOptions = {
    theme,
    selectedNodeIds: state.viewState.selectedNodeIds,
    hoveredNodeId: state.viewState.hoveredNodeId,
    hiddenNodeIds,
    parallelMarkCounts: parallelMarkCountsForGraph({
      graph: state.graph,
      hiddenNodeIds,
    }),
    showOccludedLines,
    showZLevels,
    ...(state.dragState?.kind === "LASSO"
      ? { lassoPolygon: state.dragState.points }
      : {}),
  };

  renderScene(ctx, viewport, evaluated, renderOptions);
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);
  const statusSurface = statusSurfaceForDocument(document);
  const toolSurface = installToolSurface(document, {
    onToolChange(activeTool) {
      runtime.setState(
        appState(
          runtime.getState().graph,
          runtime.getState().viewState,
          runtime.getState().dragState,
          activeTool,
        ),
      );
      toolSurface.update(runtime.getState().activeTool);
      runtime.requestRender();
    },
  });
  installBuildInfoSurface(document);
  const workspaceEnvironment = browserWorkspaceActionEnvironment();

  const initialState = initialAppState();
  let canvasDisplaySettings: CanvasDisplaySettings = {
    mode: "dark",
    scale: "normal",
    showOccludedLines: false,
    showZLevels: false,
  };
  const requestRender = createRenderScheduler(() => {
    render(
      canvas,
      ctx,
      runtime.getState(),
      renderThemeForDisplaySettings(canvasDisplaySettings),
      canvasDisplaySettings.showOccludedLines,
      canvasDisplaySettings.showZLevels,
    );
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
      const step = stepViewportMotion(
        currentState,
        viewportMotion,
        timestampMs,
      );
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

  installPrintSurface({
    document,
    windowTarget: window,
    getState: runtime.getState,
  });

  const displayThemeSurface = installDisplayThemeSurface(document, {
    onSettingsChange(settings) {
      canvasDisplaySettings = settings;
      displayThemeSurface.update(settings);
      runtime.requestRender();
    },
  });
  displayThemeSurface.update(canvasDisplaySettings);

  runtime.requestRender();
}

function renderThemeForDisplaySettings(
  settings: CanvasDisplaySettings,
): RenderTheme {
  const theme =
    settings.mode === "high-contrast"
      ? HIGH_CONTRAST_RENDER_THEME
      : RENDER_THEME;

  return scaledRenderTheme(theme, settings.scale);
}

main();
