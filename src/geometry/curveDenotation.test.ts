import { describe, expect, test } from "vitest";
import type {
  EvaluatedCircle,
  EvaluatedGeometry,
  EvaluatedPoint,
  EvaluatedSegment,
  EvaluatedTriangle,
} from "../evaluation/evaluated";
import { circleCurve, linearCurveFromSegment } from "../meaning/curve";
import { vec2 } from "../meaning/vec2";
import {
  curveDenotationForGeometry,
  isCurveGeometry,
} from "./curveDenotation";

describe("geometry/curveDenotation", () => {
  test("denotes evaluated segments as bounded linear curves", () => {
    const segment: EvaluatedSegment = {
      kind: "SEGMENT",
      sourceKind: "SEGMENT",
      id: "AB",
      a: vec2(0, 0),
      b: vec2(2, 0),
    };

    expect(curveDenotationForGeometry(segment)).toEqual(
      linearCurveFromSegment(vec2(0, 0), vec2(2, 0)),
    );
    expect(isCurveGeometry(segment)).toBe(true);
  });

  test("denotes evaluated circles as circle curves", () => {
    const circle: EvaluatedCircle = {
      kind: "CIRCLE",
      sourceKind: "CIRCLE",
      id: "C1",
      center: vec2(1, 2),
      radius: 3,
    };

    expect(curveDenotationForGeometry(circle)).toEqual(
      circleCurve(vec2(1, 2), 3),
    );
    expect(isCurveGeometry(circle)).toBe(true);
  });

  test("does not denote points as curves", () => {
    const point: EvaluatedPoint = {
      kind: "POINT",
      sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(0, 0),
      label: "A",
      role: "FREE",
    };

    expect(curveDenotationForGeometry(point)).toBeNull();
    expect(isCurveGeometry(point)).toBe(false);
  });

  test("does not denote triangles as curves yet", () => {
    const triangle: EvaluatedTriangle = {
      kind: "TRIANGLE",
      sourceKind: "TRIANGLE",
      id: "ABC",
      a: vec2(0, 0),
      b: vec2(1, 0),
      c: vec2(0, 1),
    };

    expect(curveDenotationForGeometry(triangle)).toBeNull();
    expect(isCurveGeometry(triangle)).toBe(false);
  });

  test("classifies only curve-valued evaluated geometry as curves", () => {
    const values: readonly EvaluatedGeometry[] = [
      {
        kind: "POINT",
        sourceKind: "FREE_POINT",
        id: "A",
        point: vec2(0, 0),
        label: "A",
        role: "FREE",
      },
      {
        kind: "SEGMENT",
        sourceKind: "SEGMENT",
        id: "AB",
        a: vec2(0, 0),
        b: vec2(1, 0),
      },
      {
        kind: "CIRCLE",
        sourceKind: "CIRCLE",
        id: "C1",
        center: vec2(0, 0),
        radius: 1,
      },
    ];

    expect(values.filter(isCurveGeometry).map((value) => value.id)).toEqual([
      "AB",
      "C1",
    ]);
  });
});
