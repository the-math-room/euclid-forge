import { vec2 } from "@euclid-forge/core";
import type { ViewState } from "./viewState";

export function testViewState(overrides: Partial<ViewState> = {}): ViewState {
  return {
    selectedNodeIds: new Set(),
    hiddenNodeIds: new Set(),
    hoveredNodeId: null,
    viewportCenter: vec2(0, 0),
    viewportZoom: 80,
    viewportRotation: 0,
    ...overrides,
  };
}
