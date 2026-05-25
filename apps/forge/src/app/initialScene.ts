import { createGraph } from "@euclid-forge/core/representation/graph";
import type { Graph } from "@euclid-forge/core/representation/graph";
import {
  centroidNode,
  circleNode,
  freePoint,
  lineNode,
  midpointNode,
  segmentIntersectionNode,
  segmentNode,
  triangleNode,
} from "@euclid-forge/core/representation/node";

/**
 * Default browser sanity scene.
 *
 * The first cluster intentionally preserves the original smoke-test fixture:
 * A, B, C, ABC, AB, M_AB, and G at their historical coordinates/ids.
 *
 * Additional geometry around that fixture exercises more app paths without
 * invalidating pixel-based smoke checks.
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

    // Infinite line rendering and hit testing.
    freePoint("L1", -5.5, 1.25, "L1"),
    freePoint("L2", -3.0, 0.25, "L2"),
    { ...lineNode("LINE_L1_L2", "L1", "L2"), zIndex: 1 },

    // Body-draggable circle.
    freePoint("O", 4.25, 0.25, "O"),
    freePoint("R", 5.75, 0.25, "R"),
    { ...circleNode("CIRCLE_O_R", "O", "R"), zIndex: 1 },

    // Explicit segment-intersection cluster.
    freePoint("S1", 3.0, -2.5, "S1"),
    freePoint("S2", 6.0, 0.5, "S2"),
    freePoint("S3", 3.0, 0.5, "S3"),
    freePoint("S4", 6.0, -2.5, "S4"),
    { ...segmentNode("S1_S2", "S1", "S2"), zIndex: 4 },
    { ...segmentNode("S3_S4", "S3", "S4"), zIndex: 4 },
    segmentIntersectionNode("X_SEGMENTS", "S1_S2", "S3_S4", "X"),

    // Overlapping triangles for visual order, hit testing, body dragging, and
    // z-order command checks. Placed away from the canonical ABC body tests.
    freePoint("D", -5.75, -2.25, "D"),
    freePoint("E", -3.25, -2.25, "E"),
    freePoint("F", -4.5, -0.25, "F"),
    { ...triangleNode("DEF_FRONT", "D", "E", "F"), zIndex: 8 },

    freePoint("H", -5.25, -2.75, "H"),
    freePoint("I", -2.75, -2.75, "I"),
    freePoint("J", -4.0, -0.75, "J"),
    { ...triangleNode("HIJ_BACK", "H", "I", "J"), zIndex: 6 },
  ]);
}
