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

Pure math. No graph, rendering, or DOM.

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

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Global painter order is still centralized in `renderScene.ts`:

```txt
triangles
circles
segments
points
```

Within each bucket, actual drawing dispatches through the geometry registry:

```txt
renderScene
→ renderGeometryValue
→ geometry definition rendering section
```

Rendering may respect selection, hover, and hidden nodes. It does not edit constructions.

## `interaction/`

Pure hit testing.

Geometry-specific hit testing is dispatched through the registry:

```txt
hitTest.ts
→ hitGeometryValue
→ geometry definition interaction section
```

Current hit classes:

```txt
POINT
LINEAR
AREA
```

Selection priority is explicit:

```txt
POINT > LINEAR > AREA
```

Within a class, closest-distance hits win when distance is available; exact ties preserve reverse visual order.

Pointer policy remains app-level:

```txt
normal click:
  free point → triangle body → add point

shift-click:
  selectable geometry by hit class priority
```

Triangles are area-hit by interior. Circles are area-hit by disk, not only circumference.

## `geometry/`

`geometry/` is the intentional cross-sectional seam.

It centralizes per-kind behavior that would otherwise become shotgun surgery across representation, evaluation, rendering, interaction, and construction.

Each geometry definition can include:

```txt
representation.dependencies
evaluation.evaluate
rendering.render
interaction.hitClass
interaction.hitTest
construction.factories
```

The registry is closed but centralized:

```txt
GeometryNode remains a closed union.
Each kind has one definition file.
geometryRegistry.ts erases definition-specific types at the seam.
Core loops dispatch through the registry.
```

This avoids a runtime plugin system and preserves TypeScript exhaustiveness in the canonical node union.

### Registry dispatch points

```txt
representation/dependencies.ts
  dependenciesOf(node)
  → dependenciesForGeometryNode(node)

evaluation/evaluateGraph.ts
  evaluateGraph(graph)
  → evaluateGeometryNode(node, context)

rendering/renderScene.ts
  renderScene(...)
  → renderGeometryValue(value, context)

interaction/hitTest.ts
  hit testing helpers
  → hitGeometryValue(value, context)

representation/constructions.ts
  thin construction wrappers
  → constructionFactoryForGeometryKind(kind, name)
```

### Construction factories

Single-kind construction factories live on definitions:

```txt
circleConstruction   → CIRCLE definition
triangleConstruction → TRIANGLE definition
centroidConstruction → CENTROID definition
```

Compound constructions may remain outside a single shape definition when they create or coordinate multiple kinds.

Current example:

```txt
triangleSideMidpointConstruction
→ creates/reuses SEGMENT nodes
→ creates MIDPOINT nodes
```

That function remains in `representation/constructions.ts` because it is a cross-kind construction rather than a pure TRIANGLE factory.

## `app/`

Browser shell and user transitions.

```txt
main.ts                  app composition
domEvents.ts             DOM listener wiring
appRuntime.ts            state/history/render/status coordinator
appController.ts         pointer and key input → AppTransition
commands.ts              keyboard command definitions and eligibility
appState.ts              Graph + ViewState + DragState
viewState.ts             view state helpers
dragState.ts             active drag description
history.ts               linear undo/redo snapshots
workspace.ts             pure workspace serialization
workspaceFiles.ts        file/JSON primitives
workspaceActions.ts      save/open orchestration
keyboardShortcuts.ts     keyboard shortcut classification
transitionEffects.ts     AppTransition effect interpreter
statusSurface.ts         status message DOM surface
viewportMotion.ts        smooth transient viewport rotation
effectiveVisibility.ts   graph-aware view projections
canvasSurface.ts         canvas/viewport DOM utilities
renderScheduler.ts       requestAnimationFrame coalescing
pointerIntent.ts         pointer hit-policy seam
```

The app layer decides when user intent should trigger a construction, selection, drag, delete, history commit, status message, or DOM effect.

The geometry registry knows how a shape behaves. The app layer decides when to use that behavior.

## Core rules

```txt
Derived geometry is never directly mutated.
User effects become GraphEdit values or ViewState changes.
GraphEdit values produce new validated Graphs.
Selection, visibility, hover, and viewport intent are view state.
Rendering consumes evaluated geometry.
DOM effects stay at the app edge.
```

## App transition protocol

`AppTransition` is the app protocol between controller logic and the runtime/effects layer.

It carries:

```txt
next AppState
whether to render
whether to prevent default
history policy
AppEffect[]
```

`AppEffect[]` currently includes:

```txt
SET_POINTER_CAPTURE
RELEASE_POINTER_CAPTURE
SHOW_STATUS
```

Effects are app-edge instructions. They are not graph state, view state, workspace state, or history state.

## Visibility

There are two visibility concepts:

```txt
explicitly hidden nodes   nodes the user directly hid
effectively hidden nodes  explicitly hidden nodes plus graph dependents
```

`ViewState.hiddenNodeIds` stores explicit user intent. `effectiveHiddenNodeIds(graph, viewState)` computes dependency-aware visibility.

Rendering and interaction should consume the same effective visibility projection. Hidden or effectively hidden objects should not be visible, selectable, or draggable.

## Dragging

Free points are directly draggable.

Triangle body dragging translates its free vertices. It stores the initial pointer world position and initial vertex positions, then computes absolute positions from the drag start.

Circles are currently selectable and deletable, but not draggable as a body. Adding circle dragging should be an explicit interaction/edit feature.

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
