import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateGraph";
import { hitTestFreePoint } from "../interaction/hitTest";
import { updateFreePoint } from "../interaction/updateFreePoint";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import { renderScene } from "../rendering/renderScene";
import { screenToWorld } from "../rendering/viewport";
import {
  eventPoint,
  get2DContext,
  getCanvas,
  resizeCanvasToDisplaySize,
  viewportForCanvas,
} from "./canvasSurface";
import { initialScene } from "./initialScene";
import { createRenderScheduler } from "./renderScheduler";

type DragState = Readonly<{
  nodeId: NodeId;
}>;

function render(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  graph: Graph,
): void {
  resizeCanvasToDisplaySize(canvas, ctx);

  const rect = canvas.getBoundingClientRect();
  const viewport = viewportForCanvas(canvas);
  const evaluated = evaluateGraph(graph);

  ctx.clearRect(0, 0, rect.width, rect.height);
  renderScene(ctx, viewport, evaluated);
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);

  let graph = initialScene();
  let drag: DragState | null = null;

  const requestRender = createRenderScheduler(() => {
    render(canvas, ctx, graph);
  });

  window.addEventListener("resize", () => {
    requestRender();
  });

  canvas.addEventListener("pointerdown", (event) => {
    const viewport = viewportForCanvas(canvas);
    const evaluated = evaluateGraph(graph);
    const hit = hitTestFreePoint(
      graph,
      evaluated,
      viewport,
      eventPoint(canvas, event),
    );

    if (!hit) {
      drag = null;
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    drag = { nodeId: hit };
    event.preventDefault();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag) {
      return;
    }

    const viewport = viewportForCanvas(canvas);
    const world = screenToWorld(viewport, eventPoint(canvas, event));

    graph = updateFreePoint(graph, drag.nodeId, world);
    requestRender();
    event.preventDefault();
  });

  canvas.addEventListener("pointerup", (event) => {
    if (drag) {
      drag = null;
      canvas.releasePointerCapture(event.pointerId);
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (drag) {
      drag = null;
      canvas.releasePointerCapture(event.pointerId);
      event.preventDefault();
    }
  });

  requestRender();
}

main();
