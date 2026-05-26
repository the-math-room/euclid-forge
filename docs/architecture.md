# Euclid Forge Architecture Notes

Euclid Forge is organized around a deliberate separation between mathematical meaning and app behavior.

Core owns the authored graph, dependencies, denotational evaluation, construction factories, and save/load-worthy state. Forge owns pointer interaction, hit testing, rendering, UI controls, and browser integration.

## Graph state versus geometry

A graph node is any persistent authored object in the construction graph. Not every graph node is geometry.

```ts
GraphNode = GeometryNode | AnnotationNode
```

`GeometryNode` contains mathematical construction objects such as free points, segments, lines, circles, triangles, derived points, and constrained points.

`AnnotationNode` contains persistent notational objects. Currently:

```ts
AnnotationNode = SegmentMeasurementNode
```

This distinction exists because measurements save/load, depend on geometry, render, and cascade-delete, but they are not geometric objects for curve denotation, construction input, lasso selection, or body dragging.

## Evaluated scene hierarchy

Evaluation mirrors graph state:

```ts
EvaluatedSceneItem = EvaluatedGeometry | EvaluatedAnnotation
EvaluatedAnnotation = EvaluatedSegmentMeasurement
```

Geometry-only code should consume `EvaluatedGeometry`, not broad scene items. Use helpers such as `evaluatedGeometryItems(scene)` when iterating over scene output for lasso, hit testing, or geometry-only operations.

## Rendering layers

The render pipeline now treats scene output as scene items, with annotations as a distinct layer:

```text
AREA
LINEAR
ANNOTATION
POINT
```

This lets measurement labels render as overlay notation without being mistaken for points or curves.

## Interaction boundaries

Hit testing and lasso are geometry-first. They should explicitly choose whether to include annotations.

Current policy:

- Point/segment/line/circle/triangle hit testing uses evaluated geometry only.
- Segment measurements render as annotations.
- Point labels have their own interaction path for label dragging.
- Future annotation selection should add an annotation hit-test path rather than broadening geometry hit testing accidentally.

## Registry naming scar

Some registry names still say `GeometryDefinition`, `GeometryKind`, `evaluateGeometryNode`, and `dependenciesForGeometryNode`, even though the registry now covers broad graph nodes including annotations. This is a known naming scar. A future cleanup can rename these to `GraphNodeDefinition`, `GraphNodeKind`, `evaluateGraphNode`, and `dependenciesForGraphNode`.
