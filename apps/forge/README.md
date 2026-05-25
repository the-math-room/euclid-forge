# Euclid Forge

Euclid Forge is an experimental 2D geometry construction editor with a headless geometry core and a browser-based forge/editor application.

The project is moving back into a monorepo, but it keeps one architectural rule as non-negotiable:

```txt
packages/core  → headless geometry engine
apps/forge     → browser/editor application

apps/forge may depend on packages/core.
packages/core must not depend on apps/forge.
```

The monorepo should make coordinated work easier without weakening the boundary. Core remains reusable, deterministic, and free of browser or rendering concerns. Forge adapts core geometry into interaction, rendering, history, workspace file I/O, and DOM behavior.

## Current capabilities

- Add and drag free points.
- Shift-click to select points, segments, lines, circles, triangles, and derived points.
- Join selected constructible points with `J`: two points create a segment; three points create a triangle.
- Construct lines with `L` from two selected constructible points.
- Construct circles with `C` from center and through points.
- Construct intersections with `I` from selected curve nodes.
- Construct centroids with `G` and triangle side midpoints with `M`.
- Use derived points as downstream construction inputs, including midpoints, centroids, segment intersections, and curve intersections.
- Drag eligible area bodies such as triangles and circles when their definitions expose free source points.
- Hide, unhide, delete, save, open, undo, redo, pan, zoom, rotate, and reorder geometry.

## Controls

| Action | Shortcut / Gesture |
| --- | --- |
| Add point | Click empty canvas |
| Move free point | Drag point |
| Move draggable area body | Drag triangle/circle body |
| Select / toggle selection | Shift-click geometry |
| Join selected constructible points | `J` |
| Line through two selected points | `L` |
| Circle from center/through points | `C` |
| Intersection from two selected curves | `I` |
| Centroid of selected triangle | `G` |
| Side midpoints of selected triangle | `M` |
| Delete selected nodes | `Delete` / `Backspace` |
| Hide selected nodes | `H` |
| Unhide all hidden nodes | `U` |
| Bring selected forward/backward | `PageUp` / `PageDown` |
| Bring selected to front/back | `Shift+PageUp` / `Shift+PageDown` |
| Pan viewport | Arrow keys |
| Zoom viewport | `+` / `-` |
| Rotate viewport | `[` / `]` |
| Reset viewport rotation | `\` |
| Reset viewport | `0` |
| Save workspace | `Ctrl/Cmd+S` |
| Open workspace | `Ctrl/Cmd+O` |
| Undo / redo | `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y` |

`J` is the boundary-construction command. With two selected constructible points it creates a segment; with three selected constructible points it creates a triangle. `C` stays separate because its two selected points mean center and through point rather than unordered endpoints.

`I` creates intersections from selected curve nodes. Segment + segment creates the bounded segment-intersection point. Segment + circle and circle + circle create branch-specific curve-intersection points for each currently defined candidate.

Triangle borders are not segment nodes unless explicit segments have been constructed.

## Repository layout

The target monorepo layout is:

```txt
packages/
  core/
    src/
      meaning/
      representation/
      evaluation/
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

During migration, some files may still live in the legacy single-app layout. Boundary checks should support both shapes while enforcing the same direction: core must not import forge, app, interaction, rendering, styles, DOM, canvas, or browser globals.

## Architecture

Core owns the denotational geometry model:

```txt
graph syntax → mathematical denotation → evaluated scene
```

Forge owns browser/editor concerns:

```txt
DOM input + AppState → AppTransition → runtime effects/history/render
```

Important local seams in forge:

- `app/` owns application state, commands, pointer intent, history, workspace file effects, DOM bindings, status effects, and render scheduling.
- `interaction/` owns pure hit testing over evaluated geometry and graph metadata.
- `rendering/` owns canvas drawing from evaluated geometry.
- `styles/` owns browser presentation.

Core should never need to know that forge, the DOM, or canvas rendering exists.

## Boundary contract

These rules are intended to be enforced by `scripts/check-boundaries.mjs` and by TypeScript project/package boundaries.

- `packages/core` must not import from `apps/forge`.
- `packages/core` must not import from forge-local directories such as `app`, `interaction`, `rendering`, or `styles`.
- `packages/core` must not use DOM/browser globals such as `window`, `document`, `HTMLElement`, `HTMLCanvasElement`, `CanvasRenderingContext2D`, `PointerEvent`, `KeyboardEvent`, `File`, `Blob`, `URL.createObjectURL`, `requestAnimationFrame`, or `localStorage`.
- Forge may import core through package entrypoints or explicitly approved core subpaths.
- Rendering should consume evaluated geometry, not construction syntax.
- Interaction should identify hits and body-drag sources, not mutate graph state.
- Workspace parsing/serialization semantics belong in core; browser file picking and downloading belong in forge.

## Development

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Run the full project check:

```bash
npm run check
```

The check script should include type checking, unit tests, boundary checks, and smoke tests. In the current app layout this includes Vite, Vitest, Playwright, and the custom boundary checker.

Useful commands during migration:

```bash
npm run typecheck
npm test
npm run check:boundaries
npm run smoke
npm run build
```

Package scripts may change as the monorepo lands. Prefer keeping one root `npm run check` as the contributor gate.

## Feature workflow

For a new geometry or construction feature, work from the inside out:

1. Add or update core representation types and graph-edit semantics.
2. Add core dependency rules and delete policy if needed.
3. Add core evaluation and diagnostics.
4. Add core construction helpers or workspace serialization changes.
5. Add forge command, selection, or pointer intent behavior.
6. Add interaction hit testing when the feature can be selected or dragged.
7. Add rendering only after evaluated geometry exists.
8. Add unit tests at the lowest layer that owns the behavior.
9. Run the full boundary/type/test/smoke check.

For app-only work, do not change core just to make a UI path convenient. Adapt through forge-level commands, pointer intent, rendering options, or workspace file effects.

## Documentation

Start here:

- `docs/architecture.md` explains the monorepo architecture and dependency direction.
- `docs/feature-workflow.md` explains how to add features without crossing ownership boundaries.
- `docs/monorepo-boundary-checklist.md` captures the boundary-review checklist for code review.
- `docs/denotational-geometry-direction.md` records the longer-term geometry model direction.

## Design principle

The monorepo is for contributor ergonomics, not architectural convenience. Core should remain a headless geometry engine; forge should remain a browser/editor adapter. When in doubt, preserve the one-way dependency and let the boundary checker be stricter than habit.
