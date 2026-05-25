# Core Import Audit Notes

## Goal

Before adding more geometry features, audit how `apps/forge` imports from `@euclid-forge/core`.

The app currently benefits from deep imports because Core was split into a separate package. In the monorepo, those imports still work, but we should decide which paths are public API and which are accidental coupling.

## What to look for

For every import from `@euclid-forge/core` in Forge, classify it as one of:

```text
root       = imported from @euclid-forge/core
approved   = imported from an intentionally public Core family path
discouraged = imported from a Core implementation/internal path
```

## Initial policy

Approved for now:

```text
@euclid-forge/core
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

## Why not immediately ban deep imports?

A hard ban before the audit would create churn without improving design. The better sequence is:

1. Audit current imports.
2. Decide which import families are intentionally public.
3. Expand the root facade where useful.
4. Migrate noisy app imports.
5. Tighten the boundary checker.

## Success criteria

- `npm run audit:core-imports` prints a short report.
- No Forge imports use discouraged Core internals.
- Public API docs match actual package exports.
- Boundary checks remain green.
- App behavior is unchanged.
