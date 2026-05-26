import type { EvaluatedGeometry } from "../evaluation/evaluated";
import {
  evaluatedGeometryItems,
  type EvaluatedScene,
} from "../evaluation/evaluateGraph";
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
  const geometry = new Map(evaluatedGeometryItems(scene).map((value) => [value.id, value]));
  const firstGeometry = firstValue ? geometry.get(firstId) : undefined;
  const secondGeometry = secondValue ? geometry.get(secondId) : undefined;

  if (!firstGeometry || !secondGeometry) {
    return Object.freeze({
      candidates: Object.freeze([]),
      issue: "Selected curve geometry is not currently evaluated",
    });
  }

  return curveIntersectionCandidatesForValues(firstGeometry, secondGeometry);
}
