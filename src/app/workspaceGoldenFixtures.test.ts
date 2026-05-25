import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { evaluateGraph } from "../evaluation/evaluateGraph";
import type {
  EvaluatedPoint,
  EvaluatedSegment,
} from "../evaluation/evaluated";
import {
  deserializeWorkspace,
  parseSerializedWorkspace,
  serializeWorkspace,
} from "./workspace";

function readFixture(name: string): unknown {
  return JSON.parse(
    readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf-8"),
  );
}

function expectPointNear(
  point: EvaluatedPoint | undefined,
  expected: Readonly<{ x: number; y: number }>,
): void {
  expect(point?.kind).toBe("POINT");
  expect(point?.point.x).toBeCloseTo(expected.x, 10);
  expect(point?.point.y).toBeCloseTo(expected.y, 10);
}

function segmentLength(segment: EvaluatedSegment): number {
  return Math.hypot(segment.b.x - segment.a.x, segment.b.y - segment.a.y);
}

describe("workspace golden fixtures", () => {
  test("Euclid I.1 equilateral construction parses, evaluates, diagnoses, and serializes", () => {
    const parsed = parseSerializedWorkspace(
      readFixture("euclid-i-1-equilateral.workspace.json"),
    );
    const state = deserializeWorkspace(parsed);
    const evaluated = evaluateGraph(state.graph);

    expect(evaluated.issues).toEqual([]);

    expectPointNear(
      evaluated.values.get("X_C1_C2_circle_circle_0") as
        | EvaluatedPoint
        | undefined,
      {
        x: 0,
        y: -Math.sqrt(3),
      },
    );
    expectPointNear(
      evaluated.values.get("X_C1_C2_circle_circle_1") as
        | EvaluatedPoint
        | undefined,
      {
        x: 0,
        y: Math.sqrt(3),
      },
    );

    const base = evaluated.values.get("S_P1_P2") as EvaluatedSegment;
    const left = evaluated.values.get(
      "S_P1_X_C1_C2_circle_circle_1",
    ) as EvaluatedSegment;
    const right = evaluated.values.get(
      "S_P2_X_C1_C2_circle_circle_1",
    ) as EvaluatedSegment;

    expect(base.kind).toBe("SEGMENT");
    expect(left.kind).toBe("SEGMENT");
    expect(right.kind).toBe("SEGMENT");

    expect(segmentLength(base)).toBeCloseTo(2, 10);
    expect(segmentLength(left)).toBeCloseTo(2, 10);
    expect(segmentLength(right)).toBeCloseTo(2, 10);

    expect(serializeWorkspace(state)).toEqual(parsed);
  });
});
