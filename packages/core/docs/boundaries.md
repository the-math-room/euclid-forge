# Boundaries

Euclid Core is a headless package. Its boundaries are part of the architecture.

## Allowed in Core

Core may contain pure TypeScript, math and geometry denotations, immutable graph operations, graph dependency analysis, graph edits and construction helpers, constrained construction nodes and movement edits, free-point planning, cascading delete policy, evaluation and diagnostics, workspace serialization, fixture running, viewport/screen/world coordinate transforms, and tests for all of the above.

## Forbidden in Core

Core must not contain DOM APIs, `CanvasRenderingContext2D`, browser event handling, pointer events, keyboard events, React/UI components, CSS, rendering themes, label pills, parallel chevron drawing, print-image generation, display theme controls, app controller/runtime state, editor commands, smoke tests, or Vite application code.

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
