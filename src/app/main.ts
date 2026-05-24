import "../styles/app.css";

import { evaluateGraph } from "../evaluation/evaluateGraph";
import {
  hitTestFreePoint,
  hitTestTriangleInterior,
} from "../interaction/hitTest";
import { deltaBetween } from "../meaning/vec2";
import { applyGraphEdit } from "../representation/edit";
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
import type { DragState } from "./dragState";
import { initialScene } from "./initialScene";
import { createRenderScheduler } from "./renderScheduler";
import {
  clearSelection,
  emptyViewState,
  toggleSelectedNode,
} from "./viewState";
import type { ViewState } from "./viewState";

function render(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  graph: Graph,
  viewState: ViewState,
): void {
  resizeCanvasToDisplaySize(canvas, ctx);

  const rect = canvas.getBoundingClientRect();
  const viewport = viewportForCanvas(canvas);
  const evaluated = evaluateGraph(graph);

  ctx.clearRect(0, 0, rect.width, rect.height);
  renderScene(ctx, viewport, evaluated, {
    selectedNodeIds: viewState.selectedNodeIds,
  });
}

function releasePointerCaptureIfHeld(
  canvas: HTMLCanvasElement,
  pointerId: number,
): void {
  if (canvas.hasPointerCapture(pointerId)) {
    canvas.releasePointerCapture(pointerId);
  }
}

function selectedTriangleVertices(
  viewState: ViewState,
): readonly [NodeId, NodeId, NodeId] | null {
  const selected = [...viewState.selectedNodeIds];

  if (selected.length !== 3) {
    return null;
  }

  const [a, b, c] = selected;

  if (!a || !b || !c) {
    return null;
  }

  return [a, b, c];
}

function main(): void {
  const canvas = getCanvas();
  const ctx = get2DContext(canvas);

  let graph = initialScene();
  let drag: DragState | null = null;
  let viewState = emptyViewState();

  const requestRender = createRenderScheduler(() => {
    render(canvas, ctx, graph, viewState);
  });

  window.addEventListener("resize", () => {
    requestRender();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "t") {
      return;
    }

    const vertices = selectedTriangleVertices(viewState);

    if (!vertices) {
      return;
    }

    graph = applyGraphEdit(graph, {
      kind: "ADD_TRIANGLE",
      vertices,
    });

    viewState = clearSelection(viewState);
    requestRender();
    event.preventDefault();
  });

  canvas.addEventListener("pointerdown", (event) => {
    const viewport = viewportForCanvas(canvas);
    const pointer = eventPoint(canvas, event);
    const evaluated = evaluateGraph(graph);

    const pointHit = hitTestFreePoint(graph, evaluated, viewport, pointer);

    if (pointHit) {
      if (event.shiftKey) {
        viewState = toggleSelectedNode(viewState, pointHit);
        drag = null;
        requestRender();
        event.preventDefault();
        return;
      }

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

    graph = applyGraphEdit(graph, {
      kind: "ADD_FREE_POINT",
      point: screenToWorld(viewport, pointer),
    });
    viewState = clearSelection(viewState);
    drag = null;
    requestRender();
    event.preventDefault();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drag) {
      return;
    }

    const viewport = viewportForCanvas(canvas);
    const world = screenToWorld(viewport, eventPoint(canvas, event));

    switch (drag.kind) {
      case "FREE_POINT": {
        graph = applyGraphEdit(graph, {
          kind: "MOVE_FREE_POINT",
          id: drag.nodeId,
          point: world,
        });
        break;
      }

      case "TRIANGLE": {
        const delta = deltaBetween(drag.previousWorldPoint, world);

        graph = applyGraphEdit(graph, {
          kind: "TRANSLATE_FREE_POINTS",
          ids: drag.vertexIds,
          delta,
        });

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
      releasePointerCaptureIfHeld(canvas, event.pointerId);
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointercancel", (event) => {
    if (drag) {
      drag = null;
      releasePointerCaptureIfHeld(canvas, event.pointerId);
      event.preventDefault();
    }
  });

  requestRender();
}

main();
