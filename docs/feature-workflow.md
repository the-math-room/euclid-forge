# Feature Workflow

Prefer small vertical changes.

Keep the pipeline intact:

```txt
user input → AppTransition → GraphEdit/ViewState → Graph/EvaluatedScene → render
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
5. Add command tests.
6. Let `appController.ts` delegate through `appCommandForKey`.

Keyboard commands should be reusable by future menus, toolbars, and command palettes.

## Add a pointer interaction

1. Decide the user intent.
2. Keep hit testing in `interaction/`.
3. Add or update transition behavior in `appController.ts`.
4. Keep DOM effects in `main.ts` or app-edge helpers.
5. Keep graph mutations in `representation/edit.ts`.
6. Add controller tests.

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

## Add derived geometry

Derived geometry should depend on source construction.

Good:

```txt
CENTROID depends on TRIANGLE
MIDPOINT depends on SEGMENT
```

Avoid storing derived coordinates in the graph.

## Add deletion

Choose the dependency policy first.

Recommended first policy:

```txt
reject delete when dependents exist
```

Later options:

```txt
cascade delete
prompt in UI
delete branch/subconstruction
```

Do not silently break dependencies.

## Tests

Use unit tests for:

```txt
math
graph validation
graph edits
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
```

Use smoke tests for:

```txt
browser wiring
canvas rendering
real pointer/keyboard interactions
file flows only when needed
```

Smoke helpers live in `smoke/helpers/`.

## Comments

Comment why, not what.
