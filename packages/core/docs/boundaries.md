# Boundaries

Euclid Core is a headless package. Its boundaries are part of the architecture.

## Allowed in Core

Core may contain:

- pure TypeScript
- math and geometry denotations
- immutable graph operations
- graph dependency analysis
- graph edits and construction helpers
- free-point planning
- cascading delete policy
- evaluation and diagnostics
- workspace serialization
- fixture running
- viewport/screen/world coordinate transforms
- tests for all of the above

## Forbidden in Core

Core must not contain:

- DOM APIs
- `CanvasRenderingContext2D`
- browser event handling
- pointer events
- keyboard events
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
- modal tool state
- pointer intent and hit testing
- Canvas rendering
- themes and visual styling
- browser workspace file download/upload
- status messages and pointer capture effects
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

A change probably does not belong in Core if it mentions:

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
- toolbar labels
- status messages
- browser file dialogs

If a feature needs those things, add the semantic part in `packages/core` first, then adapt it in `apps/forge`.

## Examples

Core-owned:

```text
Given a graph and coordinates, what is the next free-point node/id?
Given a graph and selected node ids, which dependents are deleted too?
Given a graph, what evaluated geometry and diagnostics result?
```

Forge-owned:

```text
A tap in Segment mode should create a free point and use it as input.
A Delete tool click should delete the clicked geometry.
A toolbar button should show selected/pressed state.
A status message should be announced through aria-live.
```

## Checks

Run the boundary checker from the monorepo root:

```bash
npm run check:boundaries
```

Run the normal patch-loop gate:

```bash
npm run check:concise
```
