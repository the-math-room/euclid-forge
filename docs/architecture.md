# Architecture

Euclid Forge is a layered geometry editor with one intentional cross-sectional seam.

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The boundary checker enforces import direction. The `geometry/` directory is the exception-by-design: it gathers per-geometry behavior while keeping the rest of the pipeline layered.

## Layer map

```txt
meaning/          pure math
representation/   construction syntax and graph validity
evaluation/       graph → evaluated geometry
rendering/        evaluated geometry → canvas pixels
interaction/      pure hit testing
geometry/         per-kind geometry definitions and registry dispatch
app/              browser shell, user intent, state/history/effects
styles/           CSS
```

## `meaning/`

Pure math. No graph, rendering, DOM, or app state.

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
dependenciesOf / dependentsOf / transitiveDependentsOf
delete policy
thin construction wrappers
```

The graph is the mathematical construction document. It is not view state. Derived geometry is not stored as coordinates in the graph.

Delete policy is conservative:

```txt
delete selected nodes only when no unselected node depends on them
```

Blocked deletes produce a reason. The app layer may show that reason, but representation owns the dependency rule.

### Graph edits

Graph edits are the mutation language for durable construction state.

Important current edits:

```txt
ADD_FREE_POINT
ADD_NODES
MOVE_FREE_POINT
TRANSLATE_FREE_POINTS
SET_FREE_POINT_POSITIONS
DELETE_NODES
```

Body dragging ultimately resolves to moving free source points, usually through `SET_FREE_POINT_POSITIONS`.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry and does not mutate the graph. Evaluation is dispatched through the geometry registry:

```txt
evaluateGraph
→ evaluateGeometryNode
→ geometry definition evaluation section
```

The evaluation context exposes safe dependency accessors:

```txt
getPoint(id)
getSegment(id)
getTriangle(id)
```

Evaluated geometry carries two related but distinct ideas:

```txt
kind        evaluated shape category: POINT / SEGMENT / CIRCLE / TRIANGLE
sourceKind  source node kind: FREE_POINT / MIDPOINT / CENTROID / SEGMENT / CIRCLE / TRIANGLE
```

`sourceKind` lets registry dispatch remain explicit without reverse-inferring node kind from evaluated point role.

## `geometry/`

The `geometry/` directory is the controlled cross-layer seam for shape-specific behavior.

A geometry definition may own:

```txt
representation.dependencies
evaluation.evaluate
rendering.layer
rendering.render
interaction.hitClass
interaction.hitTest
interaction.bodyDrag
construction.factories
```

This keeps shape-specific behavior close together while preserving the closed core unions for now.

### Registry responsibilities

The registry provides dispatch for:

```txt
dependenciesForGeometryNode
evaluateGeometryNode
renderGeometryValue
renderLayerForGeometryValue
hitGeometryValue
bodyDragForGeometryNode
constructionFactoryForGeometryKind
```

Layer code should use these registry seams rather than open-coding shape switches.

### Body-drag metadata

Body dragging is opt-in per geometry definition.

The registry concept is:

```txt
interaction.bodyDrag.sourcePointIds(node, context) → readonly NodeId[] | null
```

A shape is body-draggable only when its definition can name a finite set of free source points whose translation preserves the represented geometry.

Examples:

```txt
TRIANGLE
  source points: a, b, c
  draggable when all three are FREE_POINT nodes

CIRCLE
  source points: center, through
  draggable when both are FREE_POINT nodes

MIDPOINT / CENTROID
  no bodyDrag metadata
  not directly draggable because inverse semantics are ambiguous
```

The app layer does not know triangle or circle internals. It asks the registry for body-drag sources and translates those free points.

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Global painter order is layer-based:

```txt
AREA → LINEAR → POINT
```

Within each render layer, `zIndex` orders overlapping geometry. This keeps points visually above areas while allowing same-layer shapes such as circles and triangles to stack predictably.

Actual drawing dispatches through the geometry registry:

```txt
renderScene
→ renderGeometryValue
→ geometry definition rendering section
```

Shape-specific renderer files remain in `rendering/` for canvas drawing mechanics.

## `interaction/`

Pure hit testing. No DOM and no app state mutation.

Hit testing uses broad class priority:

```txt
POINT → LINEAR → AREA
```

Within a hit class, `zIndex` decides overlapping winners, with distance as a tie-breaker where applicable.

Generic selection uses:

```txt
hitTestSelectionTarget
```

Generic body dragging uses:

```txt
hitTestDraggableAreaBody
```

That function chooses a draggable area body through registry body-drag metadata rather than hardcoding triangle or circle behavior.

## `app/`

Browser shell and user intent.

Owns:

```txt
AppState
ViewState
DragState
AppTransition
AppRuntime
commands
pointer intent
DOM event wiring
history
workspace save/open
status effects
```

The app layer interprets user input into transitions. Transitions may update graph state, view state, drag state, history, render scheduling, pointer capture, and status messages.

### Pointer intent

Pointer intent separates user gesture interpretation from mutation.

Current shape:

```txt
shift pointer down
  → generic selection hit testing

ordinary pointer down
  → free point drag if a free point is hit
  → draggable area body if registry exposes body-drag source points
  → add free point otherwise
```

Free-point drag priority is preserved so points remain easy to grab even inside area geometry.

Area body drag uses topmost draggable area by z-index.

### Drag state

There are two main drag modes:

```txt
FREE_POINT
  directly moves one free point

BODY
  translates a captured set of free source points
```

`BODY` drag stores:

```txt
nodeId
sourcePointIds
initialPointerWorld
initialSourcePointPositions
```

The reusable free-point drag helpers capture initial positions and translate them by pointer delta.

## Selection predicates

Command eligibility lives in focused selection predicate helpers rather than directly in the command table.

Examples:

```txt
selectedCirclePoints
selectedFreePointVertices
selectedTriangle
requireSelectedCirclePoints
requireSelectedFreePointVertices
requireSelectedTriangle
```

This keeps `commands.ts` focused on command registration and execution.

## Visibility

View state stores explicitly hidden nodes.

Effective visibility is derived by including transitive dependents:

```txt
hidden node → dependent geometry also effectively hidden
```

Rendering and interaction consume the effective hidden set so hidden or dependent-hidden objects are not drawn or hit.

## History

History stores durable snapshots.

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
status messages
```

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

It does not store hover, drag state, history, pointer capture, smooth viewport motion, or status messages.

## Boundary checker

The boundary checker treats `geometry/` as an explicit seam.

Allowed direction is intentionally narrow:

```txt
geometry → meaning
geometry → representation
geometry → evaluation
geometry → rendering
```

Layer code may depend on `geometry/` only at dispatch seams:

```txt
representation → geometry
evaluation → geometry
rendering → geometry
interaction → geometry
```

`app/` should not depend on `geometry/` directly. It should go through the normal layer APIs.

## Current architectural stance

Keep the core unions closed for now:

```txt
GeometryNode
EvaluatedGeometry
```

Put per-shape behavior in `src/geometry/definitions/*` where possible.

Keep compound constructions outside a single shape definition when they coordinate multiple node kinds.

Avoid adding a generalized tool system until user-facing interaction pressure requires it.
