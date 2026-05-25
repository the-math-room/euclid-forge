import { evaluateGraph } from "../evaluation/evaluateGraph";
import type {
  EvaluatedScene,
  EvaluationIssue,
} from "../evaluation/evaluateGraph";
import {
  dependenciesOf,
  dependentsOf,
  transitiveDependentsOf,
} from "../representation/dependencies";
import { applyGraphEdit } from "../representation/edit";
import type { GraphEdit } from "../representation/edit";
import type { Graph } from "../representation/graph";
import type { NodeId } from "../representation/node";
import type { AppState } from "../app/appState";
import { appState } from "../app/appState";
import { emptyViewState } from "../app/viewState";
import type { GeometryWorkspace } from "./workspace";
import {
  deserializeWorkspace,
  serializeWorkspace,
} from "../app/workspace";

export type GeometryEngineInput = Graph | AppState | GeometryWorkspace;

export type GeometryEngine = Readonly<{
  graph: () => Graph;
  evaluate: () => EvaluatedScene;
  diagnostics: () => readonly EvaluationIssue[];
  dependenciesOf: (id: NodeId) => readonly NodeId[];
  dependentsOf: (id: NodeId) => readonly NodeId[];
  transitiveDependentsOf: (ids: Iterable<NodeId>) => ReadonlySet<NodeId>;
  applyEdit: (edit: GraphEdit) => GeometryEngine;
  serialize: () => GeometryWorkspace;
}>;

export function createGeometryEngine(input: GeometryEngineInput): GeometryEngine {
  return engineFromState(stateFromInput(input));
}

function engineFromState(state: AppState): GeometryEngine {
  return Object.freeze({
    graph: () => state.graph,

    evaluate: () => evaluateGraph(state.graph),

    diagnostics: () => evaluateGraph(state.graph).issues,

    dependenciesOf: (id: NodeId): readonly NodeId[] => {
      const node = state.graph.byId.get(id);

      if (!node) {
        throw new Error(`Cannot inspect dependencies for missing node: ${id}`);
      }

      return dependenciesOf(node);
    },

    dependentsOf: (id: NodeId): readonly NodeId[] =>
      dependentsOf(state.graph, id),

    transitiveDependentsOf: (ids: Iterable<NodeId>): ReadonlySet<NodeId> =>
      transitiveDependentsOf(state.graph, ids),

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
