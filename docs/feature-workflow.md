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

## Add a graph edit

Graph edits belong in `representation/edit.ts`.

Good examples:

```txt
ADD_FREE_POINT
MOVE_FREE_POINT
SET_FREE_POINT_POSITIONS
ADD_TRIANGLE
ADD_CENTROID
ADD_MIDPOINTS
```

Graph edits should produce a new validated `Graph` through `createGraph`.

Avoid mutating evaluated geometry directly.

## Add a user interaction

1. Decide the user intent.
2. Add or update `AppTransition` behavior in `appController.ts`.
3. Keep DOM effects in `main.ts`.
4. Keep graph mutations in `representation/edit.ts`.
5. Keep hit testing in `interaction/`.
6. Add unit tests for controller behavior.

Pointer and keyboard interactions should return transitions rather than directly touching the DOM.

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

These should not become geometry nodes unless they have mathematical meaning.

## Add viewport behavior

Viewport center, zoom, and rotation belong in `ViewState`.

Canvas width and height should stay derived from the canvas.

Good:

```txt
ViewState.viewportCenter
ViewState.viewportZoom
ViewState.viewportRotation
viewportForCanvas(canvas, viewState)
```

Avoid storing canvas dimensions as durable view state. They are environmental facts, not user intent.

Keyboard, wheel, gesture, or animation-driven viewport interactions should update view state through helpers such as:

```txt
panViewport
zoomViewport
rotateViewport
resetViewport
resetViewportRotation
setViewportCenter
setViewportZoom
setViewportRotation
```

## Add smooth viewport motion

Frame-based input motion belongs in the app layer, not in `ViewState`.

Good:

```txt
viewportMotion.ts owns transient direction and last timestamp
stepViewportMotion returns updated AppState + motion state
ViewState stores only the resulting center/zoom/rotation
```

Avoid adding velocity, acceleration, timestamps, or key-held flags to `ViewState` unless they become durable user intent.

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

Rendering and hit testing should use the same effective hidden set. Invisible geometry should not be visible, hovered, selectable, or draggable.

When effective visibility changes, clean selection so effectively hidden nodes do not remain selected.

## Add hover behavior

Hover is view state.

Good:

```txt
ViewState.hoveredNodeId
setHoveredNode(viewState, id)
```

Hover should be computed from the same visible evaluated scene and hit-test policy as pointerdown.

Hover should clear when:

```txt
pointerdown starts a click/drag
pointermove is dragging
pointer leaves the canvas
nothing is under the pointer
```

## Add hit-test behavior

Keep hit tests pure.

Hit tests should consume:

```txt
EvaluatedScene
Viewport
ScreenPoint
```

They should not inspect DOM state.

When changing hit policy, add tests for:

```txt
priority between object kinds
overlapping triangles
exact point/segment ties
hidden/effectively hidden geometry through app-controller tests
```

## Add derived geometry

Derived geometry should depend on source construction.

Good:

```txt
CENTROID depends on TRIANGLE
MIDPOINT depends on SEGMENT
```

Avoid storing derived coordinates in the graph.

## Add drag behavior

For continuous drag operations, prefer computing from the drag start rather than incrementally accumulating frame deltas.

Good:

```txt
initialPointerWorld
initialVertexPositions
currentWorld - initialPointerWorld
```

This keeps dragging deterministic and avoids accumulated floating-point drift.

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
viewport transforms
viewport motion
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
