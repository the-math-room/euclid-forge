import {
  DEFAULT_INTERSECTION_POLICY,
  type IntersectionPolicy,
} from "./intersection";
import { vec2, type Vec2 } from "./vec2";

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
  epsilon = DEFAULT_INTERSECTION_POLICY.epsilon,
): Vec2 | null {
  return lineIntersectionWithParameters(a1, a2, b1, b2, epsilon)?.point ?? null;
}

export function lineIntersectionWithParameters(
  a1: Vec2,
  a2: Vec2,
  b1: Vec2,
  b2: Vec2,
  epsilonOrPolicy: number | IntersectionPolicy = DEFAULT_INTERSECTION_POLICY,
): LineIntersectionResult | null {
  const epsilon =
    typeof epsilonOrPolicy === "number"
      ? epsilonOrPolicy
      : epsilonOrPolicy.epsilon;
  const ax = a2.x - a1.x;
  const ay = a2.y - a1.y;
  const bx = b2.x - b1.x;
  const by = b2.y - b1.y;
  const determinant = cross(ax, ay, bx, by);
  const scale = Math.max(1, ax * ax + ay * ay, bx * bx + by * by);

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

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}
