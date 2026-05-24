# Feature Workflow

Prefer small vertical changes.

Keep the pipeline intact:

```txt
user input → AppTransition → GraphEdit/ViewState → Graph/EvaluatedScene → render
```

## Patch discipline

Before patching, name the touched layers.

Good patch sizes:

```txt
representation only
app command only
DOM/app-edge only
rendering only
docs only
```

If a patch touches more than three layers, split it unless there is a strong reason not to.

For user-visible app-edge behavior, prefer:

```txt
model/policy
command result
transition/effect seam
DOM surface
smoke coverage
docs
```

## Add a construction

1. Add syntax in `representation/node.ts`.
2. Add dependencies in `representation/dependencies.ts`.
3. Add evaluated type in `evaluation/evaluated.ts`, if needed.
4. Add evaluation in `evaluation/evaluateGraph.ts`.
5. Add rendering only if drawing changes.
6. Add `GraphEdit` support if users can create it.
7. Add unit tests.
8. Add smoke coverage only for browser-visible behavior.

## Add a keyboard command

1. Add or update a command in `app/commands.ts`.
2. Give it a stable `id`.
3. Define shortcut keys.
4. Return `history: "commit"` only for durable editor changes.
5. Return a status message for useful blocked-user feedback.
6. Add command tests.
7. Let `appController.ts` delegate through `appCommandForKey`.

Keyboard commands should be reusable by future menus, toolbars, and command palettes.

## Add a pointer interaction

1. Decide the user intent.
2. Keep hit testing in `interaction/`.
3. Put pointer hit policy in `app/pointerIntent.ts`.
4. Add or update transition behavior in `appController.ts`.
5. Keep DOM effects in app-edge helpers.
6. Keep graph mutations in `representation/edit.ts`.
7. Add controller and pointer-intent tests.

Pointer gestures do not need to be forced into the keyboard command abstraction.

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

## Add viewport behavior

Viewport center, zoom, and rotation belong in `ViewState`.

Canvas width and height stay derived from the canvas.

Good:

```txt
ViewState.viewportCenter
ViewState.viewportZoom
ViewState.viewportRotation
viewportForCanvas(canvas, viewState)
```

Smooth animation state belongs in `viewportMotion.ts`, not in `ViewState`.

## Add visibility behavior

Keep explicit user intent separate from graph-aware projections.

Good:

```txt
ViewState.hiddenNodeIds
effectiveHiddenNodeIds(graph, viewState)
```

Rendering and hit testing should use the same effective hidden set.

Invisible geometry should not be selectable or draggable.

When effective visibility changes, clean selection so effectively hidden nodes do not remain selected.

## Add hover behavior

Hover is preview state.

It should:

```txt
use the same hit policy as click
respect effective visibility
clear during drag
clear on pointer leave
stay out of history
stay out of serialization
```

## Add history behavior

History is an app-shell concern.

Use snapshots:

```txt
Snapshot = graph + normalized view state
```

Do not store:

```txt
drag state
hover
pointer capture
smooth motion state
status messages
history inside snapshots
```

Use linear undo/redo.

```txt
commit after undo discards redo future
```

Use `history: "commit"` only for durable editor actions.

Do not put ordinary viewport navigation in history unless the product decision changes.

## Add workspace behavior

Workspace serialization belongs in `app/`.

```txt
workspace.ts         pure workspace format
workspaceFiles.ts    file/JSON primitives
workspaceActions.ts  browser save/open orchestration
```

Loading should:

```txt
read file
parse JSON
validate workspace shape
validate graph through createGraph
only then set state
reset history
render
```

Saving should not affect history.

## Add status feedback

Status feedback is app-edge UI.

Use:

```txt
statusSurface.ts
transitionEffects.ts
AppTransition.statusMessage
```

Status messages should explain blocked user actions. They should not mutate graph, view, history, or workspace state.

Smoke-test status feedback when it is user-visible.

## Add derived geometry

Derived geometry should depend on source construction.

Good:

```txt
CENTROID depends on TRIANGLE
MIDPOINT depends on SEGMENT
```

Avoid storing derived coordinates in the graph.

## Add deletion

Conservative policy:

```txt
delete selected nodes only if no unselected node depends on them
```

Blocked delete:

```txt
does not mutate graph
does not commit history
shows a status message
```

Successful delete:

```txt
removes selected nodes
clears selection
commits history
can be undone
```

Do not silently cascade.

Possible later options:

```txt
select dependents
cascade delete with confirmation
delete branch/subconstruction
```

## Tests

Use unit tests for:

```txt
math
graph validation
graph edits
delete policy
evaluation
visibility projections
hit testing
viewport transforms
viewport motion
view state
history
workspace serialization
commands
app transitions
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

## Comments

Comment why, not what.
