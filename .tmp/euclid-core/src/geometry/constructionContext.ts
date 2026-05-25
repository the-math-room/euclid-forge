import type { Graph } from "../representation/graph";
import type { GeometryNode, NodeId } from "../representation/node";

export type ConstructionContext = Readonly<{
  graph: Graph;
}>;

export type ConstructionFactory = (
  context: ConstructionContext,
  ...args: readonly NodeId[]
) => readonly GeometryNode[];

export type GeometryConstructionFactories = Readonly<
  Record<string, ConstructionFactory>
>;
