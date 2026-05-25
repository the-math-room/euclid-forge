import { describe, expect, test } from "vitest";
import { createGraph } from "../representation/graph";
import { freePoint, triangleNode } from "../representation/node";
import { appState } from "./appState";
import {
  requireSelectedCirclePoints,
  requireSelectedFreePointVertices,
  requireSelectedSegmentEndpoints,
  requireSelectedTriangle,
  selectedCirclePoints,
  selectedFreePointVertices,
  selectedSegmentEndpoints,
  selectedTriangle,
} from "./selectionPredicates";
import { emptyViewState, toggleSelectedNode } from "./viewState";

function selectedState(ids: readonly string[]) {
  const graph = createGraph([
    freePoint("A", 0, 0, "A"),
    freePoint("B", 1, 0, "B"),
    freePoint("C", 0, 1, "C"),
    triangleNode("ABC", "A", "B", "C"),
  ]);

  const viewState = ids.reduce(
    (current, id) => toggleSelectedNode(current, id),
    emptyViewState(),
  );

  return appState(graph, viewState, null);
}

describe("app/selectionPredicates", () => {

  test("selects exactly two free points for segment construction", () => {
    expect(selectedSegmentEndpoints(selectedState(["A", "B"]))).toEqual([
      "A",
      "B",
    ]);

    expect(selectedSegmentEndpoints(selectedState(["A"]))).toBeNull();
    expect(selectedSegmentEndpoints(selectedState(["A", "ABC"]))).toBeNull();
    expect(selectedSegmentEndpoints(selectedState(["A", "B", "C"]))).toBeNull();
  });

  test("requires segment construction endpoints", () => {
    expect(requireSelectedSegmentEndpoints(selectedState(["A", "B"]))).toEqual([
      "A",
      "B",
    ]);

    expect(() => requireSelectedSegmentEndpoints(selectedState(["A"]))).toThrow(
      "Cannot run create-segment while disabled",
    );
  });

  test("selects exactly two free points for circle construction", () => {
    expect(selectedCirclePoints(selectedState(["A", "B"]))).toEqual([
      "A",
      "B",
    ]);

    expect(selectedCirclePoints(selectedState(["A"]))).toBeNull();
    expect(selectedCirclePoints(selectedState(["A", "ABC"]))).toBeNull();
    expect(selectedCirclePoints(selectedState(["A", "B", "C"]))).toBeNull();
  });

  test("requires circle construction points", () => {
    expect(requireSelectedCirclePoints(selectedState(["A", "B"]))).toEqual([
      "A",
      "B",
    ]);

    expect(() => requireSelectedCirclePoints(selectedState(["A"]))).toThrow(
      "Cannot run create-circle while disabled",
    );
  });

  test("selects exactly three free point vertices", () => {
    expect(selectedFreePointVertices(selectedState(["A", "B", "C"]))).toEqual([
      "A",
      "B",
      "C",
    ]);

    expect(selectedFreePointVertices(selectedState(["A", "B"]))).toBeNull();
    expect(
      selectedFreePointVertices(selectedState(["A", "B", "ABC"])),
    ).toBeNull();
  });

  test("requires free point vertices", () => {
    expect(
      requireSelectedFreePointVertices(selectedState(["A", "B", "C"])),
    ).toEqual(["A", "B", "C"]);

    expect(() =>
      requireSelectedFreePointVertices(selectedState(["A", "B"])),
    ).toThrow("Cannot run create-triangle while disabled");
  });

  test("selects exactly one triangle", () => {
    expect(selectedTriangle(selectedState(["ABC"]))).toBe("ABC");

    expect(selectedTriangle(selectedState([]))).toBeNull();
    expect(selectedTriangle(selectedState(["A"]))).toBeNull();
    expect(selectedTriangle(selectedState(["ABC", "A"]))).toBeNull();
  });

  test("requires selected triangle", () => {
    expect(requireSelectedTriangle(selectedState(["ABC"]))).toBe("ABC");

    expect(() => requireSelectedTriangle(selectedState(["A"]))).toThrow(
      "Cannot run triangle command while disabled",
    );
  });
});
