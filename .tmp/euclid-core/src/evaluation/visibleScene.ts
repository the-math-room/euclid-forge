import type { EvaluatedScene } from "./evaluateGraph";
import type { EvaluatedGeometry } from "./evaluated";
import type { NodeId } from "../representation/node";

export type EvaluatedSceneVisibility = Readonly<{
  hiddenNodeIds?: ReadonlySet<NodeId>;
}>;

export function visibleEvaluatedScene(
  scene: EvaluatedScene,
  visibility: EvaluatedSceneVisibility = {},
): EvaluatedScene {
  const { hiddenNodeIds } = visibility;

  if (!hiddenNodeIds || hiddenNodeIds.size === 0) {
    return scene;
  }

  const values = new Map<NodeId, EvaluatedGeometry>();
  const ordered: EvaluatedGeometry[] = [];

  for (const value of scene.ordered) {
    if (hiddenNodeIds.has(value.id)) {
      continue;
    }

    values.set(value.id, value);
    ordered.push(value);
  }

  return Object.freeze({
    values,
    ordered: Object.freeze(ordered),
    issues: scene.issues,
  });
}
