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

The core package owns geometry meaning, representation, graph edits, evaluation, constructions, diagnostics, workspace serialization, view math, and the public core API.

It is published internally as:

```text
@euclid-forge/core
```

### `apps/forge`

The forge app owns the browser shell: canvas rendering, DOM events, commands, pointer intent, selection and hover behavior, history, workspace file actions, smoke tests, and styling.

Forge imports core through `@euclid-forge/core` package paths rather than relative paths into `packages/core`.

## Common commands

From the repository root:

```bash
npm install
npm run dev
npm run check
```

Useful focused checks:

```bash
npm run check:boundaries
npm run check:core
npm run check:forge
npm run smoke
```

## Boundary checks

The root boundary checker enforces the project direction:

- core must not import forge
- core must not use DOM/canvas/browser globals
- forge app layers should not cross sideways in accidental ways
- shared test helpers should live outside production rendering/interaction layers

Run it with:

```bash
npm run check:boundaries
```

## Browser sanity

The forge app starts with a deterministic sanity scene. The canonical `A/B/C` fixture is preserved for smoke tests, while additional surrounding geometry exercises lines, circles, intersections, z-order, derived points, and overlapping body hit testing.

The app also shows a runtime build/load indicator so it is easy to tell whether the page actually reloaded or whether the browser is showing a stale bundle.

## Development posture

The current milestone is:

```text
Monorepo Skeleton, Same Behavior
```

During this milestone, prefer behavior-preserving structural cleanup over new features. The goal is to make the monorepo feel native, keep checks green, and preserve the hard core/forge boundary before resuming geometry feature work.
