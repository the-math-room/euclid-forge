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

Derived geometry is not stored as coordinates in the graph.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry. It does not mutate the graph.

Visibility over evaluated geometry lives here when it is independent of browser effects.

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Rendering may respect selection, hover, and hidden nodes. It does not edit constructions.

Labels are screen annotations. View rotation moves label anchor points, but labels stay upright.

## `interaction/`

Pure hit testing.

Examples:

```txt
hitTestPoint
hitTestFreePoint
hitTestSegmentSelection
hitTestTriangleSelection
hitTestTriangleInterior
```

Hit testing consumes an evaluated scene and a viewport. It does not own app state, DOM state, or graph mutations.

Hit priority:

```txt
normal click: free point → triangle body → add point
shift-click:  point → segment → triangle
```

Within a kind, later visual order wins exact ties. Triangles use reverse visual order for overlapping interiors.

## `app/`

Browser shell and user transitions.

```txt
main.ts                  DOM wiring and runtime state
appController.ts         pointer input → AppTransition
commands.ts              keyboard command definitions
appState.ts              Graph + ViewState + DragState
viewState.ts             view state helpers
dragState.ts             active drag description
history.ts               linear undo/redo snapshots
workspace.ts             pure workspace serialization
workspaceFiles.ts        file/JSON primitives
workspaceActions.ts      save/open orchestration
keyboardShortcuts.ts     keyboard shortcut classification
transitionEffects.ts     AppTransition side effects
viewportMotion.ts        smooth transient viewport rotation
effectiveVisibility.ts   graph-aware view projections
canvasSurface.ts         canvas/viewport DOM utilities
renderScheduler.ts       requestAnimationFrame coalescing
```

## Core rules

```txt
Derived geometry is never directly mutated.
User effects become GraphEdit values or ViewState changes.
GraphEdit values produce new validated Graphs.
Selection, visibility, hover, and viewport intent are view state.
Rendering consumes evaluated geometry.
DOM effects stay at the app edge.
```

## Viewport

Viewport center, zoom, and rotation are view state.

Canvas width and height are environmental facts derived at render/input time.

```txt
Graph says what exists mathematically.
Evaluation says where mathematical things are.
Viewport says how the user is looking at them.
```

Smooth hold-to-rotate is transient app state. It changes `viewportRotation` over animation frames, but the motion state itself is not durable.

## Visibility

There are two visibility concepts:

```txt
explicitly hidden nodes   nodes the user directly hid
effectively hidden nodes  explicitly hidden nodes plus graph dependents
```

`ViewState.hiddenNodeIds` stores explicit user intent.

`effectiveHiddenNodeIds(graph, viewState)` computes dependency-aware visibility.

Rendering and interaction should consume the same effective visibility projection. Hidden or effectively hidden objects should not be visible, selectable, or draggable.

Selection is cleaned so no effectively hidden node remains selected.

## Hover

Hover is preview state.

```txt
hoveredNodeId
```

Hover is not durable. It is not serialized. It is not stored in history. It clears on drag, pointerdown, pointerleave, and workspace load.

## Dragging

Free points are directly draggable.

Triangle body dragging translates its free vertices. It stores the initial pointer world position and initial vertex positions, then computes absolute positions from the drag start.

This avoids frame-to-frame drift.

Triangles with constrained vertices are not body-draggable unless an explicit inverse edit is later defined.

## History

Undo/redo is a linear timeline.

```txt
past ← present → future
```

A snapshot contains:

```txt
graph
viewState with hover cleared
```

A snapshot does not contain:

```txt
drag state
pointer capture
viewport motion
history
```

Committing after undo discards the redo future.

Snapshots do not have their own undo/redo history.

## Workspace serialization

A workspace stores durable project state:

```txt
version
graph nodes
selected node IDs
hidden node IDs
viewport center
viewport zoom
viewport rotation
```

It does not store:

```txt
hover
drag state
history
pointer capture
smooth viewport motion
```

Loading validates through `createGraph` before mutating app state. Successful load resets history to the loaded workspace.
