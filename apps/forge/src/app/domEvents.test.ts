import { describe, expect, test, vi } from "vitest";
import { createGraph } from "@euclid-forge/core/representation/graph";
import { freePoint } from "@euclid-forge/core/representation/node";
import { appState } from "./appState";
import type { AppRuntime } from "./appRuntime";
import { connectDomEvents } from "./domEvents";
import type { WorkspaceActionEnvironment } from "./workspaceActions";
import { emptyViewportMotionState } from "./viewportMotion";
import type { ViewportMotionState } from "./viewportMotion";
import { emptyViewState } from "./viewState";

type ListenerMap = Map<string, EventListener>;

function windowTargetStub(): Pick<Window, "addEventListener"> & {
  listeners: ListenerMap;
} {
  const listeners: ListenerMap = new Map();

  return {
    listeners,
    addEventListener: vi.fn((name: string, listener: EventListener) => {
      listeners.set(name, listener);
    }),
  } as unknown as Pick<Window, "addEventListener"> & {
    listeners: ListenerMap;
  };
}

function canvasStub(): HTMLCanvasElement & {
  listeners: ListenerMap;
} {
  const listeners: ListenerMap = new Map();

  return {
    listeners,
    addEventListener: vi.fn((name: string, listener: EventListener) => {
      listeners.set(name, listener);
    }),
    getBoundingClientRect: vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    })),
  } as unknown as HTMLCanvasElement & {
    listeners: ListenerMap;
  };
}

function runtimeStub(): AppRuntime {
  const state = appState(
    createGraph([freePoint("A", 0, 0, "A")]),
    emptyViewState(),
    null,
  );

  return {
    getState: vi.fn(() => state),
    setState: vi.fn(),
    getHistory: vi.fn(),
    setHistory: vi.fn(),
    applyTransition: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    requestRender: vi.fn(),
  } as unknown as AppRuntime;
}

function workspaceEnvironmentStub(): WorkspaceActionEnvironment {
  return {
    document: {
      body: {
        append: vi.fn(),
      },
      createElement: vi.fn(),
    } as unknown as Document,
    urlApi: {
      createObjectURL: vi.fn(() => "blob:test"),
      revokeObjectURL: vi.fn(),
    },
    alert: vi.fn(),
    consoleError: vi.fn(),
  };
}

function keyEvent(key: string, overrides: Partial<KeyboardEvent> = {}) {
  return {
    key,
    target: null,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as KeyboardEvent;
}

function pointerEvent(
  name: string,
  overrides: Partial<PointerEvent> = {},
): PointerEvent {
  return {
    type: name,
    pointerId: 1,
    clientX: 400,
    clientY: 300,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as PointerEvent;
}

describe("app/domEvents", () => {
  test("resize requests render", () => {
    const windowTarget = windowTargetStub();
    const runtime = runtimeStub();

    connectDomEvents({
      windowTarget,
      canvas: canvasStub(),
      runtime,
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: emptyViewportMotionState,
      setViewportMotion: vi.fn(),
      requestViewportMotionFrame: vi.fn(),
    });

    windowTarget.listeners.get("resize")?.(new Event("resize"));

    expect(runtime.requestRender).toHaveBeenCalledOnce();
  });

  test("ordinary keydown applies a key transition", () => {
    const windowTarget = windowTargetStub();
    const runtime = runtimeStub();

    connectDomEvents({
      windowTarget,
      canvas: canvasStub(),
      runtime,
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: emptyViewportMotionState,
      setViewportMotion: vi.fn(),
      requestViewportMotionFrame: vi.fn(),
    });

    const event = keyEvent("ArrowLeft");
    windowTarget.listeners.get("keydown")?.(event);

    expect(runtime.applyTransition).toHaveBeenCalledOnce();
  });

  test("undo and redo shortcuts delegate to runtime", () => {
    const windowTarget = windowTargetStub();
    const runtime = runtimeStub();

    connectDomEvents({
      windowTarget,
      canvas: canvasStub(),
      runtime,
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: emptyViewportMotionState,
      setViewportMotion: vi.fn(),
      requestViewportMotionFrame: vi.fn(),
    });

    windowTarget.listeners.get("keydown")?.(keyEvent("z", { ctrlKey: true }));
    windowTarget.listeners.get("keydown")?.(keyEvent("y", { ctrlKey: true }));

    expect(runtime.undo).toHaveBeenCalledOnce();
    expect(runtime.redo).toHaveBeenCalledOnce();
  });

  test("viewport rotation key starts motion", () => {
    const windowTarget = windowTargetStub();
    const setViewportMotion = vi.fn();
    const requestViewportMotionFrame = vi.fn();
    let motion: ViewportMotionState = emptyViewportMotionState();

    connectDomEvents({
      windowTarget,
      canvas: canvasStub(),
      runtime: runtimeStub(),
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: () => motion,
      setViewportMotion: (next) => {
        motion = next;
        setViewportMotion(next);
      },
      requestViewportMotionFrame,
    });

    const event = keyEvent("[");
    windowTarget.listeners.get("keydown")?.(event);

    expect(setViewportMotion).toHaveBeenCalledOnce();
    expect(requestViewportMotionFrame).toHaveBeenCalledOnce();
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });

  test("pointerdown applies a pointer transition", () => {
    const windowTarget = windowTargetStub();
    const runtime = runtimeStub();
    const canvas = canvasStub();

    connectDomEvents({
      windowTarget,
      canvas,
      runtime,
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: emptyViewportMotionState,
      setViewportMotion: vi.fn(),
      requestViewportMotionFrame: vi.fn(),
    });

    const event = pointerEvent("pointerdown");
    canvas.listeners.get("pointerdown")?.(event);

    expect(runtime.applyTransition).toHaveBeenCalledOnce();
  });
  test("passes shift key state to key transitions", () => {
    const windowTarget = windowTargetStub();
    const runtime = runtimeStub();

    connectDomEvents({
      windowTarget,
      canvas: canvasStub(),
      runtime,
      workspaceEnvironment: workspaceEnvironmentStub(),
      getViewportMotion: emptyViewportMotionState,
      setViewportMotion: vi.fn(),
      requestViewportMotionFrame: vi.fn(),
    });

    const event = keyEvent("PageUp", { shiftKey: true });
    windowTarget.listeners.get("keydown")?.(event);

    expect(runtime.applyTransition).toHaveBeenCalledWith(
      event,
      expect.objectContaining({}),
    );
  });

});
