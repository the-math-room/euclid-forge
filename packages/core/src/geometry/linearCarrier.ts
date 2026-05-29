import type { EvaluatedGeometry } from "../evaluation/evaluated";
import { vec2 } from "../meaning/vec2";
import type { Vec2 } from "../meaning/vec2";

export type LinearCarrierDomain =
  | Readonly<{ kind: "UNBOUNDED" }>
  | Readonly<{ kind: "SEGMENT"; min: 0; max: 1 }>;

export type LinearCarrier = Readonly<{
  anchor: Vec2;
  direction: Vec2;
  length: number;
  domain: LinearCarrierDomain;
}>;

const EPSILON = 1e-9;

export function linearCarrierForEvaluatedGeometry(
  value: EvaluatedGeometry,
): LinearCarrier | null {
  switch (value.kind) {
    case "SEGMENT":
      return linearCarrierFromEndpoints(value.a, value.b, {
        kind: "SEGMENT",
        min: 0,
        max: 1,
      });

    case "LINE":
      return linearCarrierFromEndpoints(value.a, value.b, {
        kind: "UNBOUNDED",
      });

    case "POINT":
    case "CIRCLE":
    case "TRIANGLE":
      return null;
  }
}

export function pointOnLinearCarrier(
  carrier: LinearCarrier,
  parameter: number,
): Vec2 {
  return vec2(
    carrier.anchor.x + carrier.direction.x * carrier.length * parameter,
    carrier.anchor.y + carrier.direction.y * carrier.length * parameter,
  );
}

export function projectPointToLinearCarrier(
  carrier: LinearCarrier,
  point: Vec2,
): number {
  const dx = point.x - carrier.anchor.x;
  const dy = point.y - carrier.anchor.y;
  const raw =
    (dx * carrier.direction.x + dy * carrier.direction.y) / carrier.length;

  return clampLinearParameter(carrier, raw);
}

export function clampLinearParameter(
  carrier: LinearCarrier,
  parameter: number,
): number {
  switch (carrier.domain.kind) {
    case "UNBOUNDED":
      return parameter;

    case "SEGMENT":
      return Math.max(carrier.domain.min, Math.min(carrier.domain.max, parameter));
  }
}

function linearCarrierFromEndpoints(
  a: Vec2,
  b: Vec2,
  domain: LinearCarrierDomain,
): LinearCarrier | null {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);

  if (length <= EPSILON) {
    return null;
  }

  return Object.freeze({
    anchor: a,
    direction: vec2(dx / length, dy / length),
    length,
    domain,
  });
}
