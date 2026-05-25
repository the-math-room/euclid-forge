# Euclid Core

Headless geometry engine for Euclid Forge.

This package owns the semantic model, graph representation, evaluation pipeline, geometry registry, workspace serialization, diagnostics, fixtures, and view-space math used by the Euclid Forge editor.

It deliberately does **not** contain browser UI, DOM code, Canvas rendering, pointer interaction, CSS, Playwright smoke tests, or editor commands.

## Checks

```sh
npm run check
```

`npm run check` should typecheck the package and run the core test suite.

## Package layers

- `src/meaning`: mathematical primitives and denotations.
- `src/view`: viewport, screen, and world coordinate transforms.
- `src/representation`: graph nodes, edits, dependencies, constructions, and delete policy.
- `src/evaluation`: graph-to-scene evaluation and diagnostics.
- `src/geometry`: geometry definitions and registry.
- `src/core`: public package facade, workspace API, diagnostics, fixtures, and smoke-level core API tests.

## Relationship to Euclid Forge

`euclid-core` is the source of truth for headless geometry behavior. The `euclid-forge` repository consumes this package and owns the editor-specific layers:

- app/runtime/controller state
- rendering
- pointer interaction and hit testing
- styles
- browser workspace file handling
- Playwright smoke tests

Core features should be developed here first, then adapted in Forge once the headless API is stable.
