export type StatusSurface = Readonly<{
  show: (message: string) => void;
  clear: () => void;
}>;

export function statusSurfaceForDocument(document: Document): StatusSurface {
  const element = getOrCreateStatusElement(document);

  return Object.freeze({
    show(message: string): void {
      element.textContent = message;
      element.hidden = false;
    },

    clear(): void {
      element.textContent = "";
      element.hidden = true;
    },
  });
}

function getOrCreateStatusElement(document: Document): HTMLElement {
  const existing = document.querySelector<HTMLElement>("#status-message");

  if (existing) {
    return existing;
  }

  const app = document.querySelector<HTMLElement>("#app");

  if (!app) {
    throw new Error("Missing #app");
  }

  const status = document.createElement("div");
  status.id = "status-message";
  status.role = "status";
  status.setAttribute("aria-live", "polite");
  status.hidden = true;

  app.append(status);

  return status;
}
