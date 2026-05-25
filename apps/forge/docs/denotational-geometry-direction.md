# Denotational Geometry Direction

Geometry nodes should denote mathematical objects.

```txt
graph syntax → mathematical denotation → numeric evaluation
```

The graph is not a cache of rendered coordinates. It is construction syntax. Evaluation interprets that syntax into numeric geometry for the canvas or for headless inspection.

## Current model

Current construction nodes include:

```txt
FREE_POINT
SEGMENT
LINE
CIRCLE
TRIANGLE
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
CURVE_INTERSECTION
PARALLEL_POINT
```

`SEGMENT_INTERSECTION` is a bounded finite-segment intersection. `CURVE_INTERSECTION` is the general persisted curve-intersection node over curve-valued source nodes and a `branchKey`.

`PARALLEL_POINT` is a constrained visible endpoint. It records a linear reference, an anchor point, and a signed offset. A finite parallel segment is represented compositionally:

```txt
PARALLEL_POINT(reference, anchor, offset)
SEGMENT(anchor, parallelPoint)
```

## Dynamic construction, not general constraint solving

A construction node says how to compute something when defined. It does not force dependencies to remain in a configuration where it is defined. Refusing a drag, clamping motion, or moving other points to preserve arbitrary relationships would be constraint solving.

Constrained endpoints are narrower. Dragging a `PARALLEL_POINT` updates its scalar offset along its declared constraint axis. It does not solve arbitrary constraints between existing geometry.

## Persisted curve intersections

`CURVE_INTERSECTION(curveA, curveB, branchKey)` denotes one selected branch of the intersection of two curve-valued source nodes. Branch keys must be geometrically stable; circle-circle branches should be stable relative to the directed center-to-center axis rather than sorted by world coordinates.

Construction-time duplicate prevention may skip a new curve-intersection node if its evaluated candidate already coincides with an existing evaluated point.

## Display notation is not denotation

Parallel chevrons, label pills, display scale, high-contrast canvas, print theme, and lasso overlay are adapter/rendering concerns. Do not store them in the graph unless explicit user-authored style annotations become a product feature.

## Future direction

Avoid a combinatorial family of intersection graph kinds. Prefer denotational curves with domains and candidate-generating intersection operations. The next likely constrained construction is perpendicular, following the same pattern as `PARALLEL_POINT`.

## Recent project state

Recent decisions that should be treated as current context:

- Lasso selection is app-side interaction. It selects fully contained visible selectable geometry; infinite lines are excluded from lasso containment.
- Labels render with translucent label pills for readability over geometry.
- The canvas has dark and high-contrast display modes plus incremental display scale for line/point/label size.
- Print output uses a print-only offscreen render/image path, not the live canvas, with a white-background print theme.
- Curve intersections suppress duplicate derived points when a candidate already coincides with an existing evaluated point.
- Circle-circle branch keys are stable relative to the directed center-to-center axis, not sorted by world coordinates.
- `PARALLEL_POINT` is a core constrained visible endpoint. A finite parallel segment is represented as `PARALLEL_POINT + SEGMENT`.
- Dragging a constrained endpoint updates its scalar offset through `MOVE_CONSTRAINED_POINT`; this is not a general constraint solver.
- Parallel chevrons are render-derived notation from transitive parallel families; they are not graph state.
