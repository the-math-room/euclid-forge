import type { GeometryNode } from "./node";

export type PointLabelGraph = Readonly<{
  nodes: readonly GeometryNode[];
}>;

export function nextPointLabel(graph: PointLabelGraph): string {
  return nextAlphabeticLabel(usedPointLabels(graph));
}

export function nextPointLabels(
  graph: PointLabelGraph,
  count: number,
): readonly string[] {
  const used = usedPointLabels(graph);
  const labels: string[] = [];

  while (labels.length < count) {
    const label = nextAlphabeticLabel(used);
    used.add(label);
    labels.push(label);
  }

  return Object.freeze(labels);
}

export function nextAlphabeticLabel(used: ReadonlySet<string>): string {
  for (let index = 0; ; index += 1) {
    const label = alphabeticLabelForIndex(index);

    if (!used.has(label)) {
      return label;
    }
  }
}

export function alphabeticLabelForIndex(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Label index must be a non-negative integer: ${index}`);
  }

  let value = index;
  let label = "";

  do {
    const remainder = value % 26;
    label = String.fromCharCode("A".charCodeAt(0) + remainder) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

function usedPointLabels(graph: PointLabelGraph): Set<string> {
  const used = new Set<string>();

  for (const node of graph.nodes) {
    const label = pointLabelForNode(node);

    if (label) {
      used.add(label);
    }
  }

  return used;
}

function pointLabelForNode(node: GeometryNode): string | null {
  switch (node.kind) {
    case "FREE_POINT":
    case "MIDPOINT":
    case "CENTROID":
    case "SEGMENT_INTERSECTION":
    case "CURVE_INTERSECTION":
    case "LINEAR_CONSTRAINED_POINT":
      return node.label;

    case "SEGMENT":
    case "LINE":
    case "CIRCLE":
    case "TRIANGLE":
      return null;
  }
}
