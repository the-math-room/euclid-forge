# Monorepo Boundary Checklist

This checklist is for preserving the important dependency direction in the monorepo.

## Goal

Keep Core and Forge in one repository while preserving the architectural direction:

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

## Browser globals to guard against in Core

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

Some names may appear in tests during migration. Prefer a clear allowlist for tests over weakening the production boundary.

## Import guidance

Preferred Forge import:

```ts
import { evaluateGraph, applyGraphEdit } from "@euclid-forge/core";
```

Acceptable public family import when deliberate:

```ts
import { screenToWorld } from "@euclid-forge/core/view/viewport";
```

Discouraged Forge import:

```ts
import { evaluateGraph } from "../../../packages/core/src/evaluation/evaluateGraph";
```

Forbidden Core import:

```ts
import { renderScene } from "../../../apps/forge/src/rendering/renderScene";
```

## Current hygiene commands

Routine patch-loop gate:

```bash
npm run check:concise
```

Boundary-only check:

```bash
npm run check:boundaries
```

Core import audit:

```bash
npm run audit:core-imports
npm run audit:core-imports:quiet
```

## Source review dump workflow

Use the current source-review dump system rather than legacy ad hoc dumps:

```bash
scripts/dumps/dump-review.sh > /tmp/euclid-forge-review.txt
scripts/dumps/dump-packets.sh
scripts/dumps/dump-target app-tools > /tmp/app-tools.txt
```

Legacy dump entrypoints should delegate to the new dump targets.

## Review rule

A feature may touch both Core and Forge, but each side should remain honest:

```txt
Core decides what geometry means.
Forge decides how users see and manipulate it.
```

Browser ergonomics can depend on Core invariants, but Core must not depend on browser ergonomics.

