import { describe, expect, test } from "vitest";
import type {
  EvaluatedCircle,
  EvaluatedGeometry,
  EvaluatedPoint,
  EvaluatedSegment,
} from "../evaluation/evaluated";
import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import { vec2 } from "../meaning/vec2";
import {
  curveIntersectionCandidatesForScene,
  curveIntersectionCandidatesForValues,
} from "./curveIntersectionCandidates";

function segment(
  id: string,
  a = vec2(-1, 0),
  b = vec2(1, 0),
): EvaluatedSegment {
  return {
    kind: "SEGMENT",
    sourceKind: "SEGMENT",
    id,
    a,
    b,
  };
}

function circle(id: string): EvaluatedCircle {
  return {
    kind: "CIRCLE",
    sourceKind: "CIRCLE",
    id,
    center: vec2(0, 0),
    radius: 1,
  };
}

function point(id: string): EvaluatedPoint {
  return {
    kind: "POINT",
    sourceKind: "FREE_POINT",
    id,
    point: vec2(0, 0),
    label: id,
    role: "FREE",
  };
}

function scene(values: readonly EvaluatedGeometry[]): EvaluatedScene {
  return Object.freeze({
    values: new Map(values.map((value) => [value.id, value])),
    ordered: Object.freeze([...values]),
    issues: Object.freeze([]),
  });
}

describe("geometry/curveIntersectionCandidates", () => {
  test("returns classified candidates for two curve-valued evaluated geometries", () => {
    expect(
      curveIntersectionCandidatesForValues(
        segment("AB", vec2(-2, 0), vec2(2, 0)),
        circle("C1"),
      ),
    ).toEqual({
      candidates: [
        {
          point: vec2(-1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:0",
        },
        {
          point: vec2(1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:1",
        },
      ],
    });
  });

  test("returns an issue when either evaluated value is not curve-valued", () => {
    expect(
      curveIntersectionCandidatesForValues(segment("AB"), point("P")),
    ).toEqual({
      candidates: [],
      issue: "Selected geometry does not denote two curves",
    });
  });

  test("looks up curve-valued geometry in an evaluated scene", () => {
    const evaluated = scene([
      segment("AB", vec2(-2, 0), vec2(2, 0)),
      circle("C1"),
    ]);

    expect(curveIntersectionCandidatesForScene(evaluated, "AB", "C1")).toEqual({
      candidates: [
        {
          point: vec2(-1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:0",
        },
        {
          point: vec2(1, 0),
          multiplicity: "SIMPLE",
          branchKey: "linear-circle:1",
        },
      ],
    });
  });

  test("returns an issue when selected geometry is not currently evaluated", () => {
    const evaluated = scene([segment("AB")]);

    expect(
      curveIntersectionCandidatesForScene(evaluated, "AB", "missing"),
    ).toEqual({
      candidates: [],
      issue: "Selected curve geometry is not currently evaluated",
    });
  });
});
