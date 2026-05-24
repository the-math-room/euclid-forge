import { afterEach, describe, expect, test, vi } from "vitest";
import { createRenderScheduler } from "./renderScheduler";

describe("app/createRenderScheduler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("coalesces multiple render requests into one animation frame", () => {
    const callbacks: FrameRequestCallback[] = [];

    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback): number => {
        callbacks.push(callback);
        return callbacks.length;
      },
    );

    const render = vi.fn();
    const requestRender = createRenderScheduler(render);

    requestRender();
    requestRender();
    requestRender();

    expect(render).not.toHaveBeenCalled();
    expect(callbacks).toHaveLength(1);

    callbacks[0]?.(0);

    expect(render).toHaveBeenCalledTimes(1);
  });

  test("allows another render after the pending frame completes", () => {
    const callbacks: FrameRequestCallback[] = [];

    vi.stubGlobal(
      "requestAnimationFrame",
      (callback: FrameRequestCallback): number => {
        callbacks.push(callback);
        return callbacks.length;
      },
    );

    const render = vi.fn();
    const requestRender = createRenderScheduler(render);

    requestRender();
    callbacks[0]?.(0);

    requestRender();
    callbacks[1]?.(16);

    expect(render).toHaveBeenCalledTimes(2);
  });
});
