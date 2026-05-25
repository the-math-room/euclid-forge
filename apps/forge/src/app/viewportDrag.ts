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

  const cos = Math.cos(dragState.initialViewportRotation);
  const sin = Math.sin(dragState.initialViewportRotation);

  const worldDelta = {
    x:
      (cos * screenDelta.x + sin * screenDelta.y) /
      dragState.initialViewportZoom,
    y:
      (-sin * screenDelta.x + cos * screenDelta.y) /
      dragState.initialViewportZoom,
  };

  return vec2(
    dragState.initialViewportCenter.x - worldDelta.x,
    dragState.initialViewportCenter.y + worldDelta.y,
  );
}
