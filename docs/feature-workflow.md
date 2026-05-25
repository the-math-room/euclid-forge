# Feature Workflow

This document describes how to add features without weakening Euclid Forge's architecture.

## Default workflow

1. Make the smallest coherent patch.
2. Keep `npm run check` green between patches.
3. Prefer behavior tests before or with implementation.
4. Put shape-specific behavior in `src/geometry/definitions/*` when possible.
5. Avoid new abstractions unless a real feature creates pressure.
6. Update docs when the mental model changes.

Validation command:

```bash
npm run check
```

## Adding a new geometry kind

A new geometry kind usually touches these areas:

```txt
representation/node.ts
evaluation/evaluated.ts
geometry/definitions/<kind>.ts
geometry/geometryRegistry.ts
rendering renderer/theme, if visual
interaction hit geometry, if selectable
construction wrappers/commands, if constructible
tests
docs
```

The core unions are closed for now. Add the new kind deliberately to the relevant unions rather than trying to make an open plugin system.

## Geometry definition checklist

Each shape definition should answer:

```txt
What node kind is this?
What graph dependencies does it have?
Does it denote a mathematical object or a UI convenience?
What evaluated geometry does it produce when defined?
Can it become undefined for some valid graph configurations?
What evaluation issue should be recorded when undefined?
Does it render and hit-test?
Is it constructible?
Can it body-drag through free source points?
```

## Constructible inputs

Use constructible-point predicates for construction inputs. Do not use free-point predicates unless the operation specifically requires editability.

```txt
constructible point ≠ directly draggable point
```

Current constructible point-valued nodes include:

```txt
FREE_POINT
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
```

Dragging should still require free points or registry-declared free source points.

## Dynamic undefined constructions

A construction node may be valid graph syntax but undefined in the current numeric configuration.

Examples:

```txt
parallel segment intersection
coincident segment intersection
bounded segment intersection outside the finite segment extents
dependent construction whose input point is currently unavailable
```

Undefined evaluated geometry should be omitted from the scene and recorded as an evaluation issue. Dependents should also be omitted when their evaluated dependencies are unavailable.

Do not turn ordinary derived constructions into constraints. Refusing, clamping, or projecting drags belongs to a future constraint-solver design, not to the current dynamic-construction evaluator.

## Intersections and future curve work

Prefer denotational abstractions over shape-pair graph explosions.

The guiding model is:

```txt
geometry node → mathematical denotation
curve denotation → point set / implicit equation / parameterized carrier / domain
intersection → operation over denotations
evaluation → numeric interpretation that returns classified candidates or issues
```

Avoid introducing graph concepts like these unless there is a specific user-facing meaning that requires them:

```txt
SEGMENT_CIRCLE_INTERSECTION
CIRCLE_CIRCLE_INTERSECTION
CIRCLE_PARABOLA_INTERSECTION
PARABOLA_PARABOLA_INTERSECTION
```

Instead, aim toward shared curve-intersection machinery with a common result contract:

```txt
candidates: intersection points with branch identity
multiplicity: SIMPLE or TANGENT
issue: undefined / degenerate reason
```

Specialized algorithms can exist internally, but they should be hidden behind denotational/capability-level APIs when possible.

When tangent snapping is added, keep the distinction clear:

```txt
construction-time interaction policy may use viewport/hit-radius tolerance
evaluation-time numeric policy should remain deterministic from graph state
```

## Adding a command

Commands should stay table-like:

```txt
id
keys
disabledReason
run
```

Use selection predicate helpers instead of growing local command-specific query logic.

Durable graph/view changes should return `history: "commit"`. Pure viewport navigation and hover-like changes usually ignore history.

### Boundary construction command

`J` joins selected constructible points:

```txt
2 selected constructible points → segment
3 selected constructible points → triangle
```

Circle construction remains on `C`:

```txt
2 selected constructible points → circle from center and through point
```

### Intersection command

`I` creates a bounded segment intersection:

```txt
2 selected segment nodes → SEGMENT_INTERSECTION point
```

Triangle borders are not segment nodes unless explicit segments were created. The selected-segment visual affordance should remain strong enough that users can tell whether both segments are selected.

## Adding pointer behavior

Pointer behavior should remain simple and policy-driven.

Current order:

```txt
shift-click → selection
free point hit → direct point drag
draggable area body hit → body drag
empty canvas → add point
```

Free-point dragging should continue to beat area-body dragging.

## Adding z-order behavior

Z-order is represented as node `zIndex`.

```txt
PageUp              bring selected forward
PageDown            send selected backward
Shift+PageUp        bring selected to front
Shift+PageDown      send selected to back
```

`zIndex` only resolves conflicts within the same render layer or hit class. It must not collapse the distinct render and hit priority models.

## Documentation checklist

Update docs when any of these change:

```txt
layer responsibilities
registry responsibilities
pointer intent order
render/hit ordering
keyboard shortcuts
workspace format expectations
feature workflow for new shapes
intersection semantics
undefined-construction behavior
denotational curve/intersection direction
```

Docs should explain why the architecture works, not merely list files.
