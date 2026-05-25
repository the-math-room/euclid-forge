import type {
  EvaluationIssue,
  EvaluationIssueSeverity,
} from "../evaluation/evaluateGraph";
import type { EvaluationIssueCode } from "../evaluation/evaluationIssue";
import type { NodeId } from "../representation/node";

export function diagnosticsForNode(
  diagnostics: readonly EvaluationIssue[],
  nodeId: NodeId,
): readonly EvaluationIssue[] {
  return Object.freeze(
    diagnostics.filter((diagnostic) => diagnostic.nodeId === nodeId),
  );
}

export function diagnosticsWithCode(
  diagnostics: readonly EvaluationIssue[],
  code: EvaluationIssueCode,
): readonly EvaluationIssue[] {
  return Object.freeze(
    diagnostics.filter((diagnostic) => diagnostic.code === code),
  );
}

export function diagnosticsWithSeverity(
  diagnostics: readonly EvaluationIssue[],
  severity: EvaluationIssueSeverity,
): readonly EvaluationIssue[] {
  return Object.freeze(
    diagnostics.filter((diagnostic) => diagnostic.severity === severity),
  );
}
