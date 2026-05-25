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

## Root facade expectations

The root facade should expose ordinary app-facing capabilities, including graph creation/editing, node factories/types, construction helpers, free-point planning, dependency inspection, delete policy, evaluation/diagnostics, workspace parsing/serialization, viewport/view-state helpers, and stable meaning helpers used by Forge.

Recent app-facing core additions such as `PARALLEL_POINT`, `parallelPointNode`, `parallelSegmentConstruction`, and `MOVE_CONSTRAINED_POINT` should be available through the root facade if Forge needs them.

## Useful commands

```bash
npm run audit:core-imports
npm run audit:core-imports:quiet
scripts/checks.sh concise
```

## Design target

Every Forge import from Core should be intentional, documented, and stable.
