# Monorepo Boundary Checklist

## Goal

Keep Core and Forge in one repository while preserving the architectural direction:

```txt
packages/core  ← consumed by ←  apps/forge
```

Core must remain headless.

## Required checks

`npm run check` should fail if:

```txt
packages/core imports apps/forge
packages/core imports forge app/rendering/interaction/styles modules
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

## Import guidance

Preferred Forge import:

```ts
import { evaluateGraph, applyGraphEdit } from "@euclid-forge/core";
```

Acceptable public family import when deliberate:

```ts
import { screenToWorld } from "@euclid-forge/core/view/viewport";
```

Forbidden Core import:

```ts
import { renderScene } from "../../../apps/forge/src/rendering/renderScene";
```

## Hygiene commands

```bash
scripts/checks.sh concise
npm run check:boundaries
npm run audit:core-imports
npm run audit:core-imports:quiet
```

## Review rule

Core decides what geometry means. Forge decides how users see and manipulate it.

Rendering notation such as label pills, lasso overlays, high-contrast themes, display scale, print themes, and parallel chevrons belongs in Forge. The geometry relationship that supports the notation may belong in Core.
