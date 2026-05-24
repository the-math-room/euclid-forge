import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateGraph";
import { hitTestFreePoint } from "../interaction/hitTest";
import { updateFreePoint } from "../interaction/updateFreePoint";
import { vec2 } from "../meaning/vec2";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import { renderScene } from "../rendering/renderScene";
import { screenToWorld } from "../rendering/viewport";
import type { ScreenPoint, Viewport } from "../rendering/viewport";
import { initialScene } from "./initialScene";

type DragState = Readonly<{
  nodeId: NodeId;
}>;

function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("#geometry-canvas");

  if (!canvas) {
    throw new Error("Missing #geometry-canvas");
  }

  return canvas;
}

function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create 2D canvas context");
  }

  return ctx;
}

function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function viewportForCanvas(canvas: HTMLCanvasElement): Viewport {
  const rect = canvas.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    center: vec2(0, 0),
    zoom: 80,
  };
}

function eventPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): ScreenPoint {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

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

  window.addEventListener("resize", () => {
    render(canvas, ctx, graph);
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
    render(canvas, ctx, graph);
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

  render(canvas, ctx, graph);
}

main();
