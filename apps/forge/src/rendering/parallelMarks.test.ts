import { describe, expect, test } from "vitest";
import { createGraph } from "@euclid-forge/core";
import { freePoint, parallelPointNode, segmentNode } from "@euclid-forge/core";
import { parallelMarkCountsForGraph } from "./parallelMarks";

describe("rendering/parallelMarks", () => {
  test("assigns one mark to a reference segment and its constrained parallel segment", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
      parallelPointNode("D", "AB", "C", 1, "D"),
      segmentNode("CD", "C", "D"),
    ]);

    expect([...parallelMarkCountsForGraph({ graph })]).toEqual([
      ["AB", 1],
      ["CD", 1],
    ]);
  });

  test("uses transitive parallel relations as one family", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      freePoint("E", 0, 2, "E"),
      segmentNode("AB", "A", "B"),
      parallelPointNode("D", "AB", "C", 1, "D"),
      segmentNode("CD", "C", "D"),
      parallelPointNode("F", "CD", "E", 1, "F"),
      segmentNode("EF", "E", "F"),
    ]);

    expect([...parallelMarkCountsForGraph({ graph })]).toEqual([
      ["AB", 1],
      ["CD", 1],
      ["EF", 1],
    ]);
  });

  test("assigns second and third mark counts to later independent families", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      freePoint("D", 2, 0, "D"),
      freePoint("E", 3, 0, "E"),
      freePoint("F", 2, 1, "F"),
      freePoint("G", 4, 0, "G"),
      freePoint("H", 5, 0, "H"),
      freePoint("I", 4, 1, "I"),
      segmentNode("AB", "A", "B"),
      parallelPointNode("C2", "AB", "C", 1, "C2"),
      segmentNode("CC2", "C", "C2"),
      segmentNode("DE", "D", "E"),
      parallelPointNode("F2", "DE", "F", 1, "F2"),
      segmentNode("FF2", "F", "F2"),
      segmentNode("GH", "G", "H"),
      parallelPointNode("I2", "GH", "I", 1, "I2"),
      segmentNode("II2", "I", "I2"),
    ]);

    expect([...parallelMarkCountsForGraph({ graph })]).toEqual([
      ["AB", 1],
      ["CC2", 1],
      ["DE", 2],
      ["FF2", 2],
      ["GH", 3],
      ["II2", 3],
    ]);
  });

  test("does not mark hidden parallel families", () => {
    const graph = createGraph([
      freePoint("A", 0, 0, "A"),
      freePoint("B", 1, 0, "B"),
      freePoint("C", 0, 1, "C"),
      segmentNode("AB", "A", "B"),
      parallelPointNode("D", "AB", "C", 1, "D"),
      segmentNode("CD", "C", "D"),
    ]);

    expect([
      ...parallelMarkCountsForGraph({
        graph,
        hiddenNodeIds: new Set(["CD"]),
      }),
    ]).toEqual([]);
  });
});
