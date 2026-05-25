import { describe, expect, test } from "vitest";
import { lineNode } from "./node";

describe("representation/lineNode", () => {
  test("creates a line node", () => {
    expect(lineNode("L_AB", "A", "B")).toEqual({
      kind: "LINE",
      id: "L_AB",
      a: "A",
      b: "B",
    });
  });
});
