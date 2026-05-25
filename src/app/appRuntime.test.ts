import { describe, expect, test, vi } from "vitest";
import { createGraph } from "@euclid-forge/core/representation/graph";
import { freePoint } from "@euclid-forge/core/representation/node";
import { appState } from "./appState";
import type { AppTransition } from "./appController";
import { createAppRuntime } from "./appRuntime";
import { initialHistory } from "./history";
import type { StatusSurface } from "./statusSurface";
import { emptyViewState, toggleSelectedNode } from "./viewState";

function transition(
  overrides: Partial<AppTransition> = {},
): AppTransition {
  return {
    state: appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    ),
    shouldRender: false,
    shouldPreventDefault: false,
    history: "ignore",
    effects: [],
    ...overrides,
  };
}

function canvasStub() {
  return {
    setPointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
    releasePointerCapture: vi.fn(),
  } as unknown as HTMLCanvasElement;
}

function statusSurfaceStub(): StatusSurface {
  return {
    show: vi.fn(),
    clear: vi.fn(),
  };
}

describe("app/appRuntime", () => {
  test("applies transitions and updates current state", () => {
    const initial = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );
    const next = appState(
      initial.graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );
    const runtime = createAppRuntime({
      canvas: canvasStub(),
      initialState: initial,
      initialHistory: initialHistory(initial),
      requestRender: vi.fn(),
      statusSurface: statusSurfaceStub(),
    });

    runtime.applyTransition(new Event("test"), transition({ state: next }));

    expect(runtime.getState()).toBe(next);
  });

  test("commits transition state to history", () => {
    const initial = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );
    const next = appState(
      initial.graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );
    const runtime = createAppRuntime({
      canvas: canvasStub(),
      initialState: initial,
      initialHistory: initialHistory(initial),
      requestRender: vi.fn(),
      statusSurface: statusSurfaceStub(),
    });

    runtime.applyTransition(
      new Event("test"),
      transition({
        state: next,
        history: "commit",
      }),
    );

    expect(runtime.getHistory().present.viewState).toBe(next.viewState);
  });

  test("shows status effects", () => {
    const initial = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );
    const statusSurface = statusSurfaceStub();
    const runtime = createAppRuntime({
      canvas: canvasStub(),
      initialState: initial,
      initialHistory: initialHistory(initial),
      requestRender: vi.fn(),
      statusSurface,
    });

    runtime.applyTransition(
      new Event("test"),
      transition({
        effects: [
          {
            kind: "SHOW_STATUS",
            message: "Blocked.",
          },
        ],
      }),
    );

    expect(statusSurface.show).toHaveBeenCalledWith("Blocked.");
  });

  test("undo and redo restore history state and request render", () => {
    const initial = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );
    const next = appState(
      initial.graph,
      toggleSelectedNode(emptyViewState(), "A"),
      null,
    );
    const requestRender = vi.fn();
    const event = new Event("keydown");
    const preventDefault = vi.spyOn(event, "preventDefault");
    const runtime = createAppRuntime({
      canvas: canvasStub(),
      initialState: initial,
      initialHistory: initialHistory(initial),
      requestRender,
      statusSurface: statusSurfaceStub(),
    });

    runtime.applyTransition(
      new Event("test"),
      transition({
        state: next,
        history: "commit",
      }),
    );

    runtime.undo(event);

    expect(runtime.getState().viewState).toBe(initial.viewState);
    expect(requestRender).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();

    runtime.redo(event);

    expect(runtime.getState().viewState).toBe(next.viewState);
  });

  test("setState and setHistory support workspace loading", () => {
    const initial = appState(
      createGraph([freePoint("A", 0, 0, "A")]),
      emptyViewState(),
      null,
    );
    const loaded = appState(
      createGraph([freePoint("B", 1, 1, "B")]),
      emptyViewState(),
      null,
    );
    const runtime = createAppRuntime({
      canvas: canvasStub(),
      initialState: initial,
      initialHistory: initialHistory(initial),
      requestRender: vi.fn(),
      statusSurface: statusSurfaceStub(),
    });

    runtime.setState(loaded);
    runtime.setHistory(initialHistory(loaded));

    expect(runtime.getState()).toBe(loaded);
    expect(runtime.getHistory().present.graph).toBe(loaded.graph);
  });
});
