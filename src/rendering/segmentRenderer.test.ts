import { describe, expect, test, vi } from "vitest";
import type { EvaluatedSegment } from "@euclid-forge/core/evaluation/evaluated";
import { vec2 } from "@euclid-forge/core/meaning/vec2";
import { testViewport } from "./testHelpers";
import { renderSegment } from "./segmentRenderer";
import { RENDER_THEME } from "./theme";

function segment(overrides: Partial<EvaluatedSegment> = {}): EvaluatedSegment {
  return {
    kind: "SEGMENT",
    sourceKind: "SEGMENT",
    id: "AB",
    a: vec2(0, 0),
    b: vec2(1, 0),
    ...overrides,
  };
}

function contextStub(): CanvasRenderingContext2D {
  const ctx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
    lineWidth: 0,
  };

  return ctx as unknown as CanvasRenderingContext2D;
}

describe("rendering/segmentRenderer", () => {
  test("draws a selected segment underlay", () => {
    const ctx = contextStub();

    renderSegment(ctx, testViewport(), segment(), {
      selectedNodeIds: new Set(["AB"]),
    });

    expect(ctx.stroke).toHaveBeenCalledTimes(2);
    expect(ctx.strokeStyle).toBe(RENDER_THEME.segment.stroke);
  });

  test("draws only the normal stroke when unselected and unhovered", () => {
    const ctx = contextStub();

    renderSegment(ctx, testViewport(), segment());

    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(ctx.strokeStyle).toBe(RENDER_THEME.segment.stroke);
  });
});
