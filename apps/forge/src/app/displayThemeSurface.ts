export type CanvasDisplayMode = "dark" | "high-contrast";

export type DisplayThemeSurfaceHandlers = Readonly<{
  onModeChange: (mode: CanvasDisplayMode) => void;
}>;

export type DisplayThemeSurface = Readonly<{
  root: HTMLElement;
  update: (mode: CanvasDisplayMode) => void;
}>;

export function installDisplayThemeSurface(
  document: Document,
  handlers: DisplayThemeSurfaceHandlers,
): DisplayThemeSurface {
  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const existing = document.querySelector<HTMLElement>(
    "#display-theme-surface",
  );

  if (existing) {
    existing.remove();
  }

  const root = document.createElement("section");
  root.id = "display-theme-surface";
  root.setAttribute("aria-label", "Canvas display theme");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "display-theme-surface__button";

  button.addEventListener("click", () => {
    const currentMode = modeFromButton(button);
    handlers.onModeChange(currentMode === "dark" ? "high-contrast" : "dark");
  });

  root.append(button);
  app.append(root);

  return {
    root,
    update(mode) {
      updateDisplayThemeSurface(root, mode);
    },
  };
}

export function updateDisplayThemeSurface(
  root: HTMLElement,
  mode: CanvasDisplayMode,
): void {
  const button = root.querySelector<HTMLButtonElement>(
    ".display-theme-surface__button",
  );

  if (!button) {
    throw new Error("Missing display theme button");
  }

  button.dataset.mode = mode;
  button.setAttribute(
    "aria-pressed",
    mode === "high-contrast" ? "true" : "false",
  );
  button.textContent =
    mode === "high-contrast" ? "Dark canvas" : "High contrast";
  button.title =
    mode === "high-contrast"
      ? "Switch back to the dark canvas theme"
      : "Use black geometry on a white canvas";
}

function modeFromButton(button: HTMLButtonElement): CanvasDisplayMode {
  return button.dataset.mode === "high-contrast" ? "high-contrast" : "dark";
}
