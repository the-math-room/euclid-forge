import { describe, expect, test } from "vitest";
import { createGraph } from "@euclid-forge/core";
import { freePoint } from "@euclid-forge/core";
import { appState } from "./appState";
import {
  emptyViewportMotionState,
  isViewportMotionActive,
  startViewportRotation,
  stepViewportMotion,
  stopViewportRotation,
} from "./viewportMotion";
import { emptyViewState } from "./viewState";

describe("app/viewportMotion", () => {
  test("starts empty and inactive", () => {
    const motion = emptyViewportMotionState();

    expect(motion.rotateDirection).toBe(0);
    expect(motion.lastTimestampMs).toBeNull();
    expect(isViewportMotionActive(motion)).toBe(false);
  });

  test("starts clockwise and counterclockwise rotation", () => {
    const initial = emptyViewportMotionState();

    const counterclockwise = startViewportRotation(initial, 1);
    const clockwise = startViewportRotation(initial, -1);

    expect(counterclockwise.rotateDirection).toBe(1);
    expect(counterclockwise.lastTimestampMs).toBeNull();
    expect(clockwise.rotateDirection).toBe(-1);
    expect(clockwise.lastTimestampMs).toBeNull();
    expect(isViewportMotionActive(counterclockwise)).toBe(true);
  });

  test("returns the same motion when starting the already-active direction", () => {
    const motion = startViewportRotation(emptyViewportMotionState(), 1);

    expect(startViewportRotation(motion, 1)).toBe(motion);
  });

  test("switching direction resets the frame timestamp", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);
    const started = startViewportRotation(emptyViewportMotionState(), 1);
    const initialized = stepViewportMotion(state, started, 1000).motion;
    const switched = startViewportRotation(initialized, -1);

    expect(switched.rotateDirection).toBe(-1);
    expect(switched.lastTimestampMs).toBeNull();
  });

  test("stops only the matching active direction", () => {
    const motion = startViewportRotation(emptyViewportMotionState(), 1);

    expect(stopViewportRotation(motion, -1)).toBe(motion);

    const stopped = stopViewportRotation(motion, 1);

    expect(stopped.rotateDirection).toBe(0);
    expect(stopped.lastTimestampMs).toBeNull();
  });

  test("first active step records timestamp without rotating", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);
    const motion = startViewportRotation(emptyViewportMotionState(), 1);

    const step = stepViewportMotion(state, motion, 1000);

    expect(step.state).toBe(state);
    expect(step.motion.lastTimestampMs).toBe(1000);
    expect(step.shouldRender).toBe(false);
  });

  test("subsequent active step rotates by elapsed time", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);
    const started = startViewportRotation(emptyViewportMotionState(), 1);
    const initialized = stepViewportMotion(state, started, 1000);

    const step = stepViewportMotion(state, initialized.motion, 1100);

    expect(step.state.viewState.viewportRotation).toBeCloseTo(
      (Math.PI / 2) * 0.05,
    );
    expect(step.motion.lastTimestampMs).toBe(1100);
    expect(step.shouldRender).toBe(true);
  });

  test("inactive step normalizes motion and does not render", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);
    const state = appState(graph, emptyViewState(), null);

    const step = stepViewportMotion(state, emptyViewportMotionState(), 1000);

    expect(step.state).toBe(state);
    expect(step.motion.rotateDirection).toBe(0);
    expect(step.shouldRender).toBe(false);
  });
});
