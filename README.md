# Euclid Forge

Euclid Forge is a monorepo for a browser-based Euclidean construction editor and its headless geometry engine.

```text
packages/core = headless geometry engine
apps/forge    = browser/editor application
```

The repository is intentionally split by responsibility:

```text
forge may import core
core must never import forge
core must not depend on DOM, canvas, CSS, browser events, or browser APIs
```

## Workspaces

### `packages/core`

Core owns mathematical meaning, graph representation, graph edits, construction helpers, dependency inspection, delete policy, evaluation, diagnostics, workspace serialization/deserialization, headless viewport math, constrained construction semantics, and the public core API.

It is published internally as `@euclid-forge/core`.

### `apps/forge`

Forge owns the browser/editor shell: canvas rendering, DOM events, commands, modal tools, pointer intent, hover/selection/drag/lasso behavior, history, workspace file actions, print/display presentation, smoke tests, and styling.

Forge imports Core through `@euclid-forge/core` package paths rather than relative paths into `packages/core`.

## Current product posture

The app supports both keyboard-oriented power-user workflows and modal browser/mobile-friendly workflows.

Current user-facing workflows include:

- create, label, drag, hide, delete, save, open, undo, and redo geometry
- create points, segments, lines, circles, triangles, midpoints, centroids, and intersections
- create finite parallel and perpendicular segments using visible constrained endpoints
- lasso-select fully contained visible finite geometry
- use display controls for dark mode, high-contrast white canvas mode, and larger line/label scale
- print the current viewport through a print-specific white-background render path
- use labels with translucent pills for readability over geometry
- view parallel-family chevrons derived from parallel constrained constructions

## Constrained linear constructions

Parallel and perpendicular finite segments use the same core representation:

```text
LINEAR_CONSTRAINED_POINT(reference, anchor, mode, offset)
SEGMENT(anchor, constrainedPoint)
```

where:

```text
mode = "PARALLEL" | "PERPENDICULAR"
```

Dragging the constrained endpoint updates its signed scalar offset through `MOVE_CONSTRAINED_POINT`. This is dynamic construction, not a general constraint solver.

Parallel chevrons are render-derived notation in Forge. They are not graph state.

## Common commands

```bash
npm install
npm run dev
npm run check
npm run check:concise
scripts/checks.sh concise
npm run check:boundaries
npm run check:core
npm run check:forge
npm run smoke
```

`npm run check:concise` or `scripts/checks.sh concise` is the normal patch-loop gate.

## Source review dumps

```bash
scripts/dumps/dump-review.sh > /tmp/euclid-forge-review.txt
scripts/dumps/dump-packets.sh
scripts/dumps/dump-target app-tools > /tmp/app-tools.txt
scripts/dumps/dump-target core-geometry > /tmp/core-geometry.txt
scripts/dumps/dump-target guardrails > /tmp/guardrails.txt
```

## Development posture

The current milestone is:

```text
Ergonomic Geometry Editing, Stable Core Boundary
```

## Recent project state

Recent decisions that should be treated as current context:

- Lasso selection is app-side interaction. It selects fully contained visible selectable geometry; infinite lines are excluded from lasso containment.
- Labels render with translucent label pills for readability over geometry.
- The canvas has dark and high-contrast display modes plus incremental display scale for line/point/label size.
- Print output uses a print-only offscreen render/image path, not the live canvas, with a white-background print theme.
- Curve intersections suppress duplicate derived points when a candidate already coincides with an existing evaluated point.
- Circle-circle branch keys are stable relative to the directed center-to-center axis, not sorted by world coordinates.
- `LINEAR_CONSTRAINED_POINT` is a core constrained visible endpoint for finite parallel and perpendicular segments.
- Dragging a constrained endpoint updates its scalar offset through `MOVE_CONSTRAINED_POINT`; this is not a general constraint solver.
- Parallel chevrons are render-derived notation from transitive parallel families; they are not graph state.
