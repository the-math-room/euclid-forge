# Euclid Core

This workspace contains the headless geometry engine for Euclid Forge.

It owns:

- geometric meaning
- graph representation
- construction factories
- graph edits
- evaluation
- diagnostics
- dependency inspection
- workspace serialization/deserialization
- public core API

It must not depend on the forge app, DOM, canvas, or browser APIs.

## Commands

From the repository root:

```bash
npm run check -w @euclid-forge/core
```

Or through the root alias:

```bash
npm run check:core
```

## Public API

The package name is:

```text
@euclid-forge/core
```

Forge should import core through package paths, not through relative paths into this workspace.
