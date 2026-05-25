# Denotational Geometry Direction

This note records the intended direction for Euclid Forge's curve and intersection architecture.

## Core principle

Geometry nodes should denote mathematical objects.

```txt
graph syntax → mathematical denotation → numeric evaluation
```

The graph is not a cache of rendered coordinates. It is construction syntax. Evaluation is an interpretation of that syntax into numeric geometry for the canvas or for headless inspection.

## Headless core

Euclid Forge uses the package facade:

```txt
@euclid-forge/core
```

The headless core owns workspace parsing, evaluation access, diagnostics, dependency inspection, immutable graph edits, construction helpers, cascading deletes, free-point planning, serialization, and golden fixtures.

A typical consumer path:

```ts
const workspace = geometryWorkspaceFromJsonText(jsonText);
const engine = createGeometryEngine(workspace);

const evaluated = engine.evaluate();
const diagnostics = engine.diagnostics();

const next = engine.applyEdit({
  kind: "MOVE_FREE_POINT",
  id: "P1",
  point: { x: 1, y: 2 },
});
```

## Current model

Euclid Forge currently supports concrete construction nodes such as:

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
```

`SEGMENT_INTERSECTION` is currently a bounded finite-segment intersection. It is defined only when two selected segment nodes have a unique intersection point on both finite segments.

`CURVE_INTERSECTION` is the general persisted curve-intersection node. It records two curve-valued source nodes and one `branchKey`.

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

Refusing a drag, clamping motion, or moving other points to preserve an intersection would be constraint solving. That may be a future mode, but it is not the current evaluator.

## Diagnostics

Undefined or unavailable geometry is reported through structured diagnostics.

Current shape:

```ts
{
  nodeId: string;
  severity: "warning";
  code:
    | "MISSING_DEPENDENCY"
    | "NO_REAL_INTERSECTION"
    | "NO_UNIQUE_INTERSECTION"
    | "STALE_INTERSECTION_BRANCH"
    | "UNDEFINED_GEOMETRY";
  message: string;
}
```

The code is the stable machine-facing part. The message is the human-facing explanation and may evolve.

## Persisted curve intersections

Euclid Forge has a general persisted `CURVE_INTERSECTION` node:

```txt
CURVE_INTERSECTION(curveA, curveB, branchKey)
```

The node denotes one selected branch of the intersection of two curve-valued source nodes. Evaluation computes the current curve candidates and selects the candidate matching `branchKey`.

This keeps the representation denotational:

```txt
source nodes denote curves
intersection computes candidate points
branchKey selects one candidate
the resulting node denotes a point
```

The representation does not introduce one graph kind per shape pair. Segment + circle and circle + circle intersections share the same graph node kind. The legacy `SEGMENT_INTERSECTION` node remains for bounded segment intersections until that path is migrated or intentionally preserved.

Generated IDs are descriptive and branch-stable. Display labels should remain human-scale:

```txt
id:    X_C2_C1_circle_circle_1
label: X2
```

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

## Modal tools and denotation

Modal tools should not change the denotational model. They are only a more direct way to create the same graph syntax.

For example:

```txt
Segment mode click A, click B
```

and:

```txt
Shift-select A and B, press J
```

should produce equivalent graph semantics.

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

## Near-term feature pressure

The next strong geometry primitive is still likely deeper `LINE` work, because it stresses the right abstractions:

```txt
segment: bounded linear curve
line: unbounded linear curve
ray: half-bounded linear curve
```

That will test whether curve domains, hit testing, rendering, modal tools, and intersection candidate generation are sufficiently denotational.

