# Feature Workflow

This document describes how to add features without weakening Euclid Forge's
architecture.

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

The core unions are closed for now. Add the new kind deliberately to the relevant
unions rather than trying to make an open plugin system.

## Geometry definition checklist

Each shape definition should answer the applicable questions.

### Representation

```txt
What node kind is this?
What graph dependencies does it have?
Does it denote a mathematical object or a UI convenience?
```

### Evaluation

```txt
What evaluated geometry does it produce when defined?
Can it become undefined for some valid graph configurations?
What evaluation issue should be recorded when undefined?
What sourceKind should the evaluated value carry?
```

### Rendering

```txt
Does it render?
Which render layer?
How does it draw?
How is selected/hovered state made visible?
```

Render layers are:

```txt
AREA → LINEAR → POINT
```

### Interaction

```txt
Is it hittable/selectable?
Which hit class?
What geometric hit test applies?
```

Hit class priority is:

```txt
POINT → LINEAR → AREA
```

### Body drag

Only add body-drag metadata when translation of declared free source points
preserves the represented shape.

```txt
interaction.bodyDrag.sourcePointIds(node, context)
```

Good examples:

```txt
triangle → its three free vertices
circle   → its free center and through points
```

Bad examples without more design:

```txt
midpoint → dragging would require inverse segment/source edits
centroid → dragging would require ambiguous inverse triangle edits
intersection point → dragging would require constraint solving
```

Do not use a plain `draggable: true` flag. The app needs the source point IDs,
not just a capability bit.

## Constructible inputs

Use constructible-point predicates for point construction inputs. Do not use
free-point predicates unless the operation specifically requires editability.

```txt
constructible point ≠ directly draggable point
```

Current constructible point-valued nodes include:

```txt
FREE_POINT
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
CURVE_INTERSECTION
```

Use constructible-curve predicates for intersection-style curve inputs.

Current constructible curve-valued nodes include:

```txt
SEGMENT
CIRCLE
```

Dragging should still require free points or registry-declared free source
points.

## Dynamic undefined constructions

A construction node may be valid graph syntax but undefined in the current
numeric configuration.

Examples:

```txt
parallel segment intersection
coincident segment intersection
bounded segment intersection outside the finite segment extents
curve intersection branch whose sources no longer have that branch
dependent construction whose input point is currently unavailable
```

Undefined evaluated geometry should be omitted from the scene and recorded as an
evaluation issue. Dependents should also be omitted when their evaluated
dependencies are unavailable.

Do not turn ordinary derived constructions into constraints. Refusing, clamping,
or projecting drags belongs to a future constraint-solver design, not to the
current dynamic-construction evaluator.

## Intersections and future curve work

Prefer denotational abstractions over shape-pair graph explosions.

The guiding model is:

```txt
geometry node → mathematical denotation
curve denotation → point set / implicit equation / parameterized carrier / domain
intersection → operation over denotations
evaluation → numeric interpretation that returns classified candidates or issues
```

Do not introduce graph concepts like these unless there is a specific
user-facing meaning that requires them:

```txt
SEGMENT_CIRCLE_INTERSECTION
CIRCLE_CIRCLE_INTERSECTION
CIRCLE_PARABOLA_INTERSECTION
PARABOLA_PARABOLA_INTERSECTION
```

Prefer the existing `CURVE_INTERSECTION` representation:

```txt
curveA
curveB
branchKey
label
```

Specialized algorithms can exist internally, but they should be hidden behind
denotational/capability-level APIs when possible.

When tangent snapping is added, keep the distinction clear:

```txt
construction-time interaction policy may use viewport/hit-radius tolerance
evaluation-time numeric policy should remain deterministic from graph state
```

## When adding new curve kinds

New curve-valued geometry should first provide a curve denotation path, then join
the shared intersection machinery.

Preferred order:

```txt
1. Add meaning-level denotation / solver support.
2. Add evaluated-geometry-to-curve-denotation support.
3. Add tests for classified candidates.
4. Let CURVE_INTERSECTION consume the new candidate branches.
5. Only then add command/UI affordances if needed.
```

Do not add a new graph node kind for each pair of curves. Prefer the existing
`CURVE_INTERSECTION` representation unless the feature has a distinct
user-facing meaning.

## Adding a command

Commands should stay table-like:

```txt
id
keys
disabledReason
run
```

Use selection predicate helpers instead of growing local command-specific query
logic.

Durable graph/view changes should return `history: "commit"`. Pure viewport
navigation and hover-like changes usually ignore history.

Commands may return `statusMessage` for recognized no-op states that should be
explained to the user.

### Boundary construction command

`J` joins selected constructible points:

```txt
2 selected constructible points → segment
3 selected constructible points → triangle
```

This is intentionally limited to two and three points for now. Four or more
points require an ordering story before polygon construction should be added.

Circle construction remains on `C`:

```txt
2 selected constructible points → circle from center and through point
```

Even though circle also consumes two selected points, it should keep a semantic
wrapper separate from segment endpoints.

### Intersection command

`I` creates intersections from selected constructible curves:

```txt
2 selected segment nodes          → SEGMENT_INTERSECTION
segment + circle or circle+circle → CURVE_INTERSECTION branch nodes
```

Triangle borders are not segment nodes unless explicit segments were created.
The selected-segment visual affordance should remain strong enough that users
can tell whether both segments are selected.

## Adding pointer behavior

Pointer behavior should remain simple and policy-driven.

Current order:

```txt
shift-click → selection
free point hit → direct point drag
draggable area body hit → body drag
empty canvas → add point
```

Free-point dragging should continue to beat area-body dragging. Otherwise large
areas become frustrating to work over.

If a new shape should drag as a body, prefer registry body-drag metadata over
hardcoding the shape in pointer intent.

## Adding z-order behavior

Z-order is represented as node `zIndex`.

User-facing commands:

```txt
PageUp              bring selected forward
PageDown            send selected backward
Shift+PageUp        bring selected to front
Shift+PageDown      send selected to back
```

`zIndex` only resolves conflicts within the same render layer or hit class. It
must not collapse the distinct render and hit priority models.

When changing z-order behavior, test both:

```txt
render/hit winner among same-class overlaps
point priority over high-z areas
```

## Adding workspace-visible metadata

If metadata lives on graph nodes, workspace serialization will usually preserve
it naturally because nodes are serialized as graph nodes.

Still test compatibility when changing required fields. Prefer optional metadata
or parser defaults unless a migration is intentionally being introduced.

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
