# Public API

Euclid Core exposes a root package API and selected subpath APIs.

Consumers should prefer the smallest stable import surface that matches their need.

## Root API

Use the root package for high-level workspace and core facade operations:

```ts
import {
  deserializeWorkspace,
  geometryWorkspaceFromJsonText,
  parseSerializedWorkspace,
  serializeWorkspace,
} from "@euclid-forge/core";
```

The root API is the most stable surface for consumers that do not need low-level graph or evaluation details.

## Subpath APIs

Forge and other advanced consumers may use subpaths for adapter work.

Common subpaths:

```ts
import { evaluateGraph } from "@euclid-forge/core/evaluation/evaluateGraph";
import type { EvaluatedGeometry } from "@euclid-forge/core/evaluation/evaluated";

import { vec2 } from "@euclid-forge/core/meaning/vec2";

import { createGraph } from "@euclid-forge/core/representation/graph";
import { applyGraphEdit } from "@euclid-forge/core/representation/edit";
import type {
  GeometryNode,
  NodeId,
} from "@euclid-forge/core/representation/node";

import { screenToWorld, worldToScreen } from "@euclid-forge/core/view/viewport";
import type { ScreenPoint, Viewport } from "@euclid-forge/core/view/viewport";
```

## Import guidance

Preferred:

```text
@euclid-forge/core
@euclid-forge/core/view/viewport
@euclid-forge/core/meaning/vec2
@euclid-forge/core/representation/node
@euclid-forge/core/representation/graph
@euclid-forge/core/evaluation/evaluateGraph
```

Avoid adding new package subpaths casually. If a consumer needs a new subpath, first decide whether that symbol is truly part of the supported headless API.

## Compatibility policy

During early extraction, subpath APIs may still evolve. When changing exported shapes, update:

- package exports
- root facade exports when applicable
- tests that exercise public imports
- Forge adapter imports
- these docs
