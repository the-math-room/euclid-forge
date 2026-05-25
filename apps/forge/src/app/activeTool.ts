import type { NodeId } from "@euclid-forge/core";

export type ActiveToolKind =
  | "select"
  | "lasso"
  | "point"
  | "segment"
  | "line"
  | "parallel"
  | "circle"
  | "triangle"
  | "midpoint"
  | "intersection"
  | "delete";

export type ConstructionToolKind =
  | "segment"
  | "line"
  | "parallel"
  | "circle"
  | "triangle"
  | "midpoint"
  | "intersection";

export type PointInputToolKind = Exclude<
  ConstructionToolKind,
  "intersection" | "parallel"
>;

export type SelectTool = Readonly<{
  kind: "select";
}>;

export type LassoTool = Readonly<{
  kind: "lasso";
}>;

export type PointTool = Readonly<{
  kind: "point";
}>;

export type DeleteTool = Readonly<{
  kind: "delete";
}>;

export type SegmentTool = Readonly<{
  kind: "segment";
  inputs: readonly NodeId[];
}>;

export type LineTool = Readonly<{
  kind: "line";
  inputs: readonly NodeId[];
}>;

export type ParallelTool = Readonly<{
  kind: "parallel";
  inputs: readonly NodeId[];
}>;

export type CircleTool = Readonly<{
  kind: "circle";
  inputs: readonly NodeId[];
}>;

export type TriangleTool = Readonly<{
  kind: "triangle";
  inputs: readonly NodeId[];
}>;

export type MidpointTool = Readonly<{
  kind: "midpoint";
  inputs: readonly NodeId[];
}>;

export type IntersectionTool = Readonly<{
  kind: "intersection";
  inputs: readonly NodeId[];
}>;

export type PointInputTool =
  | SegmentTool
  | LineTool
  | CircleTool
  | TriangleTool
  | MidpointTool;

export type ConstructionTool = PointInputTool | ParallelTool | IntersectionTool;

export type ActiveTool =
  | SelectTool
  | LassoTool
  | PointTool
  | DeleteTool
  | ConstructionTool;

export function emptyActiveTool(): ActiveTool {
  return { kind: "select" };
}

export function lassoTool(): ActiveTool {
  return { kind: "lasso" };
}

export function pointTool(): ActiveTool {
  return { kind: "point" };
}

export function deleteTool(): ActiveTool {
  return { kind: "delete" };
}

export function constructionTool(kind: ConstructionToolKind): ConstructionTool {
  return {
    kind,
    inputs: [],
  };
}

export function activeToolInputCount(tool: ActiveTool): number {
  return hasToolInputs(tool) ? tool.inputs.length : 0;
}

export function activeToolRequiredInputCount(tool: ActiveTool): number {
  switch (tool.kind) {
    case "select":
    case "lasso":
    case "point":
    case "delete":
      return 0;

    case "segment":
    case "line":
    case "parallel":
    case "circle":
    case "midpoint":
    case "intersection":
      return 2;

    case "triangle":
      return 3;
  }
}

export function activeToolAcceptsPointInput(tool: ActiveTool): boolean {
  switch (tool.kind) {
    case "segment":
    case "line":
    case "parallel":
    case "circle":
    case "midpoint":
    case "triangle":
      return true;

    case "select":
    case "lasso":
    case "point":
    case "delete":
    case "intersection":
      return false;
  }
}

export function activeToolAcceptsCurveInput(tool: ActiveTool): boolean {
  return tool.kind === "intersection" || tool.kind === "parallel";
}

export function activeToolIsReadyToCommit(tool: ActiveTool): boolean {
  const required = activeToolRequiredInputCount(tool);

  return required > 0 && activeToolInputCount(tool) >= required;
}

export function appendActiveToolInput<T extends ConstructionTool>(
  tool: T,
  input: NodeId,
): T;
export function appendActiveToolInput(
  tool: ActiveTool,
  input: NodeId,
): ActiveTool;
export function appendActiveToolInput(
  tool: ActiveTool,
  input: NodeId,
): ActiveTool {
  if (!hasToolInputs(tool)) {
    return tool;
  }

  if (tool.inputs.includes(input)) {
    return tool;
  }

  const required = activeToolRequiredInputCount(tool);

  return {
    ...tool,
    inputs: [...tool.inputs, input].slice(0, required),
  };
}

export function resetActiveToolInputs<T extends ConstructionTool>(tool: T): T;
export function resetActiveToolInputs(tool: ActiveTool): ActiveTool;
export function resetActiveToolInputs(tool: ActiveTool): ActiveTool {
  if (!hasToolInputs(tool)) {
    return tool;
  }

  return {
    ...tool,
    inputs: [],
  };
}

export function activeToolStatusText(tool: ActiveTool): string {
  switch (tool.kind) {
    case "select":
      return "Select or drag geometry.";

    case "lasso":
      return "Lasso tool: drag around geometry to select fully contained objects.";

    case "point":
      return "Point tool: click or tap empty canvas to create a point.";

    case "delete":
      return "Delete tool: click or tap geometry to delete it.";

    case "segment":
      return constructionStatus(tool, "Segment tool", "point");

    case "line":
      return constructionStatus(tool, "Line tool", "point");

    case "parallel":
      if (tool.inputs.length === 0) {
        return "Parallel tool: choose a reference segment or line.";
      }

      return "Parallel tool: choose an anchor point, or click empty canvas to create one.";

    case "circle":
      if (tool.inputs.length === 0) {
        return "Circle tool: choose the center point.";
      }

      return "Circle tool: choose a radius point.";

    case "triangle":
      return constructionStatus(tool, "Triangle tool", "point");

    case "midpoint":
      return constructionStatus(tool, "Midpoint tool", "point");

    case "intersection":
      return constructionStatus(tool, "Intersection tool", "curve");
  }
}

export function hasToolInputs(tool: ActiveTool): tool is ConstructionTool {
  return "inputs" in tool;
}

function constructionStatus(
  tool: ConstructionTool,
  label: string,
  inputName: string,
): string {
  const required = activeToolRequiredInputCount(tool);
  const next = tool.inputs.length + 1;

  if (tool.inputs.length >= required) {
    return `${label}: ready.`;
  }

  return `${label}: choose ${inputName} ${next} of ${required}.`;
}
