import { applyGraphEdit, canDeleteNodes } from "../representation/edit";
import type { NodeId } from "../representation/node";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  clearEffectivelyHiddenSelection,
} from "./effectiveVisibility";
import {
  clearSelection,
  hideSelectedNodes,
  panViewport,
  resetViewport,
  resetViewportRotation,
  rotateViewportClockwise,
  rotateViewportCounterclockwise,
  unhideAllNodes,
  zoomViewport,
} from "./viewState";

export type CommandHistoryPolicy = "commit" | "ignore";

export type AppCommandResult = Readonly<{
  state: AppState;
  history: CommandHistoryPolicy;
}>;

export type AppCommand = Readonly<{
  id: string;
  keys: readonly string[];
  run: (state: AppState) => AppCommandResult | null;
}>;

export const APP_COMMANDS: readonly AppCommand[] = Object.freeze([
  command("pan-viewport-left", ["arrowleft"], (state) =>
    ignore(
      appState(
        state.graph,
        panViewport(state.viewState, { x: -viewportPanStep(state), y: 0 }),
        state.dragState,
      ),
    ),
  ),

  command("pan-viewport-right", ["arrowright"], (state) =>
    ignore(
      appState(
        state.graph,
        panViewport(state.viewState, { x: viewportPanStep(state), y: 0 }),
        state.dragState,
      ),
    ),
  ),

  command("pan-viewport-up", ["arrowup"], (state) =>
    ignore(
      appState(
        state.graph,
        panViewport(state.viewState, { x: 0, y: viewportPanStep(state) }),
        state.dragState,
      ),
    ),
  ),

  command("pan-viewport-down", ["arrowdown"], (state) =>
    ignore(
      appState(
        state.graph,
        panViewport(state.viewState, { x: 0, y: -viewportPanStep(state) }),
        state.dragState,
      ),
    ),
  ),

  command("zoom-viewport-in", ["+", "="], (state) =>
    ignore(
      appState(
        state.graph,
        zoomViewport(state.viewState, 1.25),
        state.dragState,
      ),
    ),
  ),

  command("zoom-viewport-out", ["-", "_"], (state) =>
    ignore(
      appState(
        state.graph,
        zoomViewport(state.viewState, 0.8),
        state.dragState,
      ),
    ),
  ),

  command("reset-viewport", ["0"], (state) =>
    ignore(
      appState(
        state.graph,
        resetViewport(state.viewState),
        state.dragState,
      ),
    ),
  ),

  command("rotate-viewport-counterclockwise", ["["], (state) =>
    ignore(
      appState(
        state.graph,
        rotateViewportCounterclockwise(state.viewState),
        state.dragState,
      ),
    ),
  ),

  command("rotate-viewport-clockwise", ["]"], (state) =>
    ignore(
      appState(
        state.graph,
        rotateViewportClockwise(state.viewState),
        state.dragState,
      ),
    ),
  ),

  command("reset-viewport-rotation", ["\\"], (state) =>
    ignore(
      appState(
        state.graph,
        resetViewportRotation(state.viewState),
        state.dragState,
      ),
    ),
  ),

  command("create-triangle", ["t"], (state) => {
    const vertices = selectedFreePointVertices(state);

    if (!vertices) {
      return null;
    }

    return commit(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_TRIANGLE",
          vertices,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }),

  command("create-centroid", ["g"], (state) => {
    const triangle = selectedTriangle(state);

    if (!triangle) {
      return null;
    }

    return commit(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_CENTROID",
          triangle,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }),

  command("create-side-midpoints", ["m"], (state) => {
    const triangle = selectedTriangle(state);

    if (!triangle) {
      return null;
    }

    return commit(
      appState(
        applyGraphEdit(state.graph, {
          kind: "ADD_MIDPOINTS",
          triangle,
        }),
        clearSelection(state.viewState),
        state.dragState,
      ),
    );
  }),


  command("delete-selected", ["delete", "backspace"], (state) => {
    const selected = [...state.viewState.selectedNodeIds];

    if (!canDeleteNodes(state.graph, selected)) {
      return null;
    }

    return commit(
      appState(
        applyGraphEdit(state.graph, {
          kind: "DELETE_NODES",
          ids: selected,
        }),
        clearSelection(state.viewState),
        null,
      ),
    );
  }),

  command("hide-selected", ["h"], (state) => {
    const viewState = clearEffectivelyHiddenSelection(
      state.graph,
      hideSelectedNodes(state.viewState),
    );

    if (viewState === state.viewState) {
      return null;
    }

    return commit(appState(state.graph, viewState, state.dragState));
  }),

  command("unhide-all", ["u"], (state) => {
    const viewState = unhideAllNodes(state.viewState);

    if (viewState === state.viewState) {
      return null;
    }

    return commit(appState(state.graph, viewState, state.dragState));
  }),
]);

export function appCommandForKey(key: string): AppCommand | null {
  const normalized = normalizeCommandKey(key);

  return (
    APP_COMMANDS.find((command) => command.keys.includes(normalized)) ?? null
  );
}

function command(
  id: string,
  keys: readonly string[],
  run: AppCommand["run"],
): AppCommand {
  return Object.freeze({
    id,
    keys: Object.freeze(keys.map(normalizeCommandKey)),
    run,
  });
}

function normalizeCommandKey(key: string): string {
  return key.toLowerCase();
}

function commit(state: AppState): AppCommandResult {
  return Object.freeze({
    state,
    history: "commit",
  });
}

function ignore(state: AppState): AppCommandResult {
  return Object.freeze({
    state,
    history: "ignore",
  });
}

function viewportPanStep(state: AppState): number {
  return 40 / state.viewState.viewportZoom;
}

function selectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 3) {
    return null;
  }

  const [a, b, c] = selected;

  if (!a || !b || !c) {
    return null;
  }

  if (
    state.graph.byId.get(a)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(b)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(c)?.kind !== "FREE_POINT"
  ) {
    return null;
  }

  return [a, b, c];
}

function selectedTriangle(state: AppState): NodeId | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 1) {
    return null;
  }

  const [triangle] = selected;

  if (!triangle || state.graph.byId.get(triangle)?.kind !== "TRIANGLE") {
    return null;
  }

  return triangle;
}
