# Euclid Core

This workspace contains the headless geometry engine for Euclid Forge.

It owns geometric meaning, graph representation, construction helpers, graph edits, constrained construction nodes, free-point planning, cascading delete policy, evaluation, diagnostics, dependency inspection, workspace serialization/deserialization, headless viewport and view-state math, and the public core API.

It must not depend on the forge app, DOM, canvas, browser APIs, CSS, app commands, rendering notation, print surfaces, or editor gestures.

## Package name

```text
@euclid-forge/core
```

Forge should import Core through package paths, not relative paths into this workspace.

## Commands

```bash
npm run check -w @euclid-forge/core
npm run check:core
scripts/checks.sh concise
```

## Current app-facing invariants

- graph nodes are topologically ordered by `createGraph`
- graph edits are immutable
- free-point IDs are planned deterministically through `planFreePoint`
- deleting nodes cascades through transitive dependents
- evaluation is deterministic from graph state
- undefined geometry is reported through diagnostics rather than browser state
- viewport math is pure coordinate-system math, not rendering
- constrained endpoints such as `PARALLEL_POINT` store semantic offsets, not screen positions
- moving a constrained point updates its constraint parameter through a graph edit

## Current graph model highlights

```text
FREE_POINT
SEGMENT
LINE
CIRCLE
TRIANGLE
MIDPOINT
CENTROID
SEGMENT_INTERSECTION
CURVE_INTERSECTION
PARALLEL_POINT
```

A finite parallel segment is represented as a normal `SEGMENT` from an anchor point to a constrained `PARALLEL_POINT` endpoint.

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
