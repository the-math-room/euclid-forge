import { evaluateGraph } from "@euclid-forge/core";
import { curveIntersectionCandidatesForScene } from "@euclid-forge/core";
import {
  centroidConstruction,
  circleConstruction,
  lineConstruction,
  parallelSegmentConstruction,
  perpendicularSegmentConstruction,
  segmentIntersectionConstruction,
  segmentMeasurementConstruction,
  segmentMidpointConstruction,
  segmentConstruction,
  triangleConstruction,
  triangleSideMidpointConstruction,
} from "@euclid-forge/core";
import { applyGraphEdit } from "@euclid-forge/core";
import { curveIntersectionNode } from "@euclid-forge/core";
import type { GeometryNode, GraphNode, NodeId } from "@euclid-forge/core";
import { deleteNodesDisabledReason } from "@euclid-forge/core";
import { isConstructiblePointNode, nextPointLabels } from "@euclid-forge/core";
import { appState } from "./appState";
import type { AppState } from "./appState";
import { clearEffectivelyHiddenSelection } from "./effectiveVisibility";
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
  selectedSegmentTuple,
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
        appState(state.graph, resetViewport(state.viewState), state.dragState),
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
    id: "create-line",
    keys: ["l"],
    disabledReason: (state) => (selectedSegmentEndpoints(state) ? null : ""),
    run: (state) => {
      const [a, b] = requireSelectedConstructiblePointTuple(
        state,
        2,
        "Cannot run create-line while disabled",
      );

      return commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: lineConstruction(state.graph, a, b),
          }),
          clearSelection(state.viewState),
          state.dragState,
        ),
      );
    },
  }),

  command({
    id: "create-parallel-segment",
    keys: ["p"],
    disabledReason: linearConstrainedSegmentDisabledReason,
    run: (state) => {
      const [reference, anchor] = requireSelectedLinearConstrainedSegmentInputs(state);
      const nodes = parallelSegmentConstruction(state.graph, reference, anchor);

      if (nodes.length === 0) {
        return ignore(state, "Parallel segment already exists.");
      }

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
    id: "create-perpendicular-segment",
    keys: ["o"],
    disabledReason: linearConstrainedSegmentDisabledReason,
    run: (state) => {
      const [reference, anchor] = requireSelectedLinearConstrainedSegmentInputs(state);
      const nodes = perpendicularSegmentConstruction(
        state.graph,
        reference,
        anchor,
      );

      if (nodes.length === 0) {
        return ignore(state, "Perpendicular segment already exists.");
      }

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
    id: "toggle-segment-measurement",
    keys: ["q"],
    disabledReason: segmentMeasurementDisabledReason,
    run: (state) => {
      const selectedSegment = requireSelectedSegmentTuple(
        state,
        1,
        "Cannot run toggle-segment-measurement while disabled",
      );
      const segment = selectedSegment[0];
      const existing = segmentMeasurementForSegment(state.graph.nodes, segment);

      if (existing) {
        return commit(
          appState(
            applyGraphEdit(state.graph, {
              kind: "DELETE_NODES",
              ids: [existing.id],
            }),
            state.viewState,
            state.dragState,
          ),
        );
      }

      return commit(
        appState(
          applyGraphEdit(state.graph, {
            kind: "ADD_NODES",
            nodes: segmentMeasurementConstruction(state.graph, segment),
          }),
          state.viewState,
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

      const nodes =
        nodeA?.kind === "SEGMENT" && nodeB?.kind === "SEGMENT"
          ? segmentIntersectionConstruction(state.graph, curveA, curveB)
          : curveIntersectionConstruction(state, curveA, curveB);

      if (nodes.length === 0) {
        return ignore(
          state,
          "No currently defined curve intersection candidates to create.",
        );
      }

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
    id: "create-midpoint",
    keys: ["m"],
    disabledReason: midpointDisabledReason,
    run: (state) => {
      const segment = selectedSegmentTuple(state, 1)?.[0];

      const nodes = segment
        ? segmentMidpointConstruction(state.graph, segment)
        : triangleSideMidpointConstruction(
            state.graph,
            requireSelectedTriangle(state),
          );

      if (nodes.length === 0) {
        return ignore(state, "Midpoint already exists.");
      }

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
        appState(state.graph, unhideAllNodes(state.viewState), state.dragState),
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

function ignore(state: AppState, statusMessage?: string): AppCommandResult {
  return Object.freeze({
    state,
    history: "ignore",
    ...(statusMessage === undefined ? {} : { statusMessage }),
  });
}

function viewportPanStep(state: AppState): number {
  return 40 / state.viewState.viewportZoom;
}

function curveIntersectionConstruction(
  state: AppState,
  curveA: NodeId,
  curveB: NodeId,
): readonly GeometryNode[] {
  if (curveA === curveB) {
    throw new Error("Cannot create curve intersections from duplicate curves");
  }

  const evaluated = evaluateGraph(state.graph);
  const result = curveIntersectionCandidatesForScene(evaluated, curveA, curveB);

  if (result.issue) {
    return Object.freeze([]);
  }

  const additions: GeometryNode[] = [];
  const labels = nextPointLabels(state.graph, result.candidates.length);
  let labelIndex = 0;

  for (const candidate of result.candidates) {
    const existing = [...state.graph.nodes, ...additions].find(
      (node) =>
        node.kind === "CURVE_INTERSECTION" &&
        sameUnorderedPair(node.curveA, node.curveB, curveA, curveB) &&
        node.branchKey === candidate.branchKey,
    );

    if (existing || existingEvaluatedPointAt(evaluated, candidate.point)) {
      continue;
    }

    const id = nextCurveIntersectionId(
      [...state.graph.nodes, ...additions],
      curveA,
      curveB,
      candidate.branchKey,
    );

    const label = labels[labelIndex];

    if (!label) {
      throw new Error("Internal curve intersection label allocation error");
    }

    labelIndex += 1;

    additions.push(
      curveIntersectionNode(id, curveA, curveB, candidate.branchKey, label),
    );
  }

  return Object.freeze(additions);
}

function existingEvaluatedPointAt(
  evaluated: ReturnType<typeof evaluateGraph>,
  point: Readonly<{ x: number; y: number }>,
): boolean {
  return evaluated.ordered.some(
    (value) =>
      value.kind === "POINT" &&
      Math.hypot(value.point.x - point.x, value.point.y - point.y) < 1e-9,
  );
}

function sameUnorderedPair(
  leftA: NodeId,
  leftB: NodeId,
  rightA: NodeId,
  rightB: NodeId,
): boolean {
  return (
    (leftA === rightA && leftB === rightB) ||
    (leftA === rightB && leftB === rightA)
  );
}

function nextCurveIntersectionId(
  nodes: readonly { id: NodeId }[],
  curveA: NodeId,
  curveB: NodeId,
  branchKey: string,
): NodeId {
  const base = `X_${curveA}_${curveB}_${safeIdPart(branchKey)}`;

  if (!nodes.some((node) => node.id === base)) {
    return base;
  }

  let index = 1;

  while (nodes.some((node) => node.id === `${base}_${index}`)) {
    index += 1;
  }

  return `${base}_${index}`;
}

function safeIdPart(value: string): string {
  return value.replace(/[^A-Za-z0-9_]+/g, "_");
}

function selectedLinearConstrainedSegmentInputs(
  state: AppState,
): readonly [NodeId, NodeId] | null {
  const selected = [...state.viewState.selectedNodeIds];

  if (selected.length !== 2) {
    return null;
  }

  const [first, second] = selected;

  if (!first || !second) {
    return null;
  }

  return linearConstrainedInputsForIds(state, first, second);
}

function requireSelectedLinearConstrainedSegmentInputs(
  state: AppState,
): readonly [NodeId, NodeId] {
  const inputs = selectedLinearConstrainedSegmentInputs(state);

  if (!inputs) {
    throw new Error("Cannot run linear constrained segment command while disabled");
  }

  return inputs;
}

function linearConstrainedInputsForIds(
  state: AppState,
  first: NodeId,
  second: NodeId,
): readonly [NodeId, NodeId] | null {
  const firstNode = state.graph.byId.get(first);
  const secondNode = state.graph.byId.get(second);

  if (isLinearNode(firstNode) && isPointNode(secondNode)) {
    return [first, second];
  }

  if (isPointNode(firstNode) && isLinearNode(secondNode)) {
    return [second, first];
  }

  return null;
}

function linearConstrainedSegmentDisabledReason(state: AppState): string | null {
  return selectedLinearConstrainedSegmentInputs(state)
    ? null
    : "Select one segment or line and one point.";
}

function segmentMeasurementDisabledReason(state: AppState): string | null {
  return selectedSegmentTuple(state, 1)
    ? null
    : "Select one segment to toggle its length measurement.";
}

function requireSelectedSegmentTuple(
  state: AppState,
  count: 1,
  message: string,
): readonly [NodeId] {
  const selected = selectedSegmentTuple(state, count);

  if (!selected) {
    throw new Error(message);
  }

  const [segment] = selected;

  if (!segment) {
    throw new Error(message);
  }

  return [segment];
}

function segmentMeasurementForSegment(
  nodes: readonly GraphNode[],
  segment: NodeId,
): Extract<GraphNode, { kind: "SEGMENT_MEASUREMENT" }> | null {
  const found = nodes.find(
    (node): node is Extract<GraphNode, { kind: "SEGMENT_MEASUREMENT" }> =>
      node.kind === "SEGMENT_MEASUREMENT" && node.segment === segment,
  );

  return found ?? null;
}

function isLinearNode(node: GraphNode | null | undefined): boolean {
  return node?.kind === "SEGMENT" || node?.kind === "LINE";
}

function isPointNode(node: GraphNode | null | undefined): boolean {
  return !!node && isConstructiblePointNode(node);
}

function segmentIntersectionDisabledReason(state: AppState): string | null {
  if (selectedConstructibleCurveTuple(state, 2)) {
    return null;
  }

  return "Select exactly two curve nodes, such as segments or circles, to create an intersection.";
}

function midpointDisabledReason(state: AppState): string | null {
  if (selectedSegmentTuple(state, 1) || selectedTriangle(state)) {
    return null;
  }

  return "Select one segment for its midpoint, or one triangle for side midpoints.";
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
