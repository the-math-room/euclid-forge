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
```

The graph is the mathematical construction document. It is not view state.

## `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry. It does not mutate the graph.

## `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport + render options → canvas pixels
```

Rendering may respect view options such as selection and hidden nodes. It does not edit constructions.

## `interaction/`

Pure hit testing and gesture-adjacent logic.

Examples:

```txt
hitTestPoint
hitTestFreePoint
hitTestTriangleSelection
hitTestTriangleInterior
```

## `app/`

Browser shell and interaction transitions.

```txt
main.ts            DOM wiring and browser effects
appController.ts   user input → AppTransition
appState.ts        Graph + ViewState + DragState
viewState.ts       selected and hidden node IDs
dragState.ts       active drag description
canvasSurface.ts   canvas/viewport DOM utilities
renderScheduler.ts requestAnimationFrame coalescing
```

## Core rules

```txt
Derived geometry is never directly mutated.
User effects become GraphEdit values or ViewState changes.
GraphEdit values produce new validated Graphs.
Selection and visibility are view state.
Rendering consumes evaluated geometry.
```

## Dragging

Free points are directly draggable.

Triangle body dragging translates its free vertices.

Side midpoints are modeled as segment midpoints. Shared sides should reuse the same segment and midpoint nodes.

Triangles with constrained vertices are not body-draggable unless an explicit inverse edit is later defined.
