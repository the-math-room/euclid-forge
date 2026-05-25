import { describe, expect, test } from "vitest";
import {
  centroidNode,
  circleNode,
  freePoint,
  lineNode,
  midpointNode,
  segmentNode,
  triangleNode,
} from "../representation/node";
import {
  dependenciesForGeometryNode,
  geometryDefinitionForKind,
} from "./geometryRegistry";

describe("geometry/geometryRegistry", () => {
  test("looks up definitions by kind", () => {
    expect(geometryDefinitionForKind("FREE_POINT").kind).toBe("FREE_POINT");
    expect(geometryDefinitionForKind("SEGMENT").kind).toBe("SEGMENT");
    expect(geometryDefinitionForKind("LINE").kind).toBe("LINE");
    expect(geometryDefinitionForKind("CIRCLE").kind).toBe("CIRCLE");
    expect(geometryDefinitionForKind("TRIANGLE").kind).toBe("TRIANGLE");
    expect(geometryDefinitionForKind("MIDPOINT").kind).toBe("MIDPOINT");
    expect(geometryDefinitionForKind("CENTROID").kind).toBe("CENTROID");
  });

  test("gets free point dependencies", () => {
    expect(dependenciesForGeometryNode(freePoint("A", 0, 0, "A"))).toEqual([]);
  });

  test("gets segment dependencies", () => {
    expect(dependenciesForGeometryNode(segmentNode("AB", "A", "B"))).toEqual([
      "A",
      "B",
    ]);
  });

  test("gets line dependencies", () => {
    expect(dependenciesForGeometryNode(lineNode("L", "A", "B"))).toEqual([
      "A",
      "B",
    ]);
  });

  test("gets circle dependencies", () => {
    expect(dependenciesForGeometryNode(circleNode("c", "A", "B"))).toEqual([
      "A",
      "B",
    ]);
  });

  test("gets triangle dependencies", () => {
    expect(
      dependenciesForGeometryNode(triangleNode("ABC", "A", "B", "C")),
    ).toEqual(["A", "B", "C"]);
  });

  test("gets midpoint dependencies", () => {
    expect(dependenciesForGeometryNode(midpointNode("M", "AB", "M"))).toEqual([
      "AB",
    ]);
  });

  test("gets centroid dependencies", () => {
    expect(dependenciesForGeometryNode(centroidNode("G", "ABC", "G"))).toEqual([
      "ABC",
    ]);
  });
});
