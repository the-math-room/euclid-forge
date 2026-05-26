# Architecture

Euclid Forge is a monorepo with a headless geometry core and a browser/editor application.

```text
packages/core  →  headless geometry engine
apps/forge     →  browser/editor application that consumes core
```

`core` must never depend on `forge`.

## Dependency rule

```text
apps/forge may import packages/core
packages/core may not import apps/forge
```

## Intended monorepo map

```text
packages/core/src/
  meaning/          pure math and denotational geometry helpers
  representation/   construction syntax, graph validity, graph edits
  evaluation/       graph → evaluated geometry and diagnostics
  geometry/         per-kind geometry definitions and headless interpretation helpers
  core/             headless engine/workspace/view-state facade
  view/             viewport/view-state math that remains browser-independent

apps/forge/src/
  app/              browser shell, user intent, state/history/effects/tools
  interaction/      hit testing and pointer-facing geometry adapters
  rendering/        evaluated geometry → canvas pixels and display notation
  styles/           CSS and app presentation
```

## Core owns

Math primitives, geometry denotations, graph representation, graph edits, construction helpers, dependency inspection, free-point planning, delete policy, evaluation, diagnostics, workspace parsing/serialization, headless view-state, viewport math, and constrained endpoint semantics.

## Forge owns

Keyboard shortcuts, pointer gestures, modal tools, DOM events, status messages, history grouping, render scheduling, canvas rendering, CSS, browser smoke tests, print-surface image rendering, display controls, and rendering notation derived from evaluated geometry.

## App flow

```text
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

Parallel chevrons are computed from transitive families of `LINEAR_CONSTRAINED_POINT` nodes with `mode: "PARALLEL"` and rendered onto line/segment geometry. Perpendicular visual notation, if added, should follow the same app-rendered notation rule.
