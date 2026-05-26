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
  evaluatedAnnotationItems,
  evaluatedGeometryItems,
  type EvaluatedScene,
  type EvaluationIssue,
  type EvaluationIssueSeverity,
} from "../evaluation/evaluateGraph";

export type {
  EvaluatedAnnotation,
  EvaluatedCircle,
  EvaluatedGeometry,
  EvaluatedLine,
  EvaluatedPoint,
  EvaluatedPointRole,
  EvaluatedSceneItem,
  EvaluatedSegment,
  EvaluatedSegmentMeasurement,
  EvaluatedTriangle,
} from "../evaluation/evaluated";

export type { EvaluationIssueCode } from "../evaluation/evaluationIssue";

export {
  segmentIntersectionConstruction,
  segmentMidpointConstruction,
  segmentConstruction,
  segmentMeasurementConstruction,
  lineConstruction,
  parallelSegmentConstruction,
  perpendicularSegmentConstruction,
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
  isAnnotationNode,
  isGeometryNode,
  isLinearNode,
  isSegmentNode,
} from "../representation/graphNode";


export {
  centroidNode,
  circleNode,
  curveIntersectionNode,
  freePoint,
  lineNode,
  linearConstrainedPointNode,
  midpointNode,
  segmentIntersectionNode,
  segmentMeasurementNode,
  segmentNode,
  triangleNode,
  type CentroidNode,
  type CircleNode,
  type CurveIntersectionNode,
  type AnnotationNode,
  type FreePointNode,
  type GeometryNode,
  type GraphNode,
  type LinearConstrainedPointNode,
  type LinearConstraintMode,
  type LineNode,
  type MidpointNode,
  type NodeId,
  type SegmentIntersectionNode,
  type SegmentMeasurementNode,
  type SegmentMeasurementPrecision,
  type SegmentNode,
  type TriangleNode,
} from "../representation/node";
export {
  centroid,
  deltaBetween,
  midpoint,
  segmentIntersection,
  segmentSegmentIntersections,
  vec2,
  type IntersectionCandidate,
  type IntersectionMultiplicity,
  type IntersectionResult,
  type LineIntersectionResult,
  type Vec2,
} from "../meaning/vec2";
export {
  visibleEvaluatedScene,
  type EvaluatedSceneVisibility,
} from "../evaluation/visibleScene";
export { curveIntersectionCandidatesForScene } from "../evaluation/curveIntersectionCandidates";
export {
  dependenciesOf,
  dependentsOf,
  transitiveDependentsOf,
} from "../representation/dependencies";
export {
  canDeleteNodes,
  cascadingDeleteIds,
  deleteNodesDisabledReason,
} from "../representation/deletePolicy";
export { isConstructibleCurveNode } from "../representation/curveNode";
export { isConstructiblePointNode } from "../representation/pointNode";

export {
  nextFreePointId,
  planFreePoint,
  type PlannedFreePoint,
} from "../representation/freePointPlanning";

export {
  alphabeticLabelForIndex,
  nextAlphabeticLabel,
  nextPointLabel,
  nextPointLabels,
} from "../representation/pointLabelPlanning";
