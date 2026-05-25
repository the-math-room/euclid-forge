import {
  DEFAULT_INTERSECTION_POLICY,
  type IntersectionCandidate,
  type IntersectionMultiplicity,
  type IntersectionResult,
} from "./intersection";
import {
  lineIntersection,
  lineIntersectionWithParameters,
  type LineIntersectionResult,
} from "./line";
import { intersectCurves, linearCurveFromSegment } from "./curve";

export type Vec2 = Readonly<{
  x: number;
  y: number;
}>;

export function vec2(x: number, y: number): Vec2 {
  return Object.freeze({ x, y });
}

export function midpoint(a: Vec2, b: Vec2): Vec2 {
  return vec2((a.x + b.x) / 2, (a.y + b.y) / 2);
}

export function centroid(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  return vec2((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
}

export function deltaBetween(a: Vec2, b: Vec2): Vec2 {
  return vec2(b.x - a.x, b.y - a.y);
}

export {
  lineIntersection,
  lineIntersectionWithParameters,
  type IntersectionCandidate,
  type IntersectionMultiplicity,
  type IntersectionResult,
  type LineIntersectionResult,
};

export function segmentIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = DEFAULT_INTERSECTION_POLICY.epsilon,
): Vec2 | null {
  return (
    segmentSegmentIntersections(a1, a2, b1, b2, epsilon).candidates[0]?.point ??
    null
  );
}

export function segmentSegmentIntersections(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = DEFAULT_INTERSECTION_POLICY.epsilon,
): IntersectionResult {
  const result = intersectCurves(
    linearCurveFromSegment(a1, a2),
    linearCurveFromSegment(b1, b2),
    Object.freeze({ epsilon }),
  );

  if (
    result.issue ===
    "Curves are parallel or coincident; no unique intersection point"
  ) {
    return Object.freeze({
      candidates: Object.freeze([]),
      issue:
        "Segments are parallel or coincident; no unique intersection point",
    });
  }

  if (result.issue === "Intersection lies outside a bounded curve domain") {
    const parameters = lineIntersectionWithParameters(a1, a2, b1, b2, epsilon);

    if (parameters && (parameters.t < -epsilon || parameters.t > 1 + epsilon)) {
      return Object.freeze({
        candidates: Object.freeze([]),
        issue: "Supporting lines intersect outside the first segment",
      });
    }

    return Object.freeze({
      candidates: Object.freeze([]),
      issue: "Supporting lines intersect outside the second segment",
    });
  }

  if (!result.candidates[0]) {
    return result;
  }

  return Object.freeze({
    candidates: Object.freeze([
      Object.freeze({
        ...result.candidates[0],
        branchKey: "segment-segment",
      }),
    ]),
  });
}
