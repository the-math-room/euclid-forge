# Denotational Geometry Direction

This note records the intended direction for Euclid Forge's curve and intersection architecture.

## Core principle

Geometry nodes should denote mathematical objects.

```txt
graph syntax → mathematical denotation → numeric evaluation
```

The graph is not a cache of rendered coordinates. It is construction syntax. Evaluation is an interpretation of that syntax into numeric geometry for the canvas.

## Current model

Euclid Forge currently supports concrete construction nodes such as:

```txt
FREE_POINT
SEGMENT
CIRCLE
TRIANGLE
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
```

`SEGMENT_INTERSECTION` is currently a bounded finite-segment intersection. It is defined only when two selected segment nodes have a unique intersection point on both finite segments.

If the source segments become parallel, coincident, or no longer cross within their finite extents, the intersection point becomes undefined. It is omitted from the evaluated scene and an evaluation issue is recorded. The graph still remembers the construction, so the point can reappear if the source segments become valid again.

## Dynamic construction, not constraint solving

A construction node says how to compute something when defined. It does not force its dependencies to remain in a configuration where it is defined.

For example:

```txt
X = intersection(AB, CD)
Y = segment(X, E)
```

If `AB` and `CD` stop intersecting as finite segments:

```txt
X is undefined
Y is undefined because X is unavailable
the graph still contains X and Y
both can reappear if AB and CD intersect again
```

Refusing a drag, clamping motion, or moving other points to preserve the intersection would be constraint solving. That may be a future mode, but it is not the current evaluator.

## Future curve/intersection direction

Avoid designing future curve intersections as a combinatorial family of graph concepts:

```txt
SEGMENT_CIRCLE_INTERSECTION
CIRCLE_CIRCLE_INTERSECTION
CIRCLE_PARABOLA_INTERSECTION
PARABOLA_PARABOLA_INTERSECTION
```

The intended direction is a denotational curve abstraction:

```txt
curve denotation
  → point set
  → optional implicit equation
  → optional parameterization
  → domain restriction

intersection
  → operation over two curve denotations
  → classified numeric candidates
```

This makes the top-level concept:

```txt
intersection(curveA, curveB)
```

not:

```txt
one graph kind per pair of source shapes
```

## Result classification

Intersection evaluation should use a shared result contract.

```txt
candidate point
multiplicity: SIMPLE | TANGENT
branch identity
issue for undefined or degenerate cases
```

This supports cases such as:

```txt
0 candidates
1 SIMPLE candidate
1 TANGENT candidate
2 SIMPLE candidates
```

Tangency and branch choice are semantic issues, not just implementation details. They should be explicit in the result model.

## Tangent snapping

Tangent snapping is primarily an interaction/construction-time policy.

A future UX policy may say:

```txt
near tangent within hit radius → snap to one tangent candidate
```

But that should not make runtime graph evaluation depend on viewport state.

Keep the distinction:

```txt
construction-time policy:
  may use viewport/hit-radius tolerance and pointer context

evaluation-time policy:
  deterministic from graph state and numeric geometry
```

## Implementation stance

Specialized algorithms may still exist internally. The important constraint is where they show up.

Good:

```txt
meaning-level solver specializes by algebraic capability:
  linear-linear
  linear-quadratic
  quadratic-quadratic
  numeric fallback

representation/app:
  curve intersection over denotations
```

Avoid:

```txt
representation/app:
  one user-visible graph concept per shape pair
```

This keeps the project aligned with a denotational architecture while still allowing pragmatic numeric implementation.
