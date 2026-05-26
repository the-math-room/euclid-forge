import type { EvaluatedGeometry } from "../evaluation/evaluated";
import {
  circleCurve,
  type Curve2,
  linearCurveFromSegment,
  lineCurveThroughPoints,
} from "../meaning/curve";

export function curveDenotationForGeometry(
  value: EvaluatedGeometry,
): Curve2 | null {
  switch (value.kind) {
    case "SEGMENT":
      return linearCurveFromSegment(value.a, value.b);

    case "LINE":
      return lineCurveThroughPoints(value.a, value.b);

    case "CIRCLE":
      return circleCurve(value.center, value.radius);

    case "POINT":
    case "TRIANGLE":
    case "POLYGON":
      return null;
  }
}

export function isCurveGeometry(value: EvaluatedGeometry): boolean {
  return curveDenotationForGeometry(value) !== null;
}
