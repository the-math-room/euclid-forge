# Core Import Audit Notes

## Goal

Audit how `apps/forge` imports from `@euclid-forge/core` and keep the app dependency on Core intentional.

The monorepo keeps Core and Forge in one repository, but it does not make Core internals fair game. Forge should depend on stable Core entrypoints rather than on Core's incidental file layout.

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

Geometry definitions and the registry are closer to Core internals than ordinary app API. Forge should avoid depending on them directly.

## Why not immediately ban deep imports?

A hard ban before the audit would create churn without improving design. The better sequence is:

1. Audit current imports.
2. Decide which import families are intentionally public.
3. Expand the root facade where useful.
4. Migrate noisy app imports.
5. Tighten the boundary checker.

## Useful commands

Verbose audit:

```bash
npm run audit:core-imports
```

Quiet audit for routine checks:

```bash
npm run audit:core-imports:quiet
```

Normal patch-loop check:

```bash
npm run check:concise
```

## Success criteria

- `npm run audit:core-imports` gives a useful report.
- `npm run audit:core-imports:quiet` is readable in routine check output.
- No Forge imports use discouraged Core internals.
- Public API docs match actual package exports.
- Boundary checks remain green.
- App behavior is unchanged.

## Design target

The target is not necessarily "all imports from the root." The target is:

```text
Every Forge import from Core should be intentional, documented, and stable.
```

A good final state may still have a few family subpaths, such as `@euclid-forge/core/view/viewport`, if they make the app clearer without exposing implementation details.

