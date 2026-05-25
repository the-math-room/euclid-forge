export {
  createGeometryEngine,
  type GeometryEngine,
  type GeometryEngineInput,
  type GeometryEngineState,
} from "./engine";

export {
  deserializeWorkspace,
  geometryWorkspaceFromJsonText,
  parseGeometryWorkspace,
  parseSerializedWorkspace,
  serializeWorkspace,
  type GeometryWorkspace,
  type SerializedWorkspace,
  type WorkspaceState,
} from "./workspace";

export type {
  EvaluatedScene,
  EvaluationIssue,
} from "../evaluation/evaluateGraph";

export type {
  GraphEdit,
} from "../representation/edit";

export type {
  Graph,
} from "../representation/graph";

export type {
  GeometryNode,
  NodeId,
} from "../representation/node";

export {
  diagnosticsForNode,
  diagnosticsWithCode,
  diagnosticsWithSeverity,
} from "./diagnostics";
