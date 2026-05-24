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
8. Add smoke coverage only for user-visible browser behavior.

## Add a user interaction

1. Decide the user intent.
2. Add or update `AppTransition` behavior in `appController.ts`.
3. Keep DOM effects in `main.ts`.
4. Keep graph mutations in `representation/edit.ts`.
5. Keep hit testing in `interaction/`.
6. Add unit tests for controller behavior.

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
```

These should not become geometry nodes unless they have mathematical meaning.

## Add viewport behavior

Viewport center and zoom belong in `ViewState`.

Canvas width and height should stay derived from the canvas.

Good:

```txt
ViewState.viewportCenter
ViewState.viewportZoom
viewportForCanvas(canvas, viewState)
```

Avoid storing canvas dimensions as durable view state. They are environmental facts, not user intent.

Keyboard, wheel, or gesture viewport interactions should update view state through helpers such as:

```txt
panViewport
zoomViewport
resetViewport
setViewportCenter
setViewportZoom
```

## Add visibility behavior

Keep explicit user intent separate from graph-aware projections.

Good:

```txt
ViewState.hiddenNodeIds
```

Then derive effective visibility from the graph:

```txt
effectiveHiddenNodeIds(graph, viewState)
```

Rendering and hit testing should use the same effective hidden set. Invisible geometry should not be selectable or draggable.

When effective visibility changes, clean selection so effectively hidden nodes do not remain selected.

## Add derived geometry

Derived geometry should depend on source construction.

Good:

```txt
CENTROID depends on TRIANGLE
MIDPOINT depends on SEGMENT
```

Avoid storing derived coordinates in the graph.

## Tests

Use unit tests for:

```txt
math
graph validation
graph edits
evaluation
visibility projections
hit testing
app transitions
view state
render scheduling
```

Use smoke tests for:

```txt
browser wiring
canvas rendering
real pointer/keyboard interactions
```

Smoke helpers live in `smoke/helpers/`.

## Comments

Comment why, not what.

Good:

```ts
// Triangles with constrained vertices are not body-draggable.
// Moving only the free anchors would deform the construction.
```

Bad:

```ts
// Loop over triangles.
```
