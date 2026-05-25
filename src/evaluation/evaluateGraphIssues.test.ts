import { describe, expect, test, vi } from "vitest";
import { createGraph } from "../representation/graph";
import { freePoint, segmentNode } from "../representation/node";

vi.mock("../geometry/geometryRegistry", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../geometry/geometryRegistry")>();
  const { GeometryEvaluationIssueError } =
    await import("./evaluationIssue");

  return {
    ...original,
    evaluateGeometryNode: vi.fn((node) => {
      if (node.id === "A") {
        throw new GeometryEvaluationIssueError("A", "A is undefined");
      }

      if (node.id === "AB") {
        throw new Error("Missing evaluated dependency: A");
      }

      return {
        kind: "POINT",
        sourceKind: "FREE_POINT",
        id: node.id,
        point: { x: 1, y: 2 },
        label: node.id,
        role: "FREE",
      };
    }),
  };
});

import { evaluateGraph } from "./evaluateGraph";

describe("evaluation/evaluateGraph partial issues", () => {
  test("omits nodes that report evaluation issues", () => {
    const graph = createGraph([freePoint("A", 0, 0, "A")]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("A")).toBe(false);
    expect(evaluated.ordered).toEqual([]);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "A",
        message: "A is undefined",
      },
    ]);
  });

  test("omits dependents when an evaluated dependency is unavailable", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      segmentNode("AB", "A", "B"),
    ]);

    const evaluated = evaluateGraph(graph);

    expect(evaluated.values.has("A")).toBe(false);
    expect(evaluated.values.has("AB")).toBe(false);
    expect(evaluated.values.has("B")).toBe(true);
    expect(evaluated.issues).toEqual([
      {
        nodeId: "A",
        message: "A is undefined",
      },
      {
        nodeId: "AB",
        message: "Cannot evaluate AB; Missing evaluated dependency: A",
      },
    ]);
  });
});
