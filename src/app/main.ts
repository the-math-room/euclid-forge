import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateGraph";
import {
  hitTestFreePoint,
  hitTestTriangleInterior,
} from "../interaction/hitTest";
import {
  deltaBetween,
  translateFreePoints,
} from "../interaction/translateFreePoints";
import { updateFreePoint } from "../interaction/updateFreePoint";
import type { Vec2 } from "../meaning/vec2";
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

type DragState =
  | Readonly<{
      kind: "FREE_POINT";
      nodeId: NodeId;
    }>
  | Readonly<{
      kind: "TRIANGLE";
      vertexIds: readonly NodeId[];
      previousWorldPoint: Vec2;
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
    const pointer = eventPoint(canvas, event);
    const evaluated = evaluateGraph(graph);

    const pointHit = hitTestFreePoint(graph, evaluated, viewport, pointer);

    if (pointHit) {
      canvas.setPointerCapture(event.pointerId);
      drag = {
        kind: "FREE_POINT",
        nodeId: pointHit,
      };
      event.preventDefault();
      return;
    }

    const triangleHit = hitTestTriangleInterior(graph, evaluated, viewport, pointer);

    if (triangleHit) {
      canvas.setPointerCapture(event.pointerId);
      drag = {
        kind: "TRIANGLE",
        vertexIds: triangleHit.vertexIds,
        previousWorldPoint: screenToWorld(viewport, pointer),
      };
      event.preventDefault();
      return;
    }

    drag = null;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag) {
      return;
    }

    const viewport = viewportForCanvas(canvas);
    const world = screenToWorld(viewport, eventPoint(canvas, event));

    switch (drag.kind) {
      case "FREE_POINT": {
        graph = updateFreePoint(graph, drag.nodeId, world);
        break;
      }

      case "TRIANGLE": {
        const delta = deltaBetween(drag.previousWorldPoint, world);
        graph = translateFreePoints(graph, drag.vertexIds, delta);
        drag = {
          ...drag,
          previousWorldPoint: world,
        };
        break;
      }
    }

    requestRender();
    event.preventDefault();
  });

  canvas.addEventListener("pointerup", (event) => {
    if (drag) {
      drag = null;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      event.preventDefault();
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (drag) {
      drag = null;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      event.preventDefault();
    }
  });

  requestRender();
}

main();
