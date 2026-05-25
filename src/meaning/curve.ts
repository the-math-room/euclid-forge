import {
  type IntersectionResult,
  lineIntersectionWithParameters,
  type Vec2,
  vec2,
} from "./vec2";

export type IntersectionMultiplicity = "SIMPLE" | "TANGENT";

export type IntersectionCandidate = Readonly<{
  point: Vec2;
  multiplicity: IntersectionMultiplicity;
  branchKey: string;
}>;

export type CurveDomain =
  | Readonly<{ kind: "ALL" }>
  | Readonly<{
      kind: "SEGMENT_PARAMETER";
      start: Vec2;
      end: Vec2;
    }>;

export type LinearImplicitCurve = Readonly<{
  kind: "LINEAR_IMPLICIT";
  a: number;
  b: number;
  c: number;
  domain: CurveDomain;
}>;

export type Curve2 = LinearImplicitCurve;

export type IntersectionPolicy = Readonly<{
  epsilon: number;
}>;

export const DEFAULT_INTERSECTION_POLICY: IntersectionPolicy = Object.freeze({
  epsilon: 1e-9,
});

export function linearCurveFromSegment(
  start: Vec2,
  end: Vec2,
): LinearImplicitCurve {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  return Object.freeze({
    kind: "LINEAR_IMPLICIT",
    a: dy,
    b: -dx,
    c: dx * start.y - dy * start.x,
    domain: Object.freeze({
      kind: "SEGMENT_PARAMETER",
      start,
      end,
    }),
  });
}

export function intersectCurves(
  first: Curve2,
  second: Curve2,
  policy: IntersectionPolicy = DEFAULT_INTERSECTION_POLICY,
): IntersectionResult {
  if (
    first.kind === "LINEAR_IMPLICIT" &&
    second.kind === "LINEAR_IMPLICIT"
  ) {
    return intersectLinearImplicitCurves(first, second, policy);
  }

  return intersectionIssue("Unsupported curve intersection");
}

function intersectLinearImplicitCurves(
  first: LinearImplicitCurve,
  second: LinearImplicitCurve,
  policy: IntersectionPolicy,
): IntersectionResult {
  const firstLine = lineEndpointsForLinearImplicit(first);
  const secondLine = lineEndpointsForLinearImplicit(second);
  const result = lineIntersectionWithParameters(
    firstLine.start,
    firstLine.end,
    secondLine.start,
    secondLine.end,
    policy.epsilon,
  );

  if (!result) {
    return intersectionIssue(
      "Curves are parallel or coincident; no unique intersection point",
    );
  }

  const firstDomain = domainContainsPoint(
    first.domain,
    result.point,
    policy.epsilon,
  );

  if (!firstDomain.contains) {
    return intersectionIssue(firstDomain.issue);
  }

  const secondDomain = domainContainsPoint(
    second.domain,
    result.point,
    policy.epsilon,
  );

  if (!secondDomain.contains) {
    return intersectionIssue(secondDomain.issue);
  }

  return oneIntersectionCandidate({
    point: result.point,
    multiplicity: "SIMPLE",
    branchKey: "linear-linear",
  });
}

function lineEndpointsForLinearImplicit(
  curve: LinearImplicitCurve,
): Readonly<{ start: Vec2; end: Vec2 }> {
  if (curve.domain.kind === "SEGMENT_PARAMETER") {
    return Object.freeze({
      start: curve.domain.start,
      end: curve.domain.end,
    });
  }

  if (Math.abs(curve.b) > Math.abs(curve.a)) {
    return Object.freeze({
      start: vec2(0, -curve.c / curve.b),
      end: vec2(1, -(curve.a + curve.c) / curve.b),
    });
  }

  return Object.freeze({
    start: vec2(-curve.c / curve.a, 0),
    end: vec2(-(curve.b + curve.c) / curve.a, 1),
  });
}

function domainContainsPoint(
  domain: CurveDomain,
  point: Vec2,
  epsilon: number,
): Readonly<{ contains: true } | { contains: false; issue: string }> {
  if (domain.kind === "ALL") {
    return Object.freeze({ contains: true });
  }

  const dx = domain.end.x - domain.start.x;
  const dy = domain.end.y - domain.start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= epsilon * epsilon) {
    return Object.freeze({
      contains: false,
      issue: "Degenerate segment domain",
    });
  }

  const t =
    ((point.x - domain.start.x) * dx + (point.y - domain.start.y) * dy) /
    lengthSquared;

  if (t < -epsilon || t > 1 + epsilon) {
    return Object.freeze({
      contains: false,
      issue: "Intersection lies outside a bounded curve domain",
    });
  }

  return Object.freeze({ contains: true });
}

function oneIntersectionCandidate(
  candidate: IntersectionCandidate,
): IntersectionResult {
  return Object.freeze({
    candidates: Object.freeze([candidate]),
  });
}

function intersectionIssue(message: string): IntersectionResult {
  return Object.freeze({
    candidates: Object.freeze([]),
    issue: message,
  });
}
