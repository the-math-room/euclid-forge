# Core Public API

## Purpose

This document defines the intended public import surface between the Forge app and the headless Core package.

## Boundary rule

```text
apps/forge may import packages/core
packages/core must never import apps/forge
packages/core must not depend on DOM, canvas, browser APIs, CSS, app commands, rendering notation, or editor gestures
```

## Import posture

Prefer the root facade for ordinary app-facing use:

```ts
import { evaluateGraph, applyGraphEdit } from "@euclid-forge/core";
```

Use approved subpath imports only when they represent a stable, intentional API family.

## Approved public surfaces

### Root facade

`@euclid-forge/core` should cover graph creation and edits, node factories and node types, construction helpers, free-point planning, dependency inspection, delete policy, evaluation/diagnostics, workspace serialization, viewport/view-state helpers, engine facade, and stable meaning helpers used by Forge.

Recent app-facing root exports should include constrained parallel helpers such as:

```text
ParallelPointNode
parallelPointNode
parallelSegmentConstruction
MOVE_CONSTRAINED_POINT via GraphEdit
```

### Stable family subpaths

```text
@euclid-forge/core/core
@euclid-forge/core/core/*
@euclid-forge/core/view/*
@euclid-forge/core/meaning/*
@euclid-forge/core/representation/*
@euclid-forge/core/evaluation/*
```

### Internal-by-default surface

```text
@euclid-forge/core/geometry/*
```

Forge should not depend on geometry internals unless the dependency is deliberate and documented.

## Examples

```ts
import { applyGraphEdit, parallelSegmentConstruction } from "@euclid-forge/core";

const nodes = parallelSegmentConstruction(graph, "AB", "C");
const nextGraph = applyGraphEdit(graph, { kind: "ADD_NODES", nodes });
```

```ts
const nextGraph = applyGraphEdit(graph, {
  kind: "MOVE_CONSTRAINED_POINT",
  id: "PP_AB_C",
  point: { x: 4, y: 1 },
});
```
