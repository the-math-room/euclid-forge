import { describe, expect, test } from "vitest";
import {
  diagnosticsForNode,
  diagnosticsWithCode,
  diagnosticsWithSeverity,
} from "./diagnostics";
import type { EvaluationIssue } from "../evaluation/evaluateGraph";

const diagnostics: readonly EvaluationIssue[] = Object.freeze([
  {
    nodeId: "X",
    severity: "warning",
    code: "NO_REAL_INTERSECTION",
    message: "No real intersection",
  },
  {
    nodeId: "Y",
    severity: "warning",
    code: "STALE_INTERSECTION_BRANCH",
    message: "Stale branch",
  },
]);

describe("core/diagnostics", () => {
  test("filters diagnostics by node id", () => {
    expect(diagnosticsForNode(diagnostics, "X")).toEqual([diagnostics[0]]);
  });

  test("filters diagnostics by code", () => {
    expect(
      diagnosticsWithCode(diagnostics, "STALE_INTERSECTION_BRANCH"),
    ).toEqual([diagnostics[1]]);
  });

  test("filters diagnostics by severity", () => {
    expect(diagnosticsWithSeverity(diagnostics, "warning")).toEqual(
      diagnostics,
    );
  });
});
