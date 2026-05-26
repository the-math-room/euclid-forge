import { describe, expect, test, vi } from "vitest";
import type { EvaluatedSegmentMeasurement } from "@euclid-forge/core/evaluation/evaluated";
import { vec2 } from "@euclid-forge/core";
import { testViewport } from "./testHelpers";
import { renderSegmentMeasurement } from "./segmentMeasurementRenderer";

function measurement(
  overrides: Partial<EvaluatedSegmentMeasurement> = {},
): EvaluatedSegmentMeasurement {
  return {
    kind: "SEGMENT_MEASUREMENT",
    sourceKind: "SEGMENT_MEASUREMENT",
    id: "M_AB",
    segment: "AB",
    a: vec2(0, 0),
    b: vec2(1, 0),
    length: 1,
    label: "1",
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
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({
      width: 8,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 8,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 3,
    })),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    font: "",
    textBaseline: "",
  };

  return ctx as unknown as CanvasRenderingContext2D;
}

describe("rendering/segmentMeasurementRenderer", () => {
  test("draws a measurement label pill", () => {
    const ctx = contextStub();

    renderSegmentMeasurement(ctx, testViewport(), measurement());

    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalledWith("1", expect.any(Number), expect.any(Number));
  });
});
