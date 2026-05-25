# Denotational Geometry Direction

This note records the intended direction for Euclid Forge's curve and
intersection architecture.

## Core principle

Geometry nodes should denote mathematical objects.

```txt
graph syntax → mathematical denotation → numeric evaluation
```

The graph is not a cache of rendered coordinates. It is construction syntax.
Evaluation is an interpretation of that syntax into numeric geometry for the
canvas.

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
CURVE_INTERSECTION
```

`SEGMENT_INTERSECTION` is currently a bounded finite-segment intersection. It is
defined only when two selected segment nodes have a unique intersection point on
both finite segments.

`CURVE_INTERSECTION` is the general persisted curve-intersection node. It
records two curve-valued source nodes and one `branchKey`.

## Dynamic construction, not constraint solving

A construction node says how to compute something when defined. It does not force
its dependencies to remain in a configuration where it is defined.

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

For curve intersections:

```txt
X1 = intersection(C1, C2, "circle-circle:0")
X2 = intersection(C1, C2, "circle-circle:1")
```

If `C1` and `C2` stop intersecting, both nodes become temporarily undefined. If
the circles intersect again and the same branches are available, the points can
reappear.

Refusing a drag, clamping motion, or moving other points to preserve an
intersection would be constraint solving. That may be a future mode, but it is
not the current evaluator.

## Persisted curve intersections

Euclid Forge has a general persisted `CURVE_INTERSECTION` node:

```txt
CURVE_INTERSECTION(curveA, curveB, branchKey)
```

The node denotes one selected branch of the intersection of two curve-valued
source nodes. Evaluation computes the current curve candidates and selects the
candidate matching `branchKey`.

This keeps the representation denotational:

```txt
source nodes denote curves
intersection computes candidate points
branchKey selects one candidate
the resulting node denotes a point
```

The representation does not introduce one graph kind per shape pair. Segment +
circle and circle + circle intersections share the same graph node kind. The
legacy `SEGMENT_INTERSECTION` node remains for bounded segment intersections
until that path is migrated or intentionally preserved.

Generated IDs are descriptive and branch-stable. Display labels should remain
human-scale:

```txt
id:    X_C2_C1_circle_circle_1
label: X2
```

## Future curve/intersection direction

Avoid designing future curve intersections as a combinatorial family of graph
concepts:

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

Intersection evaluation uses a shared result contract.

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

Tangency and branch choice are semantic issues, not just implementation details.
They should be explicit in the result model.

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

Specialized algorithms may still exist internally. The important constraint is
where they show up.

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

This keeps the project aligned with a denotational architecture while still
allowing pragmatic numeric implementation.
