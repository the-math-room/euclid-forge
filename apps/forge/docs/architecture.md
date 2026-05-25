# Architecture

Euclid Forge is a monorepo with a headless geometry core and a browser/editor application.

```txt
packages/core  →  headless geometry engine
apps/forge     →  browser/editor application that consumes core
```

`core` must never depend on `forge`.

## Dependency rule

```txt
apps/forge may import packages/core
packages/core may not import apps/forge
```

## Intended monorepo map

```txt
packages/core/src/
  meaning/          pure math and denotational geometry helpers
  representation/   construction syntax, graph validity, graph edits
  evaluation/       graph → evaluated geometry and diagnostics
  geometry/         per-kind geometry definitions and registry dispatch
  core/             headless engine/workspace/view-state facade
  view/             viewport/view-state math that remains browser-independent

apps/forge/src/
  app/              browser shell, user intent, state/history/effects/tools
  interaction/      hit testing and pointer-facing geometry adapters
  rendering/        evaluated geometry → canvas pixels and display notation
  styles/           CSS and app presentation
```

## Core owns

Math primitives, geometry denotations, graph representation, graph edits, construction helpers, dependency inspection, free-point planning, delete policy, evaluation, diagnostics, workspace parsing/serialization, headless view-state, and viewport math.

## Forge owns

Keyboard shortcuts, pointer gestures, modal tools, DOM events, status messages, history grouping, render scheduling, canvas rendering, CSS, browser smoke tests, print-surface image rendering, display controls, and rendering notation derived from evaluated geometry.

## App flow

```txt
DOM event
→ app intent / command / modal tool
→ graph edit or view-state update
→ transition result
→ runtime effects/history/render request
→ evaluate graph
→ render evaluated scene
```

## Display notation

Visual markings derived from meaning but not graph state belong in Forge: label pills, lasso overlays, high-contrast themes, display scale, print themes, and parallel family chevrons.

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
