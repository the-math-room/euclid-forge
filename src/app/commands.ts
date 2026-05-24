import {
  centroidConstruction,
  circleConstruction,
  triangleConstruction,
  triangleSideMidpointConstruction,
} from "../representation/constructions";
import { applyGraphEdit } from "../representation/edit";
import {
  deleteNodesDisabledReason,
} from "../representation/deletePolicy";
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
  disabledReason: (state: AppState) => string | null;
  run: (state: AppState) => AppCommandResult;
}>;

export const APP_COMMANDS: readonly AppCommand[] = Object.freeze([
  command({
    id: "pan-viewport-left",
    keys: ["arrowleft"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          panViewport(state.viewState, { x: -viewportPanStep(state), y: 0 }),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "pan-viewport-right",
    keys: ["arrowright"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          panViewport(state.viewState, { x: viewportPanStep(state), y: 0 }),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "pan-viewport-up",
    keys: ["arrowup"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          panViewport(state.viewState, { x: 0, y: viewportPanStep(state) }),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "pan-viewport-down",
    keys: ["arrowdown"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          panViewport(state.viewState, { x: 0, y: -viewportPanStep(state) }),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "zoom-viewport-in",
    keys: ["+", "="],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          zoomViewport(state.viewState, 1.25),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "zoom-viewport-out",
    keys: ["-", "_"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          zoomViewport(state.viewState, 0.8),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "reset-viewport",
    keys: ["0"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          resetViewport(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "rotate-viewport-counterclockwise",
    keys: ["["],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          rotateViewportCounterclockwise(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "rotate-viewport-clockwise",
    keys: ["]"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          rotateViewportClockwise(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "reset-viewport-rotation",
    keys: ["\\"],
    run: (state) =>
      ignore(
        appState(
          state.graph,
          resetViewportRotation(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "create-triangle",
    keys: ["t"],
    disabledReason: (state) =>
      selectedFreePointVertices(state) ? null : "",
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: triangleConstruction(
              state.graph,
              requireSelectedFreePointVertices(state),
            ),
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "create-circle",
    keys: ["c"],
    disabledReason: (state) => (selectedCirclePoints(state) ? null : ""),
    run: (state) => {
      const [center, through] = requireSelectedCirclePoints(state);

      return commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: circleConstruction(state.graph, center, through),
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      );
    },
  }),


  command({
    id: "create-centroid",
    keys: ["g"],
    disabledReason: (state) => (selectedTriangle(state) ? null : ""),
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: centroidConstruction(
              state.graph,
              requireSelectedTriangle(state),
            ),
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "create-side-midpoints",
    keys: ["m"],
    disabledReason: (state) => (selectedTriangle(state) ? null : ""),
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: triangleSideMidpointConstruction(
              state.graph,
              requireSelectedTriangle(state),
            ),
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "delete-selected",
    keys: ["delete", "backspace"],
    disabledReason: deleteSelectedDisabledReason,
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "DELETE_NODES",
            ids: [...state.viewState.selectedNodeIds],
          }),
          clearSelection(state.viewState),
          null,
        ),
      ),
  }),

  command({
    id: "hide-selected",
    keys: ["h"],
    disabledReason: (state) =>
      state.viewState.selectedNodeIds.size > 0 ? null : "",
    run: (state) =>
      commit(
        appState(
          state.graph,
          clearEffectivelyHiddenSelection(
            state.graph,
            hideSelectedNodes(state.viewState),
          ),
          state.dragState,
        ),
      ),
  }),

  command({
    id: "unhide-all",
    keys: ["u"],
    disabledReason: (state) =>
      state.viewState.hiddenNodeIds.size > 0 ? null : "",
    run: (state) =>
      commit(
        appState(
          state.graph,
          unhideAllNodes(state.viewState),
          state.dragState,
        ),
      ),
  }),
]);

export function appCommandForKey(key: string): AppCommand | null {
  const normalized = normalizeCommandKey(key);

  return (
    APP_COMMANDS.find((command) => command.keys.includes(normalized)) ?? null
  );
}

export function appCommandDisabledReason(
  command: AppCommand,
  state: AppState,
): string | null {
  return command.disabledReason(state);
}

type CommandInit = Readonly<{
  id: string;
  keys: readonly string[];
  disabledReason?: (state: AppState) => string | null;
  run: AppCommand["run"];
}>;

function command(init: CommandInit): AppCommand {
  return Object.freeze({
    id: init.id,
    keys: Object.freeze(init.keys.map(normalizeCommandKey)),
    disabledReason: init.disabledReason ?? (() => null),
    run: init.run,
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

function selectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 2) {
    return null;
  }

  const [center, through] = selected;

  if (!center || !through) {
    return null;
  }

  if (
    state.graph.byId.get(center)?.kind !== "FREE_POINT" ||
    state.graph.byId.get(through)?.kind !== "FREE_POINT"
  ) {
    return null;
  }

  return [center, through];
}

function requireSelectedCirclePoints(
  state: AppState,
): readonly [NodeId, NodeId] {
  const points = selectedCirclePoints(state);

  if (!points) {
    throw new Error("Cannot run create-circle while disabled");
  }

  return points;
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

function requireSelectedFreePointVertices(
  state: AppState,
): readonly [NodeId, NodeId, NodeId] {
  const vertices = selectedFreePointVertices(state);

  if (!vertices) {
    throw new Error("Cannot run create-triangle while disabled");
  }

  return vertices;
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

function requireSelectedTriangle(state: AppState): NodeId {
  const triangle = selectedTriangle(state);

  if (!triangle) {
    throw new Error("Cannot run triangle command while disabled");
  }

  return triangle;
}

function deleteSelectedDisabledReason(state: AppState): string | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length === 0) {
    return "";
  }

  return deleteNodesDisabledReason(state.graph, selected);
}
