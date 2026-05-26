import type { EvaluatedGeometry } from "../evaluation/evaluated";
import { vec2 } from "../meaning/vec2";
import type { Vec2 } from "../meaning/vec2";
import type { LinearConstraintMode } from "../representation/node";

export function constrainedDirectionForLinearGeometry(
  value: EvaluatedGeometry,
  mode: LinearConstraintMode,
): Vec2 | null {
  const direction = unitDirectionForLinearGeometry(value);

  if (!direction) {
    return null;
  }

  switch (mode) {
    case "PARALLEL":
      return direction;

    case "PERPENDICULAR":
      return vec2(-direction.y, direction.x);
  }
}

function unitDirectionForLinearGeometry(value: EvaluatedGeometry): Vec2 | null {
  switch (value.kind) {
    case "SEGMENT":
    case "LINE": {
      const dx = value.b.x - value.a.x;
      const dy = value.b.y - value.a.y;
      const length = Math.hypot(dx, dy);

      if (length <= 1e-9) {
        return null;
      }

      return vec2(dx / length, dy / length);
    }

    case "POINT":
    case "SEGMENT_MEASUREMENT":
    case "CIRCLE":
    case "TRIANGLE":
      return null;
  }
}
