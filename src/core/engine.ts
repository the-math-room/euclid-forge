import { evaluateGraph } from "../evaluation/evaluateGraph";
import type {
  EvaluatedScene,
  EvaluationIssue,
} from "../evaluation/evaluateGraph";
import { applyGraphEdit } from "../representation/edit";
import type { GraphEdit } from "../representation/edit";
import type { Graph } from "../representation/graph";
import type { AppState } from "../app/appState";
import { appState } from "../app/appState";
import { emptyViewState } from "../app/viewState";
import type { SerializedWorkspace } from "../app/workspace";
import {
  deserializeWorkspace,
  serializeWorkspace,
} from "../app/workspace";

export type GeometryEngineInput = Graph | AppState | SerializedWorkspace;

export type GeometryEngine = Readonly<{
  graph: () => Graph;
  evaluate: () => EvaluatedScene;
  diagnostics: () => readonly EvaluationIssue[];
  applyEdit: (edit: GraphEdit) => GeometryEngine;
  serialize: () => SerializedWorkspace;
}>;

export function createGeometryEngine(input: GeometryEngineInput): GeometryEngine {
  return engineFromState(stateFromInput(input));
}

function engineFromState(state: AppState): GeometryEngine {
  return Object.freeze({
    graph: () => state.graph,

    evaluate: () => evaluateGraph(state.graph),

    diagnostics: () => evaluateGraph(state.graph).issues,

    applyEdit: (edit: GraphEdit): GeometryEngine =>
      engineFromState(
        appState(
          applyGraphEdit(state.graph, edit),
          state.viewState,
          null,
        ),
      ),

    serialize: () => serializeWorkspace(state),
  });
}

function stateFromInput(input: GeometryEngineInput): AppState {
  if ("version" in input && "nodes" in input && "view" in input) {
    return deserializeWorkspace(input);
  }

  if ("graph" in input && "viewState" in input && "dragState" in input) {
    return input;
  }

  return appState(input, emptyViewState(), null);
}
