import { describe, expect, test } from "vitest";
import { freePoint, midpointNode, segmentNode } from "../representation/node";
import { topoSort } from "./topoSort";

describe("evaluation/topoSort", () => {
  test("orders dependencies before dependents", () => {
    const ordered = topoSort([
      midpointNode("M", "AB", "M"),
      segmentNode("AB", "A", "B"),
      freePoint("B", 2, 0, "B"),
      freePoint("A", -2, 0, "A"),
    ]);

    const ids = ordered.map((node) => node.id);

    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("AB"));
    expect(ids.indexOf("AB")).toBeLessThan(ids.indexOf("M"));
  });

  test("throws when a dependency is missing", () => {
    expect(() =>
      topoSort([
        freePoint("A", -2, 0, "A"),
        segmentNode("AB", "A", "B"),
      ]),
    ).toThrow("Missing dependency: AB depends on B");
  });

  test("throws when node ids are duplicated", () => {
    expect(() =>
      topoSort([
        freePoint("A", -2, 0, "A"),
        freePoint("A", 2, 0, "A2"),
      ]),
    ).toThrow("Duplicate node id: A");
  });
});
