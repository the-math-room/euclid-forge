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
 * Default browser sanity scene.
 *
 * The first cluster intentionally preserves the original smoke-test fixture:
 * A, B, C, ABC, AB, M_AB, and G at their historical coordinates/ids.
 *
 * Additional geometry demonstrates derived points, measurements, intersections,
 * infinite lines, circles, z-order, and linear constraints without depending on
 * experimental polygon/face support.
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

    // Complete the triangle edges without disturbing the original AB/M/G ids.
    { ...segmentNode("BC", "B", "C"), zIndex: 3 },
    { ...segmentNode("CA", "C", "A"), zIndex: 3 },
    midpointNode("M_BC", "BC", "Mbc"),
    midpointNode("M_CA", "CA", "Mca"),

    // Derived-to-derived segment.
    { ...segmentNode("MAB_G", "M_AB", "G"), zIndex: 5 },

    // Persistent measurement annotations.
    { ...segmentMeasurementNode("MEASURE_AB", "AB"), zIndex: 12 },
    { ...segmentMeasurementNode("MEASURE_BC", "BC"), zIndex: 12 },

    // Infinite line rendering and hit testing.
    freePoint("L1", -5.5, 1.25, "L1"),
    freePoint("L2", -3.0, 0.25, "L2"),
    { ...lineNode("LINE_L1_L2", "L1", "L2"), zIndex: 1 },

    // Body-draggable circle.
    freePoint("O", 4.25, 0.25, "O"),
    freePoint("R", 5.75, 0.25, "R"),
    { ...circleNode("CIRCLE_O_R", "O", "R"), zIndex: 6 },

    // Segment-intersection cluster.
    freePoint("S1", 3.0, -2.5, "S1"),
    freePoint("S2", 6.0, 0.5, "S2"),
    freePoint("S3", 3.0, 0.5, "S3"),
    freePoint("S4", 6.0, -2.5, "S4"),
    { ...segmentNode("S1_S2", "S1", "S2"), zIndex: 4 },
    { ...segmentNode("S3_S4", "S3", "S4"), zIndex: 4 },
    segmentIntersectionNode("X_SEGMENTS", "S1_S2", "S3_S4", "X"),
    { ...segmentMeasurementNode("MEASURE_S1_S2", "S1_S2"), zIndex: 12 },

    // Linear constrained points: one segment parallel to AB and one
    // perpendicular to AB, both driven by reference + anchor + offset.
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

    // Deeper dependency chain:
    // AB -> parallel constrained point -> dependent segment -> intersection
    // -> circle center, with the circle radius fixed by a separate free point.
    freePoint("PARALLEL_CUT_A", -0.6, -3.4, "K1"),
    freePoint("PARALLEL_CUT_B", -0.6, -1.8, "K2"),
    { ...segmentNode("PARALLEL_CUTTER", "PARALLEL_CUT_A", "PARALLEL_CUT_B"), zIndex: 6 },
    segmentIntersectionNode(
      "X_PARALLEL_CHAIN",
      "PARALLEL_SAMPLE",
      "PARALLEL_CUTTER",
      "Xp",
    ),
    freePoint("CHAIN_CIRCLE_EDGE", 0.9, -1.85, "Re"),
    { ...circleNode("CIRCLE_CENTERED_ON_CHAIN", "X_PARALLEL_CHAIN", "CHAIN_CIRCLE_EDGE"), zIndex: 6 },
    { ...segmentMeasurementNode("MEASURE_CHAIN_RADIUS", "PARALLEL_CUTTER"), zIndex: 12 },

    // Overlapping triangles for visual order, hit testing, body dragging, and
    // z-order command checks. These remain ordinary triangle geometry, not faces.
    freePoint("D", -5.75, -2.25, "D"),
    freePoint("E", -3.25, -2.25, "E"),
    freePoint("F", -4.5, -0.25, "F"),
    { ...triangleNode("DEF_FRONT", "D", "E", "F"), zIndex: 8 },

    freePoint("H", -5.25, -2.75, "H"),
    freePoint("I", -2.75, -2.75, "I"),
    freePoint("J", -4.0, -0.75, "J"),
    { ...triangleNode("HIJ_BACK", "H", "I", "J"), zIndex: 6 },

    // Z-order / hidden-line beta sampler using only existing supported shapes.
    freePoint("ZL_A", 3.25, 2.75, "ZA"),
    freePoint("ZL_B", 6.25, 2.75, "ZB"),
    { ...segmentNode("LOW_SEGMENT_BEHIND_CIRCLE", "ZL_A", "ZL_B"), zIndex: 5 },
  ]);
}
