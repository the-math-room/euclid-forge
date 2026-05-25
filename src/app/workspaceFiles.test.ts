import { describe, expect, test, vi } from "vitest";
import { createGraph } from "@euclid-forge/core/representation/graph";
import { freePoint } from "@euclid-forge/core/representation/node";
import { appState } from "./appState";
import { emptyViewState } from "./viewState";
import {
  defaultWorkspaceFileName,
  downloadWorkspaceJson,
  workspaceFromJsonText,
  workspaceJsonFromState,
} from "./workspaceFiles";

describe("app/workspaceFiles", () => {
  test("serializes app state to pretty workspace JSON with trailing newline", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const json = workspaceJsonFromState(state);

    expect(json.endsWith("\n")).toBe(true);
    expect(JSON.parse(json)).toEqual({
      version: 1,
      nodes: [freePoint("A", 0, 0, "A")],
      view: {
        selectedNodeIds: [],
        hiddenNodeIds: [],
        viewportCenter: { x: 0, y: 0 },
        viewportZoom: 80,
        viewportRotation: 0,
      },
    });
  });

  test("parses workspace JSON text", () => {
    const workspace = workspaceFromJsonText(
      JSON.stringify({
        version: 1,
        nodes: [freePoint("A", 0, 0, "A")],
        view: {
          selectedNodeIds: ["A"],
          hiddenNodeIds: [],
          viewportCenter: { x: 1, y: 2 },
          viewportZoom: 90,
          viewportRotation: 0.5,
        },
      }),
    );

    expect(workspace.view.selectedNodeIds).toEqual(["A"]);
    expect(workspace.view.viewportCenter).toEqual({ x: 1, y: 2 });
  });

  test("throws a friendly error for invalid JSON", () => {
    expect(() => workspaceFromJsonText("{")).toThrow(
      "Workspace file must contain valid JSON",
    );
  });

  test("creates deterministic default workspace file names", () => {
    expect(
      defaultWorkspaceFileName(new Date("2026-05-24T03:58:14.123Z")),
    ).toBe("euclid-forge-2026-05-24T03-58-14Z.euclid-forge.json");
  });

  test("downloads workspace JSON and revokes the object URL", () => {
    const state = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );

    const anchor = {
      href: "",
      download: "",
      rel: "",
      style: {
        display: "",
      },
      click: vi.fn(),
      remove: vi.fn(),
    };

    const body = {
      append: vi.fn(),
    };

    const document = {
      body,
      createElement: vi.fn(() => anchor),
    } as unknown as Document;

    const urlApi = {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    };

    downloadWorkspaceJson(
      document,
      urlApi,
      state,
      "test.euclid-forge.json",
    );

    expect(urlApi.createObjectURL).toHaveBeenCalledOnce();
    expect(anchor.href).toBe("blob:test");
    expect(anchor.download).toBe("test.euclid-forge.json");
    expect(anchor.rel).toBe("noopener");
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(anchor.remove).toHaveBeenCalledOnce();
    expect(urlApi.revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
