# Architecture

Euclid Forge is organized as a pipeline.

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The boundary checker enforces this direction.

## Layers

### `meaning/`

Pure math.

No graph. No rendering. No DOM.

Examples:

```txt
Vec2
midpoint
centroid
deltaBetween
```

### `representation/`

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

### `evaluation/`

Gives meaning to a validated graph.

```txt
Graph → EvaluatedScene
```

Evaluation derives geometry. It does not mutate the graph.

Examples:

```txt
TRIANGLE → EvaluatedTriangle
CENTROID → EvaluatedPoint
TRIANGLE_SIDE_MIDPOINT → EvaluatedPoint
```

### `rendering/`

Draws evaluated geometry.

```txt
EvaluatedScene + Viewport → canvas pixels
```

Rendering does not know how constructions are edited.

### `interaction/`

Pure hit testing and gesture-adjacent logic.

It may inspect evaluated geometry and graph structure, but should not perform DOM effects.

### `app/`

Browser shell.

Owns:

```txt
DOM lookup
canvas context
pointer events
keyboard events
requestAnimationFrame scheduling
current Graph
current selection
current drag state
```

## Core rules

```txt
Derived geometry is never directly mutated.
User effects become GraphEdit values.
GraphEdit values produce new validated Graphs.
Rendering consumes evaluated geometry only.
Selection is view state, not graph state.
```

## Triangle dragging

A triangle body is draggable only when all defining vertices are free points.

Dragging a triangle means:

```txt
translate its free vertices
```

It does not mutate the evaluated triangle directly.

Triangles with constrained vertices are not body-draggable unless an explicit inverse edit is later defined.
