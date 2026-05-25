import { evaluateGraph } from "@euclid-forge/core";
import type { AppState } from "./appState";
import { effectiveHiddenNodeIds } from "./effectiveVisibility";
import { renderScene } from "../rendering/renderScene";
import { parallelMarkCountsForGraph } from "../rendering/parallelMarks";
import { PRINT_RENDER_THEME } from "../rendering/theme";

export type PrintSurfaceInput = Readonly<{
  document: Document;
  windowTarget: Pick<Window, "addEventListener">;
  getState: () => AppState;
}>;

const PRINT_WIDTH_PX = 1600;
const PRINT_HEIGHT_PX = 1200;

export function installPrintSurface(input: PrintSurfaceInput): void {
  const image = getOrCreatePrintImage(input.document);

  input.windowTarget.addEventListener("beforeprint", () => {
    image.src = renderPrintDataUrl(input.getState());
  });

  input.windowTarget.addEventListener("afterprint", () => {
    image.removeAttribute("src");
  });
}

function getOrCreatePrintImage(document: Document): HTMLImageElement {
  const existing = document.querySelector<HTMLImageElement>("#print-surface");

  if (existing) {
    return existing;
  }

  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const image = document.createElement("img");
  image.id = "print-surface";
  image.alt = "Printable geometry construction";

  app.append(image);

  return image;
}

function renderPrintDataUrl(state: AppState): string {
  const canvas = document.createElement("canvas");
  canvas.width = PRINT_WIDTH_PX;
  canvas.height = PRINT_HEIGHT_PX;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create print canvas context");
  }

  const viewport = {
    width: PRINT_WIDTH_PX,
    height: PRINT_HEIGHT_PX,
    center: state.viewState.viewportCenter,
    zoom: state.viewState.viewportZoom,
    rotation: state.viewState.viewportRotation,
  };

  ctx.fillStyle = PRINT_RENDER_THEME.background;
  ctx.fillRect(0, 0, PRINT_WIDTH_PX, PRINT_HEIGHT_PX);

  const hiddenNodeIds = effectiveHiddenNodeIds(state.graph, state.viewState);

  renderScene(ctx, viewport, evaluateGraph(state.graph), {
    selectedNodeIds: state.viewState.selectedNodeIds,
    hoveredNodeId: null,
    hiddenNodeIds,
    parallelMarkCounts: parallelMarkCountsForGraph({
      graph: state.graph,
      hiddenNodeIds,
    }),
    theme: PRINT_RENDER_THEME,
  });

  return canvas.toDataURL("image/png");
}
