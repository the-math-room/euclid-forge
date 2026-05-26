import type { EvaluatedSegmentMeasurement } from "../../evaluation/evaluated";
import type { SegmentMeasurementPrecision } from "../../representation/node";
import type { EvaluationContext } from "../evaluationContext";
import type { GeometryDefinition, NodeByKind } from "../geometryDefinition";

export const segmentMeasurementDefinition: GeometryDefinition<"SEGMENT_MEASUREMENT"> =
  Object.freeze({
    kind: "SEGMENT_MEASUREMENT",

    representation: Object.freeze({
      dependencies: (node: NodeByKind<"SEGMENT_MEASUREMENT">) => [
        node.segment,
      ],
    }),

    evaluation: Object.freeze({
      evaluate: (
        node: NodeByKind<"SEGMENT_MEASUREMENT">,
        context: EvaluationContext,
      ): EvaluatedSegmentMeasurement => {
        const segment = context.getSegment(node.segment);
        const length = Math.hypot(segment.b.x - segment.a.x, segment.b.y - segment.a.y);

        return {
          kind: "SEGMENT_MEASUREMENT",
          sourceKind: node.kind,
          ...(node.zIndex === undefined ? {} : { zIndex: node.zIndex }),
          id: node.id,
          segment: node.segment,
          a: segment.a,
          b: segment.b,
          length,
          label: formatSegmentLength(length, node.precision),
        };
      },
    }),
  });

export function formatSegmentLength(
  length: number,
  precision: SegmentMeasurementPrecision,
): string {
  switch (precision) {
    case "auto":
      return formatAutoSegmentLength(length);
  }
}

function formatAutoSegmentLength(length: number): string {
  const nearestInteger = Math.round(length);

  if (Math.abs(length - nearestInteger) < 1e-6) {
    return String(nearestInteger);
  }

  const rounded = length.toFixed(2);

  if (/\.00$/.test(rounded)) {
    return rounded;
  }

  return rounded.replace(/0+$/, "").replace(/\.$/, "");
}
