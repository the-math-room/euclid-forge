# Forge Interaction Model

Forge interaction is organized around pointer intent, drag state, and geometry/annotation hit-testing boundaries.

## Pointer intent

`pointerDownIntent` interprets a pointerdown against the current visible evaluated scene.

Current intent categories include:

```ts
SELECT_NODE
DRAG_FREE_POINT
DRAG_LABEL
DRAG_BODY
ADD_FREE_POINT
NONE
```

Shift-click remains selection-oriented. Non-shift pointerdown first checks higher-priority draggable targets before falling through to adding a free point.

## Drag state

`DragState` records active drag behavior:

```ts
VIEWPORT
LASSO
FREE_POINT
LABEL
BODY
```

The `LABEL` drag state stores:

```ts
nodeId
initialPointerScreen
initialLabelOffsetPx
```

Pointermove computes a screen-space delta and applies `SET_POINT_LABEL_OFFSET`.

## Hit testing

Geometry hit testing operates on `EvaluatedGeometry` only. Use `evaluatedGeometryItems(scene)` before iterating through scene output.

Label hit testing is intentionally separate. It checks point-label pill bounds rather than treating labels as points.

## Rendering and interaction boundary

Rendering and interaction must not import each other. Shared layout math, such as label pill bounds, belongs in a neutral layer that both can import.

Bad dependency direction:

```text
interaction -> rendering
rendering -> interaction
```

Preferred direction:

```text
interaction -> ui/layout
rendering   -> ui/layout
```

## Performance notes

Pointermove paths are performance-sensitive. Avoid changes that cause unnecessary React/UI rerenders during pointermove, viewport motion, or drag updates. Canvas rendering should remain smooth.
