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
  type SerializedWorkspaceView,
  type WorkspaceState,
} from "./workspace";

export {
  clearSelection,
  emptyViewState,
  hideSelectedNodes,
  panViewport,
  resetViewport,
  resetViewportRotation,
  rotateViewport,
  rotateViewportClockwise,
  rotateViewportCounterclockwise,
  setHoveredNode,
  setViewportCenter,
  setViewportRotation,
  setViewportZoom,
  toggleSelectedNode,
  unhideAllNodes,
  zoomViewport,
  type ViewState,
} from "./viewState";

export {
  screenToWorld,
  worldToScreen,
  type ScreenPoint,
  type Viewport,
} from "./viewport";

export {
  diagnosticsForNode,
  diagnosticsWithCode,
  diagnosticsWithSeverity,
} from "./diagnostics";

export {
  evaluateGraph,
  type EvaluatedScene,
  type EvaluationIssue,
  type EvaluationIssueSeverity,
} from "../evaluation/evaluateGraph";

export type {
  EvaluatedCircle,
  EvaluatedGeometry,
  EvaluatedLine,
  EvaluatedPoint,
  EvaluatedPointRole,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";

export type { EvaluationIssueCode } from "../evaluation/evaluationIssue";

export {
  segmentIntersectionConstruction,
  segmentConstruction,
  lineConstruction,
  circleConstruction,
  triangleConstruction,
  centroidConstruction,
  triangleSideMidpointConstruction,
} from "../representation/constructions";

export { applyGraphEdit, type GraphEdit } from "../representation/edit";

export {
  createGraph,
  type Graph,
  type SceneDraft,
} from "../representation/graph";

export {
  centroidNode,
  circleNode,
  curveIntersectionNode,
  freePoint,
  lineNode,
  midpointNode,
  segmentIntersectionNode,
  segmentNode,
  triangleNode,
  type CentroidNode,
  type CircleNode,
  type CurveIntersectionNode,
  type FreePointNode,
  type GeometryNode,
  type LineNode,
  type MidpointNode,
  type NodeId,
  type SegmentIntersectionNode,
  type SegmentNode,
  type TriangleNode,
} from "../representation/node";
