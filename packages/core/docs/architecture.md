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

Per-kind geometry definitions connecting representation to evaluation and construction metadata. Geometry may also contain headless interpretation helpers that bridge evaluated geometry and construction semantics, such as linear-constraint direction helpers.

Geometry definitions and helpers must remain headless.

### `evaluation`

Graph interpretation into evaluated geometry and diagnostics.

### `core`

Public package facade, workspace serialization/deserialization, diagnostics helpers, fixture running, and API smoke tests.

## Current constrained construction pattern

Finite parallel and perpendicular segments share a constrained endpoint pattern:

```text
LINEAR_CONSTRAINED_POINT(reference, anchor, mode, offset)
SEGMENT(anchor, constrainedPoint)
```

`mode` is one of:

```text
"PARALLEL"
"PERPENDICULAR"
```

Dragging the constrained endpoint updates the stored scalar offset. It is not a general constraint solver.

## Boundary reminder

Parallel chevrons, perpendicular visual notation, label pills, display scale, print themes, and lasso overlays are rendering/app concerns. They do not belong in Core graph state unless user-authored style annotations become a product feature.
