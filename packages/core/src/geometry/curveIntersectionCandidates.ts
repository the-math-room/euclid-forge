import {
  isEvaluatedGeometry,
  type EvaluatedGeometry,
} from "../evaluation/evaluated";
import type { EvaluatedScene } from "../evaluation/evaluateGraph";
import { intersectCurves } from "../meaning/curve";
import type { IntersectionResult } from "../meaning/intersection";
import type { NodeId } from "../representation/node";
import { curveDenotationForGeometry } from "./curveDenotation";

export function curveIntersectionCandidatesForValues(
  first: EvaluatedGeometry,
  second: EvaluatedGeometry,
): IntersectionResult {
  const firstCurve = curveDenotationForGeometry(first);
  const secondCurve = curveDenotationForGeometry(second);

  if (!firstCurve || !secondCurve) {
    return Object.freeze({
      candidates: Object.freeze([]),
      issue: "Selected geometry does not denote two curves",
    });
  }

  return intersectCurves(firstCurve, secondCurve);
}

export function curveIntersectionCandidatesForScene(
  scene: EvaluatedScene,
  firstId: NodeId,
  secondId: NodeId,
): IntersectionResult {
  const firstValue = scene.values.get(firstId);
  const secondValue = scene.values.get(secondId);

  if (
    !firstValue ||
    !secondValue ||
    !isEvaluatedGeometry(firstValue) ||
    !isEvaluatedGeometry(secondValue)
  ) {
    return Object.freeze({
      candidates: Object.freeze([]),
      issue: "Selected curve geometry is not currently evaluated",
    });
  }

  return curveIntersectionCandidatesForValues(firstValue, secondValue);
}
