# Core Import Audit Notes

## Goal

Audit how `apps/forge` imports from `@euclid-forge/core` and keep the app dependency on Core intentional.

## What to look for

For every import from `@euclid-forge/core` in Forge, classify it as one of:

```text
root        = imported from @euclid-forge/core
approved    = imported from an intentionally public Core family path
discouraged = imported from a Core implementation/internal path
unknown     = imported from an unclassified package path
```

## Current policy

Preferred:

```text
@euclid-forge/core
```

Approved public family subpaths:

```text
@euclid-forge/core/core
@euclid-forge/core/core/*
@euclid-forge/core/view/*
@euclid-forge/core/meaning/*
@euclid-forge/core/representation/*
@euclid-forge/core/evaluation/*
```

Discouraged for Forge unless explicitly justified:

```text
@euclid-forge/core/geometry/*
```

Forge should generally use the root facade for app-facing constrained construction helpers such as `linearConstrainedPointNode`, `parallelSegmentConstruction`, `perpendicularSegmentConstruction`, and `MOVE_CONSTRAINED_POINT` via `GraphEdit`.

## Root facade expectations

The root facade should expose ordinary app-facing capabilities, including graph creation/editing, node factories/types, construction helpers, free-point planning, dependency inspection, delete policy, evaluation/diagnostics, workspace parsing/serialization, viewport/view-state helpers, and stable meaning helpers used by Forge.

App-facing constrained-linear exports should include:

```text
LinearConstrainedPointNode
LinearConstraintMode
linearConstrainedPointNode
parallelSegmentConstruction
perpendicularSegmentConstruction
MOVE_CONSTRAINED_POINT via GraphEdit
```

## Useful commands

```bash
npm run audit:core-imports
npm run audit:core-imports:quiet
npm run check:concise
scripts/checks.sh concise
```

## Design target

Every Forge import from Core should be intentional, documented, and stable.
