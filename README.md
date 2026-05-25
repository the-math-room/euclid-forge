# Euclid Forge

Euclid Forge is a monorepo for a browser-based Euclidean construction editor and its headless geometry engine.

The project is intentionally split into two conceptual parts:

```text
packages/core = headless geometry engine
apps/forge    = browser/editor application
```

The monorepo makes cross-cutting development easier, but the dependency direction remains strict:

```text
forge may import core
core must never import forge
core must not depend on DOM, canvas, or browser APIs
```

## Workspaces

### `packages/core`

The core package owns geometry meaning, graph representation, graph edits, construction factories, dependency inspection, delete policy, evaluation, diagnostics, workspace serialization, headless viewport math, and the public core API.

It is published internally as:

```text
@euclid-forge/core
```

### `apps/forge`

The forge app owns the browser/editor shell: canvas rendering, DOM events, commands, pointer intent, modal tools, selection and hover behavior, history, workspace file actions, smoke tests, and styling.

Forge imports core through `@euclid-forge/core` package paths rather than relative paths into `packages/core`.

## Current product posture

The app now supports both power-user keyboard workflows and modal browser/mobile-friendly workflows.

Core user-facing workflows include:

- click or tap empty canvas to create free points
- use modal tools for point, segment, circle, triangle, and delete actions
- create shape inputs with ordinary clicks/taps rather than Shift-select
- use legacy Shift-select plus keyboard commands for faster desktop workflows
- delete geometry with cascading dependent deletion
- undo/redo graph and view-state changes through the app history model

The current architectural posture is:

```text
Core owns math/graph invariants.
Forge owns browser gestures and visual interaction.
```

For example, Core owns free-point ID planning and cascading delete semantics. Forge decides when a click should create a point, select a thing, drag a thing, or invoke a modal tool.

## Common commands

From the repository root:

```bash
npm install
npm run dev
npm run check
```

Useful focused checks:

```bash
npm run check:concise
npm run check:boundaries
npm run check:core
npm run check:forge
npm run smoke
```

`npm run check:concise` is the normal patch-loop gate. It runs boundary checks, the quiet core-import audit, core/forge typechecks, unit tests with concise reporting, and browser smoke tests.

`npm run check` remains the canonical full gate before commit/push when CI-like confidence matters.

## Boundary checks

The root boundary checker enforces the project direction:

- core must not import forge
- core must not use DOM/canvas/browser globals
- forge should not import core through relative filesystem paths
- local app layers should not cross sideways in accidental ways
- shared test helpers should live outside production rendering/interaction layers

Run it with:

```bash
npm run check:boundaries
```

The core import audit reports whether Forge imports Core through the root facade, approved public subpaths, or discouraged/internal paths:

```bash
npm run audit:core-imports
npm run audit:core-imports:quiet
```

## Source review dumps

The current source-dump workflow is under:

```text
scripts/dumps/
```

Use the full story-ordered review dump for broad review:

```bash
scripts/dumps/dump-review.sh > /tmp/euclid-forge-review.txt
```

Use packet dumps when a structured archive is easier to inspect:

```bash
scripts/dumps/dump-packets.sh
```

Use targeted dumps when reviewing a specific seam:

```bash
scripts/dumps/dump-target app-tools > /tmp/app-tools.txt
scripts/dumps/dump-target core-geometry > /tmp/core-geometry.txt
scripts/dumps/dump-target guardrails > /tmp/guardrails.txt
```

The default review dump intentionally excludes tests, smoke specs, fixture data, lockfiles, dependency metadata, and command output. Those are available through explicit targets.

## Browser sanity

The forge app starts with a deterministic sanity scene. The canonical `A/B/C` fixture is preserved for smoke tests, while additional surrounding geometry exercises lines, circles, intersections, z-order, derived points, and overlapping body hit testing.

The app also shows a runtime build/load indicator so it is easy to tell whether the page actually reloaded or whether the browser is showing a stale bundle.

## Development posture

The current milestone is:

```text
Ergonomic Geometry Editing, Stable Core Boundary
```

During this milestone, prefer small patches that keep behavior green while strengthening seams. Core should continue to own headless geometry invariants. Forge should continue to adapt those invariants to browser input, rendering, and app workflow.

