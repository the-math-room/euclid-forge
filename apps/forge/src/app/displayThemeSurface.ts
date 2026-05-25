export type CanvasDisplayMode = "dark" | "high-contrast";
export type CanvasDisplayScale = "normal" | "large" | "extra-large";

export type CanvasDisplaySettings = Readonly<{
  mode: CanvasDisplayMode;
  scale: CanvasDisplayScale;
}>;

export type DisplayThemeSurfaceHandlers = Readonly<{
  onSettingsChange: (settings: CanvasDisplaySettings) => void;
}>;

export type DisplayThemeSurface = Readonly<{
  root: HTMLElement;
  update: (settings: CanvasDisplaySettings) => void;
}>;

const DISPLAY_SCALES: readonly CanvasDisplayScale[] = [
  "normal",
  "large",
  "extra-large",
];

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

  let currentSettings: CanvasDisplaySettings = {
    mode: "dark",
    scale: "normal",
  };

  const root = document.createElement("section");
  root.id = "display-theme-surface";
  root.setAttribute("aria-label", "Canvas display settings");

  const themeButton = document.createElement("button");
  themeButton.type = "button";
  themeButton.className =
    "display-theme-surface__button display-theme-surface__theme-button";

  themeButton.addEventListener("click", () => {
    handlers.onSettingsChange({
      ...currentSettings,
      mode: currentSettings.mode === "dark" ? "high-contrast" : "dark",
    });
  });

  const sizeGroup = document.createElement("div");
  sizeGroup.className = "display-theme-surface__size";
  sizeGroup.setAttribute("aria-label", "Canvas size");

  const decreaseButton = document.createElement("button");
  decreaseButton.type = "button";
  decreaseButton.className = "display-theme-surface__button";
  decreaseButton.textContent = "−";
  decreaseButton.title = "Decrease canvas line and label size";
  decreaseButton.setAttribute(
    "aria-label",
    "Decrease canvas line and label size",
  );
  decreaseButton.addEventListener("click", () => {
    handlers.onSettingsChange({
      ...currentSettings,
      scale: previousScale(currentSettings.scale),
    });
  });

  const sizeLabel = document.createElement("span");
  sizeLabel.className = "display-theme-surface__size-label";

  const increaseButton = document.createElement("button");
  increaseButton.type = "button";
  increaseButton.className = "display-theme-surface__button";
  increaseButton.textContent = "+";
  increaseButton.title = "Increase canvas line and label size";
  increaseButton.setAttribute(
    "aria-label",
    "Increase canvas line and label size",
  );
  increaseButton.addEventListener("click", () => {
    handlers.onSettingsChange({
      ...currentSettings,
      scale: nextScale(currentSettings.scale),
    });
  });

  sizeGroup.append(decreaseButton, sizeLabel, increaseButton);
  root.append(themeButton, sizeGroup);
  app.append(root);

  return {
    root,
    update(settings) {
      currentSettings = settings;
      updateDisplayThemeSurface(root, settings);
    },
  };
}

export function updateDisplayThemeSurface(
  root: HTMLElement,
  settings: CanvasDisplaySettings,
): void {
  const themeButton = root.querySelector<HTMLButtonElement>(
    ".display-theme-surface__theme-button",
  );
  const decreaseButton = root.querySelector<HTMLButtonElement>(
    ".display-theme-surface__size button:first-child",
  );
  const increaseButton = root.querySelector<HTMLButtonElement>(
    ".display-theme-surface__size button:last-child",
  );
  const sizeLabel = root.querySelector<HTMLElement>(
    ".display-theme-surface__size-label",
  );

  if (!themeButton || !decreaseButton || !increaseButton || !sizeLabel) {
    throw new Error("Missing display theme controls");
  }

  themeButton.dataset.mode = settings.mode;
  themeButton.setAttribute(
    "aria-pressed",
    settings.mode === "high-contrast" ? "true" : "false",
  );
  themeButton.textContent =
    settings.mode === "high-contrast" ? "Dark canvas" : "High contrast";
  themeButton.title =
    settings.mode === "high-contrast"
      ? "Switch back to the dark canvas theme"
      : "Use black geometry on a white canvas";

  const scaleIndex = DISPLAY_SCALES.indexOf(settings.scale);
  decreaseButton.disabled = scaleIndex <= 0;
  increaseButton.disabled = scaleIndex >= DISPLAY_SCALES.length - 1;
  sizeLabel.textContent = scaleLabel(settings.scale);
}

function previousScale(scale: CanvasDisplayScale): CanvasDisplayScale {
  const index = DISPLAY_SCALES.indexOf(scale);

  return DISPLAY_SCALES[Math.max(0, index - 1)] ?? "normal";
}

function nextScale(scale: CanvasDisplayScale): CanvasDisplayScale {
  const index = DISPLAY_SCALES.indexOf(scale);

  return (
    DISPLAY_SCALES[Math.min(DISPLAY_SCALES.length - 1, index + 1)] ?? "normal"
  );
}

function scaleLabel(scale: CanvasDisplayScale): string {
  switch (scale) {
    case "normal":
      return "Normal";

    case "large":
      return "Large";

    case "extra-large":
      return "XL";
  }
}
