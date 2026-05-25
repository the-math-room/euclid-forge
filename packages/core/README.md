# Euclid Core

This workspace contains the headless geometry engine for Euclid Forge.

It owns:

- geometric meaning
- graph representation
- construction factories
- graph edits
- free-point planning
- cascading delete policy
- evaluation
- diagnostics
- dependency inspection
- workspace serialization/deserialization
- headless viewport and view-state math
- public core API

It must not depend on the forge app, DOM, canvas, browser APIs, CSS, app commands, or editor gestures.

## Package name

The package name is:

```text
@euclid-forge/core
```

Forge should import Core through package paths, not through relative paths into this workspace.

## Commands

From the repository root:

```bash
npm run check -w @euclid-forge/core
```

Or through the root alias:

```bash
npm run check:core
```

The normal monorepo patch-loop check is:

```bash
npm run check:concise
```

## Public API

The root facade is:

```ts
import { createGeometryEngine, applyGraphEdit } from "@euclid-forge/core";
```

The root facade currently exports the app-facing engine, graph, construction, evaluation, edit, dependency, delete-policy, workspace, diagnostic, viewport, and meaning helpers.

Approved public family subpaths remain available during the facade tuning period:

```text
@euclid-forge/core/core/*
@euclid-forge/core/view/*
@euclid-forge/core/meaning/*
@euclid-forge/core/representation/*
@euclid-forge/core/evaluation/*
```

Geometry internals are exported for package mechanics, but Forge should avoid importing `@euclid-forge/core/geometry/*` unless the dependency is deliberate and documented.

## Current app-facing invariants

Core owns several invariants that Forge relies on:

- graph nodes are topologically ordered by `createGraph`
- graph edits are immutable
- free-point IDs are planned deterministically through `planFreePoint`
- deleting nodes cascades through transitive dependents
- evaluation is deterministic from graph state
- undefined geometry is reported through diagnostics rather than browser state
- viewport math is pure coordinate-system math, not rendering

## Source review dumps

For Core-focused review from the monorepo root:

```bash
scripts/dumps/dump-target core-geometry > /tmp/core-geometry.txt
scripts/dumps/dump-target core-api > /tmp/core-api.txt
```

The legacy package-local dump script now delegates to the root target:

```bash
packages/core/scripts/dump-source.sh
```
