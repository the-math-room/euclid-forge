# Feature Workflow

Prefer small vertical changes.

Keep the pipeline intact:

```txt
user input
→ AppController / Command
→ AppTransition
→ AppRuntime
→ GraphEdit/ViewState
→ Graph/EvaluatedScene
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

## Add a new geometry kind

Start with the registry.

1. Add node syntax in `representation/node.ts`.
2. Add evaluated syntax in `evaluation/evaluated.ts`, if needed.
3. Add a new file in `src/geometry/definitions/`.
4. Implement the relevant definition sections:
   - `representation.dependencies`
   - `evaluation.evaluate`
   - `rendering.render`, if visible
   - `interaction.hitClass` and `interaction.hitTest`, if selectable/hoverable
   - `construction.factories`, if users can create it by command/tool
5. Register the definition in `geometryRegistry.ts`.
6. Add focused unit tests.
7. Add app command or pointer behavior only when user intent exists.
8. Add smoke coverage only for browser-visible behavior.

The goal is that most shape-specific behavior lives in one definition file.

## Geometry definition checklist

A definition may answer:

```txt
What dependencies does this node have?
How does this node evaluate?
How does this evaluated value render?
What hit class does this shape belong to?
How does this evaluated value hit-test?
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
  construction

CENTROID
  dependencies
  evaluation
  rendering
  interaction
  construction
```

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

## Add a keyboard command

1. Add or update a command in `app/commands.ts`.
2. Give it a stable `id`.
3. Define shortcut keys.
4. Define `disabledReason(state)`.
5. Return `history: "commit"` only for durable editor changes.
6. Add command tests.
7. Let `appController.ts` handle command eligibility and status feedback.

Use disabled reasons intentionally:

```txt
null      enabled
""        disabled silently
message   disabled with user-facing feedback
```

## Add a pointer interaction

1. Decide the user intent.
2. Keep geometry-specific hit testing in geometry definitions.
3. Keep hit selection helpers in `interaction/hitTest.ts`.
4. Put pointer policy in `app/pointerIntent.ts`.
5. Add or update transition behavior in `appController.ts`.
6. Emit `AppEffect[]` for app-edge effects.
7. Keep graph mutations in `representation/edit.ts`.
8. Add controller and pointer-intent tests.

Pointer gestures do not need to be forced into the keyboard command abstraction.

## Add hit testing for a shape

Add the interaction section to the shape definition:

```txt
interaction.hitClass
interaction.hitTest
```

Current hit classes:

```txt
POINT
LINEAR
AREA
```

Selection priority is:

```txt
POINT > LINEAR > AREA
```

Within a class, closest-distance hits win when distance is available; exact ties preserve reverse visual order.

Use `interaction/hitTest.ts` for shared policy and compatibility helper exports.

## Add rendering for a shape

Prefer a small renderer in `rendering/` and call it from the shape definition's `rendering.render`.

Keep global painter order in `rendering/renderScene.ts`.

Current painter order:

```txt
triangles
circles
segments
points
```

If a new kind needs a new global render bucket, change `renderScene.ts` deliberately and add tests/smoke coverage as appropriate.

## Add view state

View state is not graph state.

Good examples:

```txt
selected nodes
hidden nodes
hovered node
active tool
viewport center
viewport zoom
viewport rotation
```

Only durable view state should be serialized or captured in history.

Durable view state:

```txt
selected node IDs
hidden node IDs
viewport center
viewport zoom
viewport rotation
```

Transient state:

```txt
hover
drag state
pointer capture
smooth viewport motion
status messages
```

## Add visibility behavior

Keep explicit user intent separate from graph-aware projections.

Good:

```txt
ViewState.hiddenNodeIds
effectiveHiddenNodeIds(graph, viewState)
```

Rendering and hit testing should use the same effective hidden set. Invisible geometry should not be selectable or draggable.

## Add circle dragging

Circle creation, rendering, selection, and deletion exist. Circle body dragging does not.

A conservative circle drag feature would likely:

1. Add a circle drag intent in `pointerIntent.ts`.
2. Add a `CIRCLE` drag state with source point IDs and initial positions.
3. Translate the free center and through points when both are free.
4. Refuse or ignore constrained circle dragging until inverse edits are designed.
5. Add unit tests before smoke coverage.

This should be treated as an explicit interaction feature, not a registry cleanup.

## Add deletion

Conservative policy:

```txt
delete selected nodes only if no unselected node depends on them
```

Blocked delete:

```txt
does not mutate graph
does not commit history
emits SHOW_STATUS
```

Successful delete:

```txt
removes selected nodes
clears selection
commits history
can be undone
```

Do not silently cascade.

## Tests

Use unit tests for:

```txt
math
graph validation
graph edits
delete policy
evaluation
geometry registry dispatch
visibility projections
hit testing
viewport transforms
viewport motion
view state
history
workspace serialization
commands and eligibility
app transitions
runtime coordination
DOM event wiring
render scheduling
app-edge side effects
status surface
```

Use smoke tests for:

```txt
browser wiring
canvas rendering
real pointer/keyboard interactions
status feedback
delete + undo
file flows only when needed
```

Smoke helpers live in `smoke/helpers/`.

## Formatting and linting

The current project relies on:

```txt
TypeScript strictness
unit tests
boundary checker
smoke tests
small patches
manual cleanup
```

If formatting becomes noisy, add Prettier in a separate commit.

Do not mix formatter adoption with architecture changes. First add config and a one-time format commit; only then consider adding `format:check` to CI.

If linting is added, prefer narrow rules that catch bugs rather than broad style churn.

Good first candidates:

```txt
unused imports
no-floating-promises
consistent type-only imports
```

## Comments

Comment why, not what.
