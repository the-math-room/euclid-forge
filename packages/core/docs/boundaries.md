# Boundaries

Euclid Core is a headless package. Its boundaries are part of the architecture.

## Allowed in Core

Core may contain pure TypeScript, math and geometry denotations, immutable graph operations, graph dependency analysis, graph edits and construction helpers, constrained construction nodes and movement edits, free-point planning, cascading delete policy, evaluation and diagnostics, workspace serialization, fixture running, viewport/screen/world coordinate transforms, and tests for all of the above.

## Forbidden in Core

Core must not contain browser or DOM APIs such as `window`, `document`, `HTMLElement`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, `OffscreenCanvas`, `Path2D`, `DOMRect`, pointer/keyboard/mouse events, browser file APIs, object URLs, storage APIs, observers, or animation-frame APIs.

Core also must not contain Forge presentation or adapter concepts such as rendering themes, `RenderTheme`, label pills, parallel marks/chevrons, toolbar behavior, pointer capture, print-image generation, display theme controls, app controller/runtime state, editor commands, smoke tests, Vite application code, or browser UI workflows.

## Adapter-owned concerns

Euclid Forge owns app runtime orchestration, commands and keyboard shortcuts, modal tool state, pointer intent and hit testing, canvas rendering, themes and visual styling, browser workspace file actions, print-surface image generation, display controls, status messages, pointer capture effects, smoke tests, and deploy plumbing.

## Dependency direction

```text
euclid-core  ←  euclid-forge
```

Core must not depend on Forge.

## Checks

```bash
npm run check:boundaries
scripts/checks.sh concise
```
