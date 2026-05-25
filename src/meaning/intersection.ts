import type { Vec2 } from "./vec2";

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

export type IntersectionPolicy = Readonly<{
  epsilon: number;
}>;

export const DEFAULT_INTERSECTION_POLICY: IntersectionPolicy = Object.freeze({
  epsilon: 1e-9,
});

export function oneIntersectionCandidate(
  candidate: IntersectionCandidate,
): IntersectionResult {
  return Object.freeze({
    candidates: Object.freeze([candidate]),
  });
}

export function intersectionIssue(message: string): IntersectionResult {
  return Object.freeze({
    candidates: Object.freeze([]),
    issue: message,
  });
}
