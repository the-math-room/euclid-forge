import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import type { EvaluatedGeometry } from "../evaluation/evaluated";
import { createEvaluationContext } from "./evaluationContext";

describe("geometry/evaluationContext", () => {
  test("gets evaluated points by id", () => {
    const values = new Map<string, EvaluatedGeometry>([
      [
        "A",
        {
          kind: "POINT",
        sourceKind: "FREE_POINT",
          id: "A",
          point: vec2(1, 2),
          label: "A",
          role: "FREE",
        },
      ],
    ]);

    expect(createEvaluationContext(values).getPoint("A")).toEqual({
      kind: "POINT",
        sourceKind: "FREE_POINT",
      id: "A",
      point: vec2(1, 2),
      label: "A",
      role: "FREE",
    });
  });

  test("rejects missing evaluated dependencies", () => {
    const context = createEvaluationContext(new Map());

    expect(() => context.getPoint("A")).toThrow(
      "Missing evaluated dependency: A",
    );
  });

  test("rejects evaluated dependencies of the wrong kind", () => {
    const values = new Map<string, EvaluatedGeometry>([
      [
        "AB",
        {
          kind: "SEGMENT",
        sourceKind: "SEGMENT",
          id: "AB",
          a: vec2(0, 0),
          b: vec2(1, 0),
        },
      ],
    ]);

    expect(() => createEvaluationContext(values).getPoint("AB")).toThrow(
      "Expected AB to evaluate to POINT, got SEGMENT",
    );
  });
});
