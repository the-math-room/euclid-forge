import { vec2 } from "../meaning/vec2";
import type { ScreenPoint, Viewport } from "../rendering/viewport";

export function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector<HTMLCanvasElement>("#geometry-canvas");

  if (!canvas) {
    throw new Error("Missing #geometry-canvas");
  }

  return canvas;
}

export function get2DContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create 2D canvas context");
  }

  return ctx;
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.floor(rect.width * dpr);
  const targetHeight = Math.floor(rect.height * dpr);

  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function viewportForCanvas(canvas: HTMLCanvasElement): Viewport {
  const rect = canvas.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    center: vec2(0, 0),
    zoom: 80,
  };
}

export function eventPoint(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): ScreenPoint {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
