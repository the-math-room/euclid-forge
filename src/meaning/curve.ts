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

export type CircleCurve = Readonly<{
  kind: "CIRCLE";
  center: Vec2;
  radius: number;
  domain: CurveDomain;
}>;

export type Curve2 = LinearImplicitCurve | CircleCurve;

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

export function circleCurve(center: Vec2, radius: number): CircleCurve {
  return Object.freeze({
    kind: "CIRCLE",
    center,
    radius,
    domain: Object.freeze({ kind: "ALL" }),
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

  if (first.kind === "LINEAR_IMPLICIT" && second.kind === "CIRCLE") {
    return intersectLinearCircle(first, second, policy);
  }

  if (first.kind === "CIRCLE" && second.kind === "LINEAR_IMPLICIT") {
    return intersectLinearCircle(second, first, policy);
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


function intersectLinearCircle(
  line: LinearImplicitCurve,
  circle: CircleCurve,
  policy: IntersectionPolicy,
): IntersectionResult {
  if (circle.radius < 0) {
    return intersectionIssue("Circle radius cannot be negative");
  }

  const endpoints = lineEndpointsForLinearImplicit(line);
  const dx = endpoints.end.x - endpoints.start.x;
  const dy = endpoints.end.y - endpoints.start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= policy.epsilon * policy.epsilon) {
    return intersectionIssue("Degenerate linear curve");
  }

  const fx = endpoints.start.x - circle.center.x;
  const fy = endpoints.start.y - circle.center.y;

  const quadraticA = lengthSquared;
  const quadraticB = 2 * (fx * dx + fy * dy);
  const quadraticC = fx * fx + fy * fy - circle.radius * circle.radius;
  const discriminant =
    quadraticB * quadraticB - 4 * quadraticA * quadraticC;
  const scale = Math.max(
    1,
    quadraticB * quadraticB,
    Math.abs(4 * quadraticA * quadraticC),
    circle.radius * circle.radius,
    lengthSquared,
  );
  const tolerance = policy.epsilon * scale;

  if (discriminant < -tolerance) {
    return intersectionIssue("Curves do not intersect");
  }

  if (Math.abs(discriminant) <= tolerance) {
    const t = -quadraticB / (2 * quadraticA);
    const point = vec2(endpoints.start.x + t * dx, endpoints.start.y + t * dy);

    return candidateIfInDomains(
      line,
      circle,
      point,
      Object.freeze({
        point,
        multiplicity: "TANGENT",
        branchKey: "linear-circle:tangent",
      }),
      policy,
    );
  }

  const sqrtDiscriminant = Math.sqrt(discriminant);
  const firstT = (-quadraticB - sqrtDiscriminant) / (2 * quadraticA);
  const secondT = (-quadraticB + sqrtDiscriminant) / (2 * quadraticA);
  const sorted = [firstT, secondT].sort((a, b) => a - b);
  const candidates: IntersectionCandidate[] = [];

  for (const [index, t] of sorted.entries()) {
    const point = vec2(endpoints.start.x + t * dx, endpoints.start.y + t * dy);
    const filtered = filterCandidateByDomains(
      line,
      circle,
      Object.freeze({
        point,
        multiplicity: "SIMPLE",
        branchKey: `linear-circle:${index}`,
      }),
      policy,
    );

    if (filtered) {
      candidates.push(filtered);
    }
  }

  if (candidates.length === 0) {
    return intersectionIssue("Curves intersect outside bounded curve domains");
  }

  return Object.freeze({
    candidates: Object.freeze(candidates),
  });
}

function candidateIfInDomains(
  first: Curve2,
  second: Curve2,
  point: Vec2,
  candidate: IntersectionCandidate,
  policy: IntersectionPolicy,
): IntersectionResult {
  const filtered = filterCandidateByDomains(first, second, candidate, policy);

  if (!filtered) {
    return intersectionIssue("Curves intersect outside bounded curve domains");
  }

  return oneIntersectionCandidate(filtered);
}

function filterCandidateByDomains(
  first: Curve2,
  second: Curve2,
  candidate: IntersectionCandidate,
  policy: IntersectionPolicy,
): IntersectionCandidate | null {
  const firstDomain = domainContainsPoint(
    first.domain,
    candidate.point,
    policy.epsilon,
  );

  if (!firstDomain.contains) {
    return null;
  }

  const secondDomain = domainContainsPoint(
    second.domain,
    candidate.point,
    policy.epsilon,
  );

  if (!secondDomain.contains) {
    return null;
  }

  return candidate;
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
