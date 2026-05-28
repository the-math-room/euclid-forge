import { createGraph } from "@euclid-forge/core";
import type { Graph } from "@euclid-forge/core";
import {
  centroidNode,
  circleNode,
  freePoint,
  lineNode,
  linearConstrainedPointNode,
  midpointNode,
  segmentIntersectionNode,
  segmentMeasurementNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core";

/**
 * Default browser demo scene.
 *
 * The first cluster intentionally preserves the original smoke-test fixture:
 * A, B, C, ABC, AB, M_AB, and G at their historical coordinates/ids.
 *
 * The rest of the scene is intentionally small. It highlights the app's more
 * distinctive behavior: derived points, draggable labels, measurements,
 * constrained parallel/perpendicular points, intersections, and dependent
 * circles.
 */
export function initialScene(): Graph {
  return createGraph([
    // Canonical smoke-test fixture. Keep these ids and coordinates stable.
    freePoint("A", -2, -1, "A"),
    freePoint("B", 2, -1, "B"),
    freePoint("C", 0, 2, "C"),

    { ...triangleNode("ABC", "A", "B", "C"), zIndex: 0 },
    { ...segmentNode("AB", "A", "B"), zIndex: 3 },
    midpointNode("M_AB", "AB", "M"),
    centroidNode("G", "ABC", "G"),

    // Complete the triangle just enough to show derived geometry.
    { ...segmentNode("BC", "B", "C"), zIndex: 3 },
    { ...segmentNode("CA", "C", "A"), zIndex: 3 },
    { ...segmentNode("MAB_G", "M_AB", "G"), zIndex: 5 },
    { ...segmentMeasurementNode("MEASURE_AB", "AB"), zIndex: 12 },

    // A compact constraint sampler:
    // P∥ is constrained parallel to AB from P0.
    // Q⊥ is constrained perpendicular to AB from Q0.
    freePoint("P_ANCHOR", -1.75, -2.65, "P0"),
    linearConstrainedPointNode(
      "P_PARALLEL",
      "AB",
      "P_ANCHOR",
      "PARALLEL",
      2.25,
      "P∥",
    ),
    { ...segmentNode("PARALLEL_SAMPLE", "P_ANCHOR", "P_PARALLEL"), zIndex: 7 },

    freePoint("Q_ANCHOR", 1.15, -2.65, "Q0"),
    linearConstrainedPointNode(
      "Q_PERPENDICULAR",
      "AB",
      "Q_ANCHOR",
      "PERPENDICULAR",
      1.75,
      "Q⊥",
    ),
    {
      ...segmentNode("PERPENDICULAR_SAMPLE", "Q_ANCHOR", "Q_PERPENDICULAR"),
      zIndex: 7,
    },

    // A dependent construction chain:
    // constrained segment + cutter segment -> intersection -> circle center.
    freePoint("CUT_A", -0.6, -3.4, "K1"),
    freePoint("CUT_B", -0.6, -1.8, "K2"),
    { ...segmentNode("CUTTER", "CUT_A", "CUT_B"), zIndex: 6 },
    segmentIntersectionNode("X_CHAIN", "PARALLEL_SAMPLE", "CUTTER", "X"),
    freePoint("CHAIN_RADIUS", 0.9, -1.85, "R"),
    { ...circleNode("DEPENDENT_CIRCLE", "X_CHAIN", "CHAIN_RADIUS"), zIndex: 6 },

    // One infinite line, separated from the main cluster.
    freePoint("L1", -5.0, 1.25, "L1"),
    freePoint("L2", -3.1, 0.4, "L2"),
    { ...lineNode("LINE_L1_L2", "L1", "L2"), zIndex: 1 },
  ]);
}
