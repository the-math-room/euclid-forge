# Core Public API

## Purpose

This document defines the intended public import surface between the Forge app and the headless Core package.

The monorepo keeps `packages/core` and `apps/forge` in the same repository, but it does not make Core internals fair game. Forge should depend on stable Core entrypoints rather than on Core's incidental file layout.

## Boundary rule

```text
apps/forge may import packages/core
packages/core must never import apps/forge
packages/core must not depend on DOM, canvas, browser APIs, CSS, app commands, or editor gestures
```

## Import posture

Prefer the root facade for ordinary app-facing use:

```ts
import { evaluateGraph, applyGraphEdit } from "@euclid-forge/core";
```

Use approved subpath imports only when they represent a stable, intentional API family:

```ts
import { screenToWorld } from "@euclid-forge/core/view/viewport";
```

Avoid deep imports that couple Forge to Core implementation layout unless they are explicitly listed as tolerated during migration.

## Approved public surfaces

### Root facade

`@euclid-forge/core`

This should cover the most common app-facing API:

- graph creation and edits
- node factories and node types
- construction helpers
- free-point planning
- dependency inspection
- cascading delete policy
- evaluation and diagnostics
- workspace serialization/deserialization
- viewport/view-state helpers
- engine facade
- stable meaning helpers used by Forge

### Stable family subpaths

These are acceptable while the public facade is being tuned:

```text
@euclid-forge/core/core
@euclid-forge/core/core/*
@euclid-forge/core/view/*
@euclid-forge/core/meaning/*
@euclid-forge/core/representation/*
@euclid-forge/core/evaluation/*
```

These subpaths are currently exported by the Core package and used by Forge. They should be treated as provisionally public until the audit decides whether each should remain public or fold into the root facade.

### Internal-by-default surface

```text
@euclid-forge/core/geometry/*
```

The geometry registry and definitions are powerful extension points, but they are closer to Core internals than ordinary app API. Forge should not depend on them unless the dependency is deliberate and documented.

## App-facing examples

Create and evaluate an engine:

```ts
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
} from "@euclid-forge/core";

const workspace = geometryWorkspaceFromJsonText(jsonText);
const engine = createGeometryEngine(workspace);
const evaluated = engine.evaluate();
```

Apply an immutable edit:

```ts
const next = engine.applyEdit({
  kind: "MOVE_FREE_POINT",
  id: "P1",
  point: { x: 1, y: 2 },
});
```

Plan a free point when the caller needs the generated id before applying the graph edit:

```ts
import { applyGraphEdit, planFreePoint } from "@euclid-forge/core";

const planned = planFreePoint(graph, { x: 2, y: 3 });
const nextGraph = applyGraphEdit(graph, {
  kind: "ADD_NODES",
  nodes: [planned.node],
});
```

Delete selected nodes and their dependents:

```ts
import { applyGraphEdit, cascadingDeleteIds } from "@euclid-forge/core";

const idsToDelete = cascadingDeleteIds(graph, selectedIds);
const nextGraph = applyGraphEdit(graph, {
  kind: "DELETE_NODES",
  ids: [...idsToDelete],
});
```

## Audit process

Run:

```bash
npm run audit:core-imports
```

The audit classifies Forge imports from Core into:

- root facade imports
- approved family subpath imports
- discouraged/internal imports
- unknown imports

Routine check output can use the quiet form:

```bash
npm run audit:core-imports:quiet
```

## Migration target

The target is not necessarily "all imports from the root." The target is:

```text
Every Forge import from Core should be intentional, documented, and stable.
```

A good final state may still have a few family subpaths if they make the app clearer without exposing implementation details.

