import type { AppState } from "./appState";
import type { HistoryState } from "./history";
import { initialHistory } from "./history";
import { deserializeWorkspace } from "./workspace";
import {
  chooseWorkspaceFile,
  downloadWorkspaceJson,
  workspaceFromJsonText,
} from "./workspaceFiles";

export type WorkspaceActionEnvironment = Readonly<{
  document: Document;
  urlApi: Pick<typeof URL, "createObjectURL" | "revokeObjectURL">;
  alert: (message: string) => void;
  consoleError: (error: unknown) => void;
}>;

export type OpenWorkspaceInput = Readonly<{
  environment: WorkspaceActionEnvironment;
  setState: (state: AppState) => void;
  setHistory: (history: HistoryState) => void;
  requestRender: () => void;
}>;

export function saveWorkspace(
  environment: WorkspaceActionEnvironment,
  state: AppState,
): void {
  downloadWorkspaceJson(environment.document, environment.urlApi, state);
}

export async function openWorkspace(input: OpenWorkspaceInput): Promise<void> {
  const file = await chooseWorkspaceFile(input.environment.document);

  if (!file) {
    return;
  }

  try {
    const workspace = workspaceFromJsonText(await file.text());
    const nextState = deserializeWorkspace(workspace);

    input.setState(nextState);
    input.setHistory(initialHistory(nextState));
    input.requestRender();
  } catch (error) {
    input.environment.consoleError(error);
    input.environment.alert(
      error instanceof Error ? error.message : "Could not open workspace file",
    );
  }
}

export function browserWorkspaceActionEnvironment(): WorkspaceActionEnvironment {
  return {
    document,
    urlApi: URL,
    alert: window.alert.bind(window),
    consoleError: console.error.bind(console),
  };
}
