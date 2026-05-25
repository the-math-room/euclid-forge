import { geometryWorkspaceFromJsonText } from "../core/workspace";
import type { SerializedWorkspace } from "../core/workspace";
import {
  parseSerializedWorkspace,
  serializeWorkspace,
} from "../core/workspace";
import type { AppState } from "./appState";

export const WORKSPACE_FILE_EXTENSION = ".euclid-forge.json";
export const WORKSPACE_MIME_TYPE = "application/json";

export function workspaceJsonFromState(state: AppState): string {
  return `${JSON.stringify(serializeWorkspace(state), null, 2)}\n`;
}

export function workspaceFromJsonText(text: string) {
  return geometryWorkspaceFromJsonText(text);
}

export function defaultWorkspaceFileName(date = new Date()): string {
  const timestamp = date
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d{3}Z$/, "Z");

  return `euclid-forge-${timestamp}${WORKSPACE_FILE_EXTENSION}`;
}

export function downloadWorkspaceJson(
  document: Document,
  urlApi: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">,
  state: AppState,
  fileName = defaultWorkspaceFileName(),
): void {
  const blob = new Blob([workspaceJsonFromState(state)], {
    type: WORKSPACE_MIME_TYPE,
  });
  const url = urlApi.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    link.style.display = "none";

    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    urlApi.revokeObjectURL(url);
  }
}

export function chooseWorkspaceFile(
  document: Document,
): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = `${WORKSPACE_MIME_TYPE},${WORKSPACE_FILE_EXTENSION}`;
    input.style.display = "none";

    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0] ?? null;

        input.remove();
        resolve(file);
      },
      {
        once: true,
      },
    );

    document.body.append(input);
    input.click();
  });
}
