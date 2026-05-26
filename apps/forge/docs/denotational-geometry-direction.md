# Denotational Geometry Direction

Geometry nodes should denote mathematical objects.

```text
graph syntax → mathematical denotation → numeric evaluation
```

The graph is not a cache of rendered coordinates. It is construction syntax. Evaluation interprets that syntax into numeric geometry for the canvas or for headless inspection.

## Current model

Current construction nodes include:

```text
FREE_POINT
SEGMENT
LINE
CIRCLE
TRIANGLE
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
CURVE_INTERSECTION
LINEAR_CONSTRAINED_POINT
```

`SEGMENT_INTERSECTION` is a bounded finite-segment intersection. `CURVE_INTERSECTION` is the general persisted curve-intersection node over curve-valued source nodes and a `branchKey`.

`LINEAR_CONSTRAINED_POINT` is a constrained visible endpoint. It records a linear reference, an anchor point, a mode, and a signed offset.

A finite parallel or perpendicular segment is represented compositionally:

```text
LINEAR_CONSTRAINED_POINT(reference, anchor, mode, offset)
SEGMENT(anchor, constrainedPoint)
```

where:

```text
mode = "PARALLEL" | "PERPENDICULAR"
```

## Dynamic construction, not general constraint solving

A construction node says how to compute something when defined. It does not force dependencies to remain in a configuration where it is defined. Refusing a drag, clamping motion, or moving other points to preserve arbitrary relationships would be constraint solving.

Constrained endpoints are narrower. Dragging a `LINEAR_CONSTRAINED_POINT` updates its scalar offset along its declared constraint axis. It does not solve arbitrary constraints between existing geometry.

## Persisted curve intersections

`CURVE_INTERSECTION(curveA, curveB, branchKey)` denotes one selected branch of the intersection of two curve-valued source nodes. Branch keys must be geometrically stable; circle-circle branches should be stable relative to the directed center-to-center axis rather than sorted by world coordinates.

Construction-time duplicate prevention may skip a new curve-intersection node if its evaluated candidate already coincides with an existing evaluated point.

## Display notation is not denotation

Parallel chevrons, label pills, display scale, high-contrast canvas, print theme, and lasso overlay are adapter/rendering concerns. Do not store them in the graph unless explicit user-authored style annotations become a product feature.

## Future direction

Avoid a combinatorial family of intersection graph kinds. Prefer denotational curves with domains and candidate-generating intersection operations. Future constrained linear relationships should extend the constrained endpoint model only when they remain narrower than general constraint solving.
