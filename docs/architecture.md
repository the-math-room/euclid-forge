# Architecture

Euclid Forge is a layered pipeline.

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The boundary checker enforces import direction.

## `meaning/`

Pure math.

No graph. No rendering. No DOM.

Examples:

```txt
Vec2
midpoint
centroid
deltaBetween
```

## `representation/`

Construction syntax and graph validity.

Owns:

```txt
GeometryNode
Graph
GraphEdit
createGraph
applyGraphEdit
dependenciesOf
dependentsOf
transitiveDependentsOf
```

The graph is the mathematical construction document. It is not view state.

Graph edits are the only way app interactions change mathematical construction state.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry. It does not mutate the graph.

Visibility projections over evaluated geometry also live here when they are independent of browser effects. For example:

```txt
visibleEvaluatedScene
```

This keeps rendering and hit testing aligned around the same visible evaluated scene.

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Rendering may respect view options such as selection, hover, and hidden nodes. It does not edit constructions.

Labels are screen-space annotations. Geometry positions are transformed through the viewport; label glyphs remain upright for readability.

## `interaction/`

Pure hit testing and gesture-adjacent logic.

Examples:

```txt
hitTestPoint
hitTestFreePoint
hitTestSegmentSelection
hitTestTriangleSelection
hitTestTriangleInterior
```

Hit testing consumes an evaluated scene and a viewport. It does not own app state, DOM state, or graph mutations.

Hit testing follows the explicit visual priority policy:

```txt
shift-click / shift-hover:
  point > segment > triangle

normal click / normal hover:
  free point > triangle body > empty canvas

same-kind tie-breaks:
  later-rendered objects win exact ties
  nearest point/segment still wins non-ties
```

## `app/`

Browser shell and interaction transitions.

```txt
main.ts                 DOM wiring and browser effects
appController.ts        user input → AppTransition
appState.ts             Graph + ViewState + DragState
effectiveVisibility.ts  graph-aware view projections
viewState.ts            selected/hidden/hovered node IDs and viewport intent
dragState.ts            active drag description
canvasSurface.ts        canvas/viewport DOM utilities
renderScheduler.ts      requestAnimationFrame coalescing
viewportMotion.ts       transient frame-based viewport motion
```

## Core rules

```txt
Derived geometry is never directly mutated.
User effects become GraphEdit values or ViewState changes.
GraphEdit values produce new validated Graphs.
Selection, visibility, hover, and viewport intent are view state.
Rendering consumes evaluated geometry.
```

## Viewport ownership

Viewport center, zoom, and rotation are view state.

Canvas width and height are environmental facts derived from the canvas at render/input time.

```txt
Graph says what exists mathematically.
Evaluation says where mathematical things are.
Viewport says how the user is looking at them.
```

The complete `Viewport` value is assembled at the app edge from:

```txt
canvas dimensions + ViewState viewport center/zoom/rotation
```

Rendering and interaction receive a complete viewport, but they do not own it.

View rotation is around the screen center, which corresponds to `viewport.center` in world coordinates. Rotation is implemented in the world/screen coordinate transforms rather than by rotating the canvas context globally, so geometry rotates rigidly while labels stay upright.

## Viewport motion

Discrete viewport intent lives in `ViewState`.

Temporal input state, such as smooth hold-to-rotate behavior, lives in the app layer.

```txt
keydown [ / ]  → start transient viewport rotation motion
animation step → update ViewState.viewportRotation
keyup [ / ]    → stop transient viewport rotation motion
```

Velocity and animation timestamps are not durable view state.

## Visibility

There are two visibility concepts:

```txt
explicitly hidden nodes   nodes the user directly hid
effectively hidden nodes  explicitly hidden nodes plus graph dependents
```

`ViewState.hiddenNodeIds` stores explicit user intent.

`effectiveHiddenNodeIds(graph, viewState)` computes dependency-aware visibility for rendering and hit testing.

Rendering and interaction should consume the same effective visibility projection. A hidden or effectively hidden object should not be visible, selectable, hovered, or draggable.

Selection is cleaned so that no effectively hidden node remains selected.

## Hover

Hover is view state, not graph state.

```txt
ViewState.hoveredNodeId
```

Hover preview uses the same effective-visible hit policy as pointerdown. It should not mutate constructions.

Hover is cleared when dragging starts, while dragging, and when the pointer leaves the canvas.

## Dragging

Free points are directly draggable.

Triangle body dragging translates its free vertices.

Triangle drag stores the initial pointer world position and initial vertex positions, then computes every frame from the drag start. This avoids accumulated floating-point drift.

Side midpoints are modeled as segment midpoints. Shared sides should reuse the same segment and midpoint nodes.

Triangles with constrained vertices are not body-draggable unless an explicit inverse edit is later defined.
