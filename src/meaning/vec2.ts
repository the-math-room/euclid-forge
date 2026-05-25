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


export type IntersectionMultiplicity = "SIMPLE" | "TANGENT";

export type IntersectionCandidate = Readonly<{
  point: Vec2;
  multiplicity: IntersectionMultiplicity;
  branchKey: string;
}>;

export type IntersectionResult = Readonly<{
  candidates: readonly IntersectionCandidate[];
  issue?: string;
}>;

export type LineIntersectionResult = Readonly<{
  point: Vec2;
  t: number;
  u: number;
}>;

export function lineIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = 1e-9,
): Vec2 | null {
  return lineIntersectionWithParameters(a1, a2, b1, b2, epsilon)?.point ?? null;
}

export function segmentIntersection(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = 1e-9,
): Vec2 | null {
  return segmentSegmentIntersections(a1, a2, b1, b2, epsilon).candidates[0]
    ?.point ?? null;
}

export function segmentSegmentIntersections(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = 1e-9,
): IntersectionResult {
  const result = lineIntersectionWithParameters(a1, a2, b1, b2, epsilon);

  if (!result) {
    return intersectionIssue(
      "Segments are parallel or coincident; no unique intersection point",
    );
  }

  if (!isUnitIntervalParameter(result.t, epsilon)) {
    return intersectionIssue(
      "Supporting lines intersect outside the first segment",
    );
  }

  if (!isUnitIntervalParameter(result.u, epsilon)) {
    return intersectionIssue(
      "Supporting lines intersect outside the second segment",
    );
  }

  return oneIntersectionCandidate({
    point: result.point,
    multiplicity: "SIMPLE",
    branchKey: "segment-segment",
  });
}

export function lineIntersectionWithParameters(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilon = 1e-9,
): LineIntersectionResult | null {
  const ax = a2.x - a1.x;
  const ay = a2.y - a1.y;
  const bx = b2.x - b1.x;
  const by = b2.y - b1.y;
  const determinant = cross(ax, ay, bx, by);
  const scale = Math.max(
    1,
    ax * ax + ay * ay,
    bx * bx + by * by,
  );

  if (Math.abs(determinant) <= epsilon * scale) {
    return null;
  }

  const cx = b1.x - a1.x;
  const cy = b1.y - a1.y;
  const t = cross(cx, cy, bx, by) / determinant;
  const u = cross(cx, cy, ax, ay) / determinant;

  return Object.freeze({
    point: vec2(a1.x + t * ax, a1.y + t * ay),
    t,
    u,
  });
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

function isUnitIntervalParameter(value: number, epsilon: number): boolean {
  return value >= -epsilon && value <= 1 + epsilon;
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

