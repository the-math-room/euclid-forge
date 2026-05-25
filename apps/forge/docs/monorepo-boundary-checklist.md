# Monorepo Boundary Checklist

This checklist is for the transition from a split package/repo shape back to a monorepo.

## Goal

Bring core back into the same repository while preserving the important dependency direction:

```txt
packages/core  ← consumed by ←  apps/forge
```

Core must remain headless.

## Target layout

```txt
packages/
  core/
    src/
      meaning/
      representation/
      evaluation/
      geometry/
      core/
      view/

apps/
  forge/
    src/
      app/
      interaction/
      rendering/
      styles/
```

## Required checks

`npm run check` should fail if any of the following happen:

```txt
packages/core imports apps/forge
packages/core imports forge app modules
packages/core imports forge rendering modules
packages/core imports forge interaction modules
packages/core imports forge styles
packages/core directly references browser globals
apps/forge imports packages/core through relative filesystem paths
```

## Browser globals to guard against in core

```txt
window
document
HTMLElement
HTMLCanvasElement
CanvasRenderingContext2D
PointerEvent
KeyboardEvent
MouseEvent
requestAnimationFrame
devicePixelRatio
Blob
File
URL.createObjectURL
```

Some names may appear in comments or tests during migration. Prefer a clear allowlist for tests over weakening the production boundary.

## Import guidance

Preferred forge import:

```ts
import { evaluateGraph } from "@euclid-forge/core/evaluation/evaluateGraph";
```

Discouraged forge import:

```ts
import { evaluateGraph } from "../../../packages/core/src/evaluation/evaluateGraph";
```

Forbidden core import:

```ts
import { renderScene } from "../../../apps/forge/src/rendering/renderScene";
```

## Migration order

1. Move app code under `apps/forge` without changing behavior.
2. Move core code under `packages/core` without changing behavior.
3. Preserve `@euclid-forge/core` imports through package names or TypeScript paths.
4. Update TypeScript project references.
5. Update `scripts/check-boundaries.mjs`.
6. Run typecheck and unit tests.
7. Run smoke tests.
8. Update docs.

## Review rule

A feature may touch both core and forge, but each side should remain honest:

```txt
core decides what geometry means
forge decides how users see and manipulate it
```
