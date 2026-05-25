import { vec2 } from "@euclid-forge/core";
import type { ScreenPoint, Vec2 } from "@euclid-forge/core";
import type { DragState } from "./dragState";

export function viewportCenterForDrag(
  dragState: Extract<DragState, { kind: "VIEWPORT" }>,
  currentPointerScreen: ScreenPoint,
): Vec2 {
  const screenDelta = {
    x: currentPointerScreen.x - dragState.initialPointerScreen.x,
    y: currentPointerScreen.y - dragState.initialPointerScreen.y,
  };

  const worldDelta = screenDeltaToWorldDelta(
    screenDelta,
    dragState.initialViewportZoom,
    dragState.initialViewportRotation,
  );

  return vec2(
    dragState.initialViewportCenter.x - worldDelta.x,
    dragState.initialViewportCenter.y - worldDelta.y,
  );
}

export function screenDeltaToWorldDelta(
  screenDelta: Readonly<{ x: number; y: number }>,
  viewportZoom: number,
  viewportRotation: number,
): Vec2 {
  const screenWorldX = screenDelta.x / viewportZoom;
  const screenWorldY = -screenDelta.y / viewportZoom;
  const cos = Math.cos(viewportRotation);
  const sin = Math.sin(viewportRotation);

  return vec2(
    cos * screenWorldX + sin * screenWorldY,
    -sin * screenWorldX + cos * screenWorldY,
  );
}
