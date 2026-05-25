import {
  centroidConstruction,
  circleConstruction,
  segmentIntersectionConstruction,
  segmentConstruction,
  triangleConstruction,
  triangleSideMidpointConstruction,
} from "../representation/constructions";
import { applyGraphEdit } from "../representation/edit";
import {
  deleteNodesDisabledReason,
} from "../representation/deletePolicy";
import { appState } from "./appState";
import type { AppState } from "./appState";
import {
  clearEffectivelyHiddenSelection,
} from "./effectiveVisibility";
import {
  requireSelectedCirclePoints,
  requireSelectedConstructibleCurveTuple,
  requireSelectedSegmentEndpoints,
  requireSelectedConstructiblePointTuple,
  requireSelectedFreePointVertices,
  requireSelectedTriangle,
  selectedCirclePoints,
  selectedConstructibleCurveTuple,
  selectedSegmentEndpoints,
  selectedFreePointVertices,
  selectedTriangle,
} from "./selectionPredicates";
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
import {
  bringNodesForward,
  bringNodesToFront,
  sendNodesBackward,
  sendNodesToBack,
} from "./zOrder";

export type CommandHistoryPolicy = "commit" | "ignore";

export type AppCommandResult = Readonly<{
  state: AppState;
  history: CommandHistoryPolicy;
  statusMessage?: string;
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
    id: "join-selected-free-points",
    keys: ["j"],
    disabledReason: (state) =>
      selectedSegmentEndpoints(state) || selectedFreePointVertices(state)
        ? null
        : "",
    run: (state) => {
      const selectedCount = state.viewState.selectedNodeIds.size;
      const nodes =
        selectedCount === 2
          ? segmentConstruction(
              state.graph,
              ...requireSelectedConstructiblePointTuple(
                state,
                2,
                "Cannot run join-selected-free-points while disabled",
              ),
            )
          : triangleConstruction(
              state.graph,
              requireSelectedConstructiblePointTuple(
                state,
                3,
                "Cannot run join-selected-free-points while disabled",
              ),
            );

      return commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes,
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      );
    },
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
    id: "create-segment-intersection",
    keys: ["i"],
    disabledReason: segmentIntersectionDisabledReason,
    run: (state) => {
      const [curveA, curveB] = requireSelectedConstructibleCurveTuple(
        state,
        2,
        "Cannot run create-segment-intersection while disabled",
      );
      const nodeA = state.graph.byId.get(curveA);
      const nodeB = state.graph.byId.get(curveB);

      if (nodeA?.kind !== "SEGMENT" || nodeB?.kind !== "SEGMENT") {
        return ignore(
          state,
          "Curve intersection candidates are available in the meaning layer, but only segment-segment intersections can be persisted as graph nodes yet.",
        );
      }

      return commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: segmentIntersectionConstruction(
              state.graph,
              curveA,
              curveB,
            ),
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
    id: "bring-selected-forward",
    keys: ["pageup"],
    disabledReason: selectedNodesDisabledReason,
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_NODE_Z_INDICES",
            zIndices: bringNodesForward(
              state.graph,
              state.viewState.selectedNodeIds,
            ),
          }),
          state.viewState,
          state.dragState,
        ),
      ),
  }),

  command({
    id: "send-selected-backward",
    keys: ["pagedown"],
    disabledReason: selectedNodesDisabledReason,
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_NODE_Z_INDICES",
            zIndices: sendNodesBackward(
              state.graph,
              state.viewState.selectedNodeIds,
            ),
          }),
          state.viewState,
          state.dragState,
        ),
      ),
  }),

  command({
    id: "bring-selected-to-front",
    keys: ["shift+pageup"],
    disabledReason: selectedNodesDisabledReason,
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_NODE_Z_INDICES",
            zIndices: bringNodesToFront(
              state.graph,
              state.viewState.selectedNodeIds,
            ),
          }),
          state.viewState,
          state.dragState,
        ),
      ),
  }),

  command({
    id: "send-selected-to-back",
    keys: ["shift+pagedown"],
    disabledReason: selectedNodesDisabledReason,
    run: (state) =>
      commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "SET_NODE_Z_INDICES",
            zIndices: sendNodesToBack(
              state.graph,
              state.viewState.selectedNodeIds,
            ),
          }),
          state.viewState,
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

export type AppCommandKeyModifiers = Readonly<{
  shiftKey?: boolean;
}>;

export function appCommandForKey(
  key: string,
  modifiers: AppCommandKeyModifiers = {},
): AppCommand | null {
  const normalized = normalizeCommandKey(key);
  const shifted = modifiers.shiftKey
    ? normalizeCommandKey(`shift+${key}`)
    : null;

  return (
    (shifted
      ? APP_COMMANDS.find((command) => command.keys.includes(shifted))
      : null) ??
    APP_COMMANDS.find((command) => command.keys.includes(normalized)) ??
    null
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

function ignore(
  state: AppState,
  statusMessage?: string,
): AppCommandResult {
  return Object.freeze({
    state,
    history: "ignore",
    ...(statusMessage === undefined ? {} : { statusMessage }),
  });
}

function viewportPanStep(state: AppState): number {
  return 40 / state.viewState.viewportZoom;
}


function segmentIntersectionDisabledReason(state: AppState): string | null {
  if (selectedConstructibleCurveTuple(state, 2)) {
    return null;
  }

  return "Select exactly two curve nodes, such as segments or circles, to create an intersection.";
}

function selectedNodesDisabledReason(state: AppState): string | null {
  return state.viewState.selectedNodeIds.size > 0 ? null : "";
}

function deleteSelectedDisabledReason(state: AppState): string | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length === 0) {
    return "";
  }

  return deleteNodesDisabledReason(state.graph, selected);
}
