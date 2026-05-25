# Feature Workflow

Prefer small vertical changes.

Keep the pipeline intact:

```txt
user input
→ AppController / Command / PointerIntent
→ AppTransition
→ AppRuntime
→ GraphEdit / ViewState / DragState
→ Graph / EvaluatedScene
→ render
```

The geometry registry reduces shotgun surgery, but it does not remove the pipeline. New geometry should still respect the denotational layers.

## Patch discipline

Before patching, name the touched layers.

Good patch sizes:

```txt
representation only
geometry definition only
app command only
DOM/app-edge only
rendering only
interaction only
docs only
```

If a patch touches more than three layers, split it unless there is a strong reason not to.

For source-dump-driven edits, prefer either:

```txt
small, context-anchored patches
```

or:

```txt
full replacement files for high-churn definition/docs files
```

Avoid broad regex edits across files when the same token has different meanings in different contexts.

## Add a new geometry kind

Start with the registry.

1. Add node syntax in `representation/node.ts`.
2. Add evaluated syntax in `evaluation/evaluated.ts`, if needed.
3. Ensure evaluated values carry the correct `sourceKind`.
4. Add a new file in `src/geometry/definitions/`.
5. Implement the relevant definition sections:
   - `representation.dependencies`
   - `evaluation.evaluate`
   - `rendering.layer` and `rendering.render`, if visible
   - `interaction.hitClass` and `interaction.hitTest`, if selectable/hoverable
   - `interaction.bodyDrag`, only if body translation has principled free source points
   - `construction.factories`, if users can create it by command/tool
6. Register the definition in `geometryRegistry.ts`.
7. Add focused unit tests.
8. Add app command or pointer behavior only when user intent exists.
9. Add smoke coverage only for browser-visible behavior.

The goal is that most shape-specific behavior lives in one definition file.

## Geometry definition checklist

A definition may answer:

```txt
What dependencies does this node have?
How does this node evaluate?
What sourceKind does the evaluated value carry?
What render layer does this shape belong to?
How does this evaluated value render?
What hit class does this shape belong to?
How does this evaluated value hit-test?
Can its body be dragged by translating free source points?
What construction factories create this shape?
```

Not every section is required.

Examples:

```txt
FREE_POINT
  dependencies
  evaluation
  rendering
  interaction

CIRCLE
  dependencies
  evaluation
  rendering
  interaction
  bodyDrag
  construction

TRIANGLE
  dependencies
  evaluation
  rendering
  interaction
  bodyDrag
  construction

CENTROID
  dependencies
  evaluation
  rendering
  interaction
  construction
```

## Add body dragging for a shape

Do not add shape-specific drag branches in `pointerIntent.ts` unless there is no better semantic model.

Prefer registry-owned body-drag metadata:

```txt
interaction.bodyDrag.sourcePointIds(node, context)
```

Return source point IDs only when translating those points preserves the represented shape.

Good candidates:

```txt
triangle body
→ translate a, b, c
→ valid only when all three are free points

circle body
→ translate center and through
→ valid only when both are free points
```

Poor candidates without a more explicit inverse-edit design:

```txt
midpoint
centroid
other constrained/derived points
```

Those shapes may be selectable and hoverable without being body-draggable.

When adding body drag support:

1. Add `interaction.bodyDrag` to the geometry definition.
2. Add registry tests for body-drag source resolution.
3. Add hit-test tests if z-index or overlap matters.
4. Add app/pointer tests only if user-visible drag behavior changes.
5. Keep free-point drag priority above body drag.

## Add a construction

Prefer construction factories on geometry definitions when the construction primarily creates one kind.

Good candidates:

```txt
circle from center + through point
triangle from three vertices
centroid from triangle
```

Keep compound construction in `representation/constructions.ts` when it creates or coordinates multiple kinds.

Current example:

```txt
triangle side midpoints
→ creates/reuses segments
→ creates midpoint nodes
```

Command code should usually call stable wrappers from `representation/constructions.ts`, not reach directly into registry details.

## Add a command

A command should usually include:

```txt
command id
keyboard keys
disabledReason
run implementation
unit tests
```

Use selection predicates for command eligibility rather than embedding selection scans directly into the command table.

Examples:

```txt
selectedCirclePoints
selectedFreePointVertices
selectedTriangle
```

Command results should make history policy explicit:

```txt
commit   durable graph/view changes
ignore   transient navigation or blocked command status
```

## Add z-order behavior

The project uses two broad priority systems:

```txt
render layer: AREA → LINEAR → POINT
hit class:    POINT → LINEAR → AREA
```

`zIndex` only decides conflicts within a render layer or hit class. Do not let a high-z area block point dragging or point selection.

When adding user-facing z-order commands, preserve that distinction:

```txt
selected points reorder relative to points
selected areas reorder relative to areas
broad point/linear/area priority remains intact
```

Suggested future command shapes:

```txt
bring selected forward
send selected backward
bring selected to front
send selected to back
```

Prefer computing concrete node z-index updates in app/command code and applying them through a graph edit.

## Add pointer behavior

Pointer behavior should usually flow through `pointerIntent.ts`.

Keep this order unless there is a deliberate UX reason to change it:

```txt
shift pointer down
  → generic selection target

ordinary pointer down
  → free point drag
  → draggable area body
  → add free point
```

Hover should follow pointer intent where possible, so hover previews the same object that ordinary pointer down would act on.

## Add rendering behavior

Rendering should stay value-driven.

1. Add or update evaluated geometry shape.
2. Add a renderer function if canvas drawing is shape-specific.
3. Add rendering metadata to the geometry definition.
4. Let `renderScene` dispatch through the registry.
5. Add tests around ordering or options when behavior is non-trivial.

Do not make rendering mutate graph or view state.

## Add hit testing behavior

Hit testing should stay pure.

1. Add shape-specific hit math in `geometry/hitGeometry.ts` when reusable.
2. Wire it through `interaction.hitTest` in the shape definition.
3. Assign the correct `interaction.hitClass`.
4. Add interaction tests for overlap and z-index if applicable.

Hit testing identifies targets. It should not decide graph edits.

## Add workspace fields

Workspace state should remain durable and intentional.

Good workspace fields:

```txt
graph nodes
hidden node IDs
selected node IDs
viewport state
```

Do not serialize:

```txt
hovered node
drag state
pointer capture
history
status messages
animation state
```

If a graph node field becomes durable, it is naturally serialized through `nodes`. Make sure parse/validation behavior still makes sense.

## Testing checklist

For each patch, consider the smallest useful set:

```txt
type-level coverage via tsc
unit tests for pure functions
app-controller tests for transitions
pointer-intent tests for gesture meaning
render/hit tests for ordering
smoke tests for browser-visible flows
```

Run:

```bash
npm run check
```

before handoff.

## Commit-message style

Use a concise imperative subject and explain the architectural reason in the body.

Example:

```txt
Add registry-driven body dragging

Allow geometry definitions to expose the free source points that can be
translated for body dragging. Rewire area body dragging through the geometry
registry instead of hardcoding triangle-specific behavior in pointer intent.
```
