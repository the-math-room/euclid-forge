import {
  activeToolStatusText,
  constructionTool,
  deleteTool,
  emptyActiveTool,
  lassoTool,
  pointTool,
  type ActiveTool,
  type ActiveToolKind,
} from "./activeTool";

export type ToolSurfaceHandlers = Readonly<{
  onToolChange: (tool: ActiveTool) => void;
}>;

export type ToolSurface = Readonly<{
  root: HTMLElement;
  update: (tool: ActiveTool) => void;
}>;

type ToolButtonSpec = Readonly<{
  kind: ActiveToolKind;
  label: string;
  title: string;
  tool: () => ActiveTool;
}>;

const TOOL_BUTTONS: readonly ToolButtonSpec[] = [
  {
    kind: "select",
    label: "Move",
    title: "Select and move geometry",
    tool: emptyActiveTool,
  },
  {
    kind: "lasso",
    label: "Lasso",
    title: "Select fully contained geometry with a lasso",
    tool: lassoTool,
  },
  {
    kind: "point",
    label: "Point",
    title: "Create points",
    tool: pointTool,
  },
  {
    kind: "segment",
    label: "Segment",
    title: "Create a segment from two points",
    tool: () => constructionTool("segment"),
  },
  {
    kind: "parallel",
    label: "Parallel",
    title: "Create a finite segment parallel to a selected segment or line",
    tool: () => constructionTool("parallel"),
  },
  {
    kind: "perpendicular",
    label: "Perp",
    title: "Create a finite segment perpendicular to a selected segment or line",
    tool: () => constructionTool("perpendicular"),
  },
  {
    kind: "circle",
    label: "Circle",
    title: "Create a circle from center and radius points",
    tool: () => constructionTool("circle"),
  },
  {
    kind: "triangle",
    label: "Triangle",
    title: "Create a triangle from three points",
    tool: () => constructionTool("triangle"),
  },
  {
    kind: "delete",
    label: "Delete",
    title: "Delete clicked geometry",
    tool: deleteTool,
  },
];

export function installToolSurface(
  document: Document,
  handlers: ToolSurfaceHandlers,
): ToolSurface {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const existing = document.querySelector<HTMLElement>("#tool-surface");

  if (existing) {
    existing.remove();
  }

  const root = document.createElement("section");
  root.id = "tool-surface";
  root.setAttribute("aria-label", "Geometry tools");

  const buttonRow = document.createElement("div");
  buttonRow.className = "tool-surface__buttons";

  const status = document.createElement("div");
  status.className = "tool-surface__status";
  status.setAttribute("aria-live", "polite");

  for (const spec of TOOL_BUTTONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-surface__button";
    button.dataset.tool = spec.kind;
    button.title = spec.title;
    button.textContent = spec.label;
    button.addEventListener("click", () => {
      handlers.onToolChange(spec.tool());
    });

    buttonRow.append(button);
  }


  root.append(buttonRow, status);
  app.append(root);

  return {
    root,
    update(tool) {
      updateToolSurface(root, tool);
    },
  };
}

export function updateToolSurface(root: HTMLElement, tool: ActiveTool): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    ".tool-surface__button",
  )) {
    const isActive = button.dataset.tool === tool.kind;

    button.classList.toggle("tool-surface__button--active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }

  const status = root.querySelector<HTMLElement>(".tool-surface__status");

  if (!status) {
    throw new Error("Missing tool surface status");
  }

  status.textContent = activeToolStatusText(tool);
}
