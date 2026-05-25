# Feature Workflow

This document describes how to add features in the Euclid Forge monorepo without weakening the core/app boundary.

## Default workflow

1. Make the smallest coherent patch.
2. Keep `npm run check:concise` green between patches.
3. Prefer behavior tests before or with implementation.
4. Decide whether the change belongs in `packages/core`, `apps/forge`, or both.
5. Keep `packages/core` headless.
6. Route reusable engine behavior through the core package surface.
7. Update docs when the mental model changes.

Validation command for normal patch loops:

```bash
npm run check:concise
```

Canonical full validation:

```bash
npm run check
```

## Monorepo rule

The repository may be physically unified, but dependency direction is not negotiable.

```txt
apps/forge may import packages/core
packages/core may not import apps/forge
```

When in doubt, ask which side would still make sense outside a browser.

## Choosing the right package

### Put behavior in `packages/core` when it involves

```txt
math
geometry denotation
graph representation
graph edits
construction helpers
free-point planning
evaluation
diagnostics
dependency inspection
delete policy
workspace parsing
workspace serialization
headless fixtures
headless view-state or viewport math
```

### Put behavior in `apps/forge` when it involves

```txt
keyboard shortcuts
pointer gestures
modal tools
DOM events
HTML canvas drawing
file picker/download plumbing
status messages
history grouping
render scheduling
CSS
browser smoke tests
```

### Split the feature when necessary

Many geometry features are naturally split.

Example:

```txt
core:
  define the node, graph dependencies, evaluation, diagnostics, construction helper

forge:
  expose a command or modal tool, decide selection behavior, hit test it, render it
```

Do not move browser concepts into Core just to make a feature easier to wire.

## Headless core workflow

New engine-facing behavior should be available through the headless core surface when it is useful outside the browser editor.

Preferred consumer import from Forge:

```ts
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
  diagnosticsWithCode,
} from "@euclid-forge/core";
```

Subpath imports are acceptable when the app is intentionally consuming a lower-level core capability:

```ts
import { screenToWorld } from "@euclid-forge/core/view/viewport";
```

Avoid relative imports from `apps/forge` into `packages/core`.

## Browser app workflow

The browser app should adapt user intent to headless operations.

Typical app flow:

```txt
DOM event
→ app intent / command / modal tool
→ core graph edit or app view-state update
→ transition result
→ runtime effects/history/render request
```

The app can know about the graph and evaluated geometry. It should not duplicate the core's mathematical rules.

## Adding a new geometry kind

A new geometry kind usually touches these areas:

```txt
packages/core/src/representation/node.ts
packages/core/src/evaluation/evaluated.ts
packages/core/src/geometry/definitions/<kind>.ts
packages/core/src/geometry/geometryRegistry.ts
packages/core/src/representation/constructions.ts, if constructible
packages/core tests and fixtures

apps/forge/src/rendering renderer/theme, if visual
apps/forge/src/interaction hit geometry, if selectable
apps/forge/src/app selection predicates, commands, or modal tools, if user-constructible
apps/forge smoke tests, if browser behavior changes
docs
```

## Modal tool workflow

When adding or changing a modal tool:

```txt
activeTool.ts          tool state, required input counts, status text
activeToolPointer.ts   pointer behavior for the active tool
toolSurface.ts         toolbar exposure
pointerIntent.ts       hit/add/drag intent, if needed
commands.ts            keyboard parity, if needed
smoke tests            browser-level user workflow
```

Keep this split:

```txt
Core decides whether a construction is valid.
Forge decides what a click/tap means in the current active tool.
```

## Geometry definition checklist

### Representation

```txt
What node kind is this?
What graph dependencies does it have?
Does it denote a mathematical object or a UI convenience?
Can it be serialized without app state?
```

### Evaluation

```txt
What evaluated geometry does it produce when defined?
Can it become undefined for some valid graph configurations?
What diagnostic code should be recorded when undefined?
What sourceKind should the evaluated value carry?
Is evaluation deterministic without viewport, pointer, or DOM context?
```

### Construction

```txt
What selected or modal inputs should create it?
Are those inputs constructible points, constructible curves, or editable free points?
Does construction need to avoid duplicates?
Does construction belong in Core, app, or both?
```

### Rendering

```txt
Does it render?
Which render layer?
How does it draw?
How is selected/hovered state made visible?
Can the renderer consume only evaluated geometry and render options?
```

### Interaction

```txt
Is it hittable/selectable?
Which hit class?
What geometric hit test applies?
How does z-order affect selection?
Does it need browser pixels, or can it use viewport math from Core?
```

### Body drag

Only add body-drag metadata when translation of declared free source points preserves the represented shape.

Good examples:

```txt
triangle → its three free vertices
circle   → its free center and through points
line     → its two free defining points, when both are free
```

Bad examples without more design:

```txt
centroid alone
midpoint alone
intersection point alone
a shape with constrained source points
```

## Boundary-check workflow

Before or with a monorepo cleanup, make sure `scripts/check-boundaries.mjs` rejects at least these cases:

```txt
packages/core importing apps/forge
packages/core importing rendering, interaction, app, or styles
packages/core referencing document/window/HTMLElement/HTMLCanvasElement/CanvasRenderingContext2D
apps/forge importing packages/core by relative filesystem path
```

A temporary migration script is fine for mechanical rewrites, but the final state should be enforced by checks.

## Review checklist

Before merging, ask:

```txt
Did Core stay headless?
Did Forge remain a consumer of Core?
Are imports package-shaped instead of fragile relative cross-package paths?
Did tests cover behavior at the layer that owns it?
Did smoke coverage change when browser behavior changed?
Did docs change if the seam changed?
```

## Good cleanup patches

Good cleanup patches are small and enforce a seam:

```txt
move browser-only helpers out of Core
move math/evaluation helpers out of Forge
centralize Core exports
tighten boundary checks
rename aliases that obscure constructible vs editable points
move rendering constants into theme
extract app transition helpers
extract app command helpers that are growing too large
consolidate source dump entrypoints
```

Avoid cleanup patches that mix large file moves, behavior changes, and new features unless there is no practical alternative.

