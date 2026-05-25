# Feature Workflow

This document describes how to add features without weakening Euclid Forge's architecture.

## Default workflow

1. Make the smallest coherent patch.
2. Keep `npm run check` green between patches.
3. Prefer behavior tests before or with implementation.
4. Put shape-specific behavior in `src/geometry/definitions/*` when possible.
5. Route consumer-facing headless behavior through `src/core/index.ts`.
6. Avoid new abstractions unless a real feature creates pressure.
7. Update docs when the mental model changes.

Validation command:

```bash
npm run check
```

## Headless core workflow

New engine-facing behavior should be available through the headless core surface when it is useful outside the browser editor.

Preferred consumer import:

```ts
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
  diagnosticsWithCode,
} from "../core";
```

A feature is a good candidate for core exposure if it involves:

```txt
workspace parsing or serialization
graph construction or graph edits
evaluation
diagnostics
dependency inspection
golden fixtures
```

The browser app should own:

```txt
keyboard shortcuts
pointer gestures
DOM events
file picker/download plumbing
status messages
history grouping
render scheduling
CSS
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
core fixture, if workspace-relevant
docs
```

## Geometry definition checklist

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
What diagnostic code should be recorded when undefined?
What sourceKind should the evaluated value carry?
```

### Rendering

```txt
Does it render?
Which render layer?
How does it draw?
How is selected/hovered state made visible?
```

### Interaction

```txt
Is it hittable/selectable?
Which hit class?
What geometric hit test applies?
```

### Body drag

Only add body-drag metadata when translation of declared free source points preserves the represented shape.

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

## Constructible inputs

Use constructible-point predicates for point construction inputs. Do not use free-point predicates unless the operation specifically requires editability.

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

Current constructible curve-valued nodes include:

```txt
SEGMENT
CIRCLE
```

## Dynamic undefined constructions

A construction node may be valid graph syntax but undefined in the current numeric configuration.

Examples:

```txt
parallel segment intersection
coincident segment intersection
bounded segment intersection outside the finite segment extents
curve intersection branch whose sources no longer have that branch
dependent construction whose input point is currently unavailable
```

Undefined evaluated geometry should be omitted from the scene and recorded as a diagnostic. Dependents should also be omitted when their evaluated dependencies are unavailable.

Do not turn ordinary derived constructions into constraints. Refusing, clamping, or projecting drags belongs to a future constraint-solver design.

## Diagnostics

Diagnostics are a headless-core surface, not just UI strings.

They currently have this shape:

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

Prefer tests that assert stable `code` values rather than parsing human-readable messages.

Use core diagnostic helpers such as:

```ts
diagnosticsWithCode(engine.diagnostics(), "NO_REAL_INTERSECTION")
```

## Intersections and future curve work

Prefer denotational abstractions over shape-pair graph explosions.

The guiding model is:

```txt
geometry node → mathematical denotation
curve denotation → point set / implicit equation / parameterized carrier / domain
intersection → operation over denotations
evaluation → numeric interpretation that returns classified candidates or diagnostics
```

Avoid graph concepts such as:

```txt
SEGMENT_CIRCLE_INTERSECTION
CIRCLE_CIRCLE_INTERSECTION
CIRCLE_PARABOLA_INTERSECTION
PARABOLA_PARABOLA_INTERSECTION
```

Prefer the existing `CURVE_INTERSECTION` representation unless the feature has a distinct user-facing meaning.

## When adding new curve kinds

Preferred order:

```txt
1. Add meaning-level denotation / solver support.
2. Add evaluated-geometry-to-curve-denotation support.
3. Add tests for classified candidates.
4. Let CURVE_INTERSECTION consume the new candidate branches.
5. Add a core fixture if the behavior is workspace-relevant.
6. Only then add command/UI affordances if needed.
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

Commands may return `statusMessage` for recognized no-op states that should be explained to the user.

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

`I` creates intersections from selected constructible curves:

```txt
2 selected segment nodes          → SEGMENT_INTERSECTION
segment + circle or circle+circle → CURVE_INTERSECTION branch nodes
```

## Workspace fixtures

Workspace fixtures should live under:

```txt
src/core/fixtures/
```

Use the core fixture runner for both happy-path and partially undefined construction workspaces.

## Documentation checklist

Update docs when any of these change:

```txt
layer responsibilities
headless core public surface
registry responsibilities
pointer intent order
render/hit ordering
keyboard shortcuts
workspace format expectations
feature workflow for new shapes
intersection semantics
undefined-construction behavior
diagnostic codes
denotational curve/intersection direction
```
