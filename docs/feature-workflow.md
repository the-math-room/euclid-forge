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
```

### Evaluation

```txt
What evaluated geometry does it produce?
What sourceKind should the evaluated value carry?
```

### Rendering

```txt
Does it render?
Which render layer?
How does it draw?
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
```

Do not use a plain `draggable: true` flag. The app needs the source point IDs,
not just a capability bit.

### Construction

Use definition-local construction factories for single-shape construction.

Keep compound constructions outside a single shape definition when they create or
reuse multiple kinds of nodes.

Examples:

```txt
segment from two free points → segment definition factory
circle from two free points → circle definition factory
triangle from three free points → triangle definition factory
side midpoints of triangle → compound construction wrapper
```

Do not assume every same-arity construction belongs to the same command family.
Segment and triangle are boundary constructions; circle is a center-through
metric construction.

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

### Boundary construction command

`J` joins selected free points:

```txt
2 selected free points → segment
3 selected free points → triangle
```

This is intentionally limited to two and three points for now. Four or more
points require an ordering story before polygon construction should be added.

Circle construction remains on `C`:

```txt
2 selected free points → circle from center and through point
```

Even though circle also consumes two selected free points, it should keep a
semantic wrapper separate from segment endpoints.

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
```

Docs should explain why the architecture works, not merely list files.
