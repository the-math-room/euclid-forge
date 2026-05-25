# Boundaries

Euclid Core is a headless package. Its boundaries are part of the architecture.

## Allowed in core

Core may contain:

- pure TypeScript
- math and geometry denotations
- immutable graph operations
- graph dependency analysis
- graph edits and construction helpers
- evaluation and diagnostics
- workspace serialization
- fixture running
- viewport/screen/world coordinate transforms
- tests for all of the above

## Forbidden in core

Core must not contain:

- DOM APIs
- `CanvasRenderingContext2D`
- browser event handling
- pointer events
- React or UI components
- CSS
- rendering themes
- app controller/runtime state
- editor commands
- Playwright smoke tests
- Vite application code

## Adapter-owned concerns

Euclid Forge owns:

- app state and runtime orchestration
- commands and keyboard shortcuts
- pointer intent and hit testing
- Canvas rendering
- themes and visual styling
- browser workspace file download/upload
- smoke tests
- GitHub Pages deployment

## Dependency direction

Forge depends on Core.

Core must not depend on Forge.

```text
euclid-core  ←  euclid-forge
```

Inside Core, lower semantic layers should not depend on adapter concerns. In particular, geometry definitions should not import rendering or interaction modules.

## Boundary smell checklist

A change probably does not belong in core if it mentions:

- `document`
- `window`
- `HTMLElement`
- `PointerEvent`
- `KeyboardEvent`
- `CanvasRenderingContext2D`
- color tokens
- stroke width
- hover
- selection rendering
- command shortcuts

If a feature needs those things, add the semantic part in `euclid-core` first, then adapt it in `euclid-forge`.
