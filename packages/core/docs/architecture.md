# Architecture

Euclid Core is a headless geometry package. It describes geometry in terms of meaning, graph representation, construction, and evaluation. It does not know how geometry is rendered or edited in a browser.

## Pipeline

```text
meaning → representation → geometry registry → evaluation → core API
```

## Layers

### `meaning`

Pure mathematical primitives and denotations such as vectors, lines, curves, and intersections.

### `view`

Pure viewport coordinate-system math. This is not rendering.

### `representation`

Authored graph structure, node shapes, edits, graph invariants, dependencies, constructions, delete policy, constrained-point movement, and free-point planning.

### `geometry`

Per-kind geometry definitions connecting representation to evaluation and construction metadata. Geometry definitions must remain headless.

### `evaluation`

Graph interpretation into evaluated geometry and diagnostics.

### `core`

Public package facade, workspace serialization/deserialization, diagnostics helpers, fixture running, and API smoke tests.

## Current constrained construction pattern

```text
PARALLEL_POINT(reference, anchor, offset)
SEGMENT(anchor, parallelPoint)
```

Dragging the constrained endpoint updates the stored scalar offset. It is not a general constraint solver.

Perpendicular constrained endpoints should follow the same architecture if added.

## Recent project state

Recent decisions that should be treated as current context:

- Lasso selection is app-side interaction. It selects fully contained visible selectable geometry; infinite lines are excluded from lasso containment.
- Labels render with translucent label pills for readability over geometry.
- The canvas has dark and high-contrast display modes plus incremental display scale for line/point/label size.
- Print output uses a print-only offscreen render/image path, not the live canvas, with a white-background print theme.
- Curve intersections suppress duplicate derived points when a candidate already coincides with an existing evaluated point.
- Circle-circle branch keys are stable relative to the directed center-to-center axis, not sorted by world coordinates.
- `PARALLEL_POINT` is a core constrained visible endpoint. A finite parallel segment is represented as `PARALLEL_POINT + SEGMENT`.
- Dragging a constrained endpoint updates its scalar offset through `MOVE_CONSTRAINED_POINT`; this is not a general constraint solver.
- Parallel chevrons are render-derived notation from transitive parallel families; they are not graph state.
