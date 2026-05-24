import { describe, expect, test, vi } from "vitest";
import { createGraph } from "../representation/graph";
import { freePoint } from "../representation/node";
import { appState } from "./appState";
import type { AppTransition } from "./appController";
import {
  applyPointerCaptureEffect,
  applyTransition,
} from "./transitionEffects";
import { emptyViewState } from "./viewState";

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

describe("app/transitionEffects", () => {
  test("sets transition state", () => {
    const next = transition().state;
    const setState = vi.fn();

    applyTransition({
      canvas: canvasStub(),
      event: new Event("test"),
      transition: transition({ state: next }),
      setState,
      requestRender: vi.fn(),
      commitStateToHistory: vi.fn(),
      showStatusMessage: vi.fn(),
    });

    expect(setState).toHaveBeenCalledWith(next);
  });

  test("commits history only for commit transitions", () => {
    const state = transition().state;
    const commitStateToHistory = vi.fn();

    applyTransition({
      canvas: canvasStub(),
      event: new Event("test"),
      transition: transition({
        state,
        history: "commit",
      }),
      setState: vi.fn(),
      requestRender: vi.fn(),
      commitStateToHistory,
      showStatusMessage: vi.fn(),
    });

    expect(commitStateToHistory).toHaveBeenCalledWith(state);

    commitStateToHistory.mockClear();

    applyTransition({
      canvas: canvasStub(),
      event: new Event("test"),
      transition: transition({
        state,
        history: "ignore",
      }),
      setState: vi.fn(),
      requestRender: vi.fn(),
      commitStateToHistory,
      showStatusMessage: vi.fn(),
    });

    expect(commitStateToHistory).not.toHaveBeenCalled();
  });

  test("requests render and prevents default when requested", () => {
    const requestRender = vi.fn();
    const event = new Event("test");
    const preventDefault = vi.spyOn(event, "preventDefault");

    applyTransition({
      canvas: canvasStub(),
      event,
      transition: transition({
        shouldRender: true,
        shouldPreventDefault: true,
      }),
      setState: vi.fn(),
      requestRender,
      commitStateToHistory: vi.fn(),
      showStatusMessage: vi.fn(),
    });

    expect(requestRender).toHaveBeenCalledOnce();
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  test("shows transition status messages", () => {
    const showStatusMessage = vi.fn();

    applyTransition({
      canvas: canvasStub(),
      event: new Event("test"),
      transition: transition({
        statusMessage: "Cannot delete A.",
      }),
      setState: vi.fn(),
      requestRender: vi.fn(),
      commitStateToHistory: vi.fn(),
      showStatusMessage,
    });

    expect(showStatusMessage).toHaveBeenCalledWith("Cannot delete A.");
  });

  test("applies set pointer capture effect", () => {
    const canvas = canvasStub();

    applyPointerCaptureEffect(canvas, {
      kind: "SET_POINTER_CAPTURE",
      pointerId: 7,
    });

    expect(canvas.setPointerCapture).toHaveBeenCalledWith(7);
  });

  test("releases pointer capture only when held", () => {
    const canvas = canvasStub();

    applyPointerCaptureEffect(canvas, {
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId: 7,
    });

    expect(canvas.hasPointerCapture).toHaveBeenCalledWith(7);
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(7);
  });

  test("does not release pointer capture when not held", () => {
    const canvas = {
      setPointerCapture: vi.fn(),
      hasPointerCapture: vi.fn(() => false),
      releasePointerCapture: vi.fn(),
    } as unknown as HTMLCanvasElement;

    applyPointerCaptureEffect(canvas, {
      kind: "RELEASE_POINTER_CAPTURE",
      pointerId: 7,
    });

    expect(canvas.hasPointerCapture).toHaveBeenCalledWith(7);
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });
});
