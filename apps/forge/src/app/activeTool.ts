import type { NodeId } from "@euclid-forge/core";

export type ActiveToolKind =
  | "select"
  | "point"
  | "segment"
  | "line"
  | "circle"
  | "triangle"
  | "midpoint"
  | "intersection"
  | "delete";

export type ConstructionToolKind = Exclude<ActiveToolKind, "select" | "point">;

export type ActiveTool = Readonly<
  | {
      kind: "select";
    }
  | {
      kind: "point";
    }
  | {
      kind: "delete";
    }
  | {
      kind: ConstructionToolKind;
      inputs: readonly NodeId[];
    }
>;

export function emptyActiveTool(): ActiveTool {
  return { kind: "select" };
}

export function pointTool(): ActiveTool {
  return { kind: "point" };
}

export function deleteTool(): ActiveTool {
  return { kind: "delete" };
}

export function constructionTool(kind: ConstructionToolKind): ActiveTool {
  return {
    kind,
    inputs: [],
  };
}

export function activeToolInputCount(tool: ActiveTool): number {
  return "inputs" in tool ? tool.inputs.length : 0;
}

export function activeToolRequiredInputCount(tool: ActiveTool): number {
  switch (tool.kind) {
    case "select":
    case "point":
    case "delete":
      return 0;

    case "segment":
    case "line":
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
    case "circle":
    case "midpoint":
    case "triangle":
      return true;

    case "select":
    case "point":
    case "delete":
    case "intersection":
      return false;
  }
}

export function activeToolAcceptsCurveInput(tool: ActiveTool): boolean {
  return tool.kind === "intersection";
}

export function activeToolIsReadyToCommit(tool: ActiveTool): boolean {
  const required = activeToolRequiredInputCount(tool);

  return required > 0 && activeToolInputCount(tool) >= required;
}

export function appendActiveToolInput(
  tool: ActiveTool,
  input: NodeId,
): ActiveTool {
  if (!("inputs" in tool)) {
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

export function resetActiveToolInputs(tool: ActiveTool): ActiveTool {
  if (!("inputs" in tool)) {
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

    case "point":
      return "Point tool: click or tap empty canvas to create a point.";

    case "delete":
      return "Delete tool: click or tap geometry to delete it.";

    case "segment":
      return constructionStatus(tool, "Segment tool", "point");

    case "line":
      return constructionStatus(tool, "Line tool", "point");

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

function constructionStatus(
  tool: Extract<ActiveTool, { inputs: readonly NodeId[] }>,
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
