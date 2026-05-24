import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateScene";
import type {
  EvaluatedPoint,
  EvaluatedSegment,
} from "../evaluation/evaluated";
import type { Graph } from "../representation/graph";
import { vec2 } from "../meaning/vec2";
import { renderPoints } from "../rendering/pointRenderer";
import { renderSegments } from "../rendering/segmentRenderer";
import type { Viewport } from "../rendering/viewport";
import { initialScene } from "./initialScene";

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

function render(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  graph: Graph,
): void {
  resizeCanvasToDisplaySize(canvas, ctx);

  const rect = canvas.getBoundingClientRect();

  const viewport: Viewport = {
    width: rect.width,
    height: rect.height,
    center: vec2(0, 0),
    zoom: 80,
  };

  const evaluated = evaluateGraph(graph);

  const segments = evaluated.ordered.filter(
    (value): value is EvaluatedSegment => value.kind === "SEGMENT",
  );

  const points = evaluated.ordered.filter(
    (value): value is EvaluatedPoint => value.kind === "POINT",
  );

  ctx.clearRect(0, 0, rect.width, rect.height);

  renderSegments(ctx, viewport, segments);
  renderPoints(ctx, viewport, points);
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);
  const graph = initialScene();

  window.addEventListener("resize", () => {
    render(canvas, ctx, graph);
  });

  render(canvas, ctx, graph);
}

main();
