import { describe, expect, test, vi } from "vitest";
import { createGraph } from "@euclid-forge/core";
import { freePoint } from "@euclid-forge/core";
import { appState } from "./appState";
import { initialHistory } from "./history";
import type { WorkspaceActionEnvironment } from "./workspaceActions";
import { openWorkspace, saveWorkspace } from "./workspaceActions";
import { emptyViewState } from "./viewState";

function environmentWithDocument(
  document: Document,
): WorkspaceActionEnvironment {
  return {
    document,
    urlApi: {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    },
    alert: vi.fn(),
    consoleError: vi.fn(),
  };
}

function fakeFile(text: string): File {
  return {
    text: vi.fn(async () => text),
  } as unknown as File;
}

function documentWithChosenFile(file: File | null): Document {
  const input = {
    type: "",
    accept: "",
    style: {
      display: "",
    },
    files: file ? [file] : [],
    addEventListener: vi.fn((_name, listener: () => void) => {
      listener();
    }),
    click: vi.fn(),
    remove: vi.fn(),
  };

  return {
    body: {
      append: vi.fn(),
    },
    createElement: vi.fn(() => input),
  } as unknown as Document;
}

describe("app/workspaceActions", () => {
  test("saves the current workspace", () => {
    const document = {
      body: {
        append: vi.fn(),
      },
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        rel: "",
        style: {
          display: "",
        },
        click: vi.fn(),
        remove: vi.fn(),
      })),
    } as unknown as Document;

    const environment = environmentWithDocument(document);
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    saveWorkspace(environment, state);

    expect(environment.urlApi.createObjectURL).toHaveBeenCalledOnce();
    expect(environment.urlApi.revokeObjectURL).toHaveBeenCalledOnce();
  });

  test("open workspace does nothing when the user cancels file selection", async () => {
    const environment = environmentWithDocument(documentWithChosenFile(null));
    const setState = vi.fn();
    const setHistory = vi.fn();
    const requestRender = vi.fn();

    await openWorkspace({
      environment,
      setState,
      setHistory,
      requestRender,
    });

    expect(setState).not.toHaveBeenCalled();
    expect(setHistory).not.toHaveBeenCalled();
    expect(requestRender).not.toHaveBeenCalled();
  });

  test("open workspace validates, sets state, resets history, and renders", async () => {
    const file = fakeFile(
      JSON.stringify({
        version: 1,
        nodes: [freePoint("A", 0, 0, "A")],
        view: {
          selectedNodeIds: ["A"],
          hiddenNodeIds: [],
          viewportCenter: { x: 0, y: 0 },
          viewportZoom: 80,
          viewportRotation: 0,
        },
      }),
    );
    const environment = environmentWithDocument(documentWithChosenFile(file));
    const setState = vi.fn();
    const setHistory = vi.fn();
    const requestRender = vi.fn();

    await openWorkspace({
      environment,
      setState,
      setHistory,
      requestRender,
    });

    expect(setState).toHaveBeenCalledOnce();
    expect(setHistory).toHaveBeenCalledOnce();
    expect(requestRender).toHaveBeenCalledOnce();

    const loadedState = setState.mock.calls[0]?.[0];

    expect(loadedState.graph.byId.get("A")).toEqual(freePoint("A", 0, 0, "A"));
    expect([...loadedState.viewState.selectedNodeIds]).toEqual(["A"]);
    expect(setHistory).toHaveBeenCalledWith(initialHistory(loadedState));
  });

  test("open workspace reports parse or validation failures without mutating state", async () => {
    const environment = environmentWithDocument(
      documentWithChosenFile(fakeFile("{")),
    );
    const setState = vi.fn();
    const setHistory = vi.fn();
    const requestRender = vi.fn();

    await openWorkspace({
      environment,
      setState,
      setHistory,
      requestRender,
    });

    expect(setState).not.toHaveBeenCalled();
    expect(setHistory).not.toHaveBeenCalled();
    expect(requestRender).not.toHaveBeenCalled();
    expect(environment.consoleError).toHaveBeenCalledOnce();
    expect(environment.alert).toHaveBeenCalledWith(
      "Workspace file must contain valid JSON",
    );
  });
});
