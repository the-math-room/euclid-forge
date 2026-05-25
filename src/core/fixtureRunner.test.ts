import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
} from "./index";

type GoldenFixtureExpectation = Readonly<{
  name: string;
  workspaceFile: string;
  evaluatedIds: readonly string[];
  diagnosticCodes: readonly string[];
}>;

const GOLDEN_FIXTURES: readonly GoldenFixtureExpectation[] = [
  {
    name: "Euclid I.1 equilateral triangle",
    workspaceFile: "../app/fixtures/euclid-i-1-equilateral.workspace.json",
    evaluatedIds: [
      "P1",
      "P2",
      "S_P1_P2",
      "C1",
      "C2",
      "X_C1_C2_circle_circle_0",
      "X_C1_C2_circle_circle_1",
      "S_P1_X_C1_C2_circle_circle_1",
      "S_P2_X_C1_C2_circle_circle_1",
    ],
    diagnosticCodes: [],
  },
  {
    name: "disjoint circles omit unavailable curve intersection",
    workspaceFile: "../app/fixtures/disjoint-circles.workspace.json",
    evaluatedIds: [
      "A",
      "AR",
      "B",
      "BR",
      "C1",
      "C2",
    ],
    diagnosticCodes: ["NO_REAL_INTERSECTION"],
  },
];

function readFixtureText(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), "utf-8");
}

describe("core golden fixture runner", () => {
  for (const fixture of GOLDEN_FIXTURES) {
    test(`${fixture.name} evaluates through the headless core facade`, () => {
      const workspace = geometryWorkspaceFromJsonText(
        readFixtureText(fixture.workspaceFile),
      );
      const engine = createGeometryEngine(workspace);
      const evaluated = engine.evaluate();

      expect([...evaluated.values.keys()]).toEqual(fixture.evaluatedIds);
      expect(evaluated.issues.map((issue) => issue.code)).toEqual(
        fixture.diagnosticCodes,
      );
      expect(engine.serialize()).toEqual(workspace);
    });
  }
});
