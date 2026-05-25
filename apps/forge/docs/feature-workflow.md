# Feature Workflow

This document describes how to add features in the Euclid Forge monorepo without weakening the core/app boundary.

## Default workflow

1. Make the smallest coherent patch.
2. Keep `scripts/checks.sh concise` green between patches.
3. Prefer behavior tests before or with implementation.
4. Decide whether the change belongs in `packages/core`, `apps/forge`, or both.
5. Keep `packages/core` headless.
6. Route reusable engine behavior through the core package surface.
7. Update docs when the mental model changes.

## Choosing the right package

Put behavior in `packages/core` when it involves math, geometry denotation, graph representation, graph edits, construction helpers, evaluation, diagnostics, dependency inspection, delete policy, workspace serialization, or headless viewport math.

Put behavior in `apps/forge` when it involves keyboard shortcuts, pointer gestures, modal tools, DOM events, canvas drawing, status messages, history grouping, render scheduling, CSS, print image generation, display controls, visual notation, or browser smoke tests.

## New geometry kind checklist

A new geometry kind usually touches:

```txt
packages/core/src/representation/node.ts
packages/core/src/evaluation/evaluated.ts
packages/core/src/geometry/definitions/<kind>.ts
packages/core/src/geometry/geometryRegistry.ts
packages/core/src/representation/constructions.ts, if constructible
packages/core/src/representation/edit.ts, if it has editable graph state
packages/core/src/core/index.ts, if app-facing
packages/core tests and fixtures

apps/forge/src/rendering renderer/theme, if visual
apps/forge/src/interaction hit geometry, if selectable/draggable
apps/forge/src/app selection predicates, commands, or modal tools, if user-constructible
apps/forge smoke tests, if browser behavior changes
```

## Modal tool workflow

```txt
activeTool.ts          tool state, required input counts, status text
activeToolPointer.ts   pointer behavior for the active tool
toolSurface.ts         toolbar exposure
pointerIntent.ts       hit/add/drag intent, if needed
commands.ts            keyboard parity, if needed
smoke tests            browser-level user workflow
```

## Recent feature patterns

- Lasso is app interaction.
- Print is app rendering through a print-only image.
- Display theme/scale are app display settings.
- Parallel finite segments use core `PARALLEL_POINT + SEGMENT`, with app command/tool wiring and app-rendered chevrons.

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
