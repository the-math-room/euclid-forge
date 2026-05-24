import { describe, expect, test } from "vitest";
import { vec2 } from "../meaning/vec2";
import { freePoint, midpointNode, segmentNode } from "../representation/node";
import { evaluateScene } from "./evaluateScene";

describe("evaluation/evaluateScene", () => {
  test("evaluates free points", () => {
    const scene = {
      nodes: [
        freePoint("A", -2, 0, "A"),
        freePoint("B", 2, 0, "B"),
      ],
    };

    const evaluated = evaluateScene(scene);

    expect(evaluated.values.get("A")).toEqual({
      kind: "POINT",
      id: "A",
      point: vec2(-2, 0),
      label: "A",
      source: "FREE",
    });

    expect(evaluated.values.get("B")).toEqual({
      kind: "POINT",
      id: "B",
      point: vec2(2, 0),
      label: "B",
      source: "FREE",
    });
  });

  test("evaluates a segment from two free points", () => {
    const scene = {
      nodes: [
        freePoint("A", -2, 0, "A"),
        freePoint("B", 2, 0, "B"),
        segmentNode("AB", "A", "B"),
      ],
    };

    const evaluated = evaluateScene(scene);

    expect(evaluated.values.get("AB")).toEqual({
      kind: "SEGMENT",
      id: "AB",
      a: vec2(-2, 0),
      b: vec2(2, 0),
    });
  });

  test("evaluates a constrained midpoint of a segment", () => {
    const scene = {
      nodes: [
        freePoint("A", -2, 0, "A"),
        freePoint("B", 2, 0, "B"),
        segmentNode("AB", "A", "B"),
        midpointNode("M", "AB", "M"),
      ],
    };

    const evaluated = evaluateScene(scene);

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      source: "CONSTRAINED",
    });
  });

  test("evaluates unordered nodes by dependency order", () => {
    const scene = {
      nodes: [
        midpointNode("M", "AB", "M"),
        segmentNode("AB", "A", "B"),
        freePoint("B", 2, 0, "B"),
        freePoint("A", -2, 0, "A"),
      ],
    };

    const evaluated = evaluateScene(scene);

    expect(evaluated.values.get("AB")).toEqual({
      kind: "SEGMENT",
      id: "AB",
      a: vec2(-2, 0),
      b: vec2(2, 0),
    });

    expect(evaluated.values.get("M")).toEqual({
      kind: "POINT",
      id: "M",
      point: vec2(0, 0),
      label: "M",
      source: "CONSTRAINED",
    });
  });

  test("throws when a dependency is genuinely missing", () => {
    const scene = {
      nodes: [
        freePoint("A", -2, 0, "A"),
        segmentNode("AB", "A", "B"),
      ],
    };

    expect(() => evaluateScene(scene)).toThrow(
      "Missing dependency: AB depends on B",
    );
  });

  test("throws when node ids are duplicated", () => {
    const scene = {
      nodes: [
        freePoint("A", -2, 0, "A"),
        freePoint("A", 2, 0, "A2"),
      ],
    };

    expect(() => evaluateScene(scene)).toThrow("Duplicate node id: A");
  });
});
