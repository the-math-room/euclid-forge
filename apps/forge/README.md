# Euclid Forge App

This workspace contains the browser/editor application for Euclid Forge.

It owns canvas rendering, DOM event binding, keyboard commands, modal construction tools, pointer intent, selection/hover/drag/lasso/history behavior, browser workspace save/open actions, high-contrast and display-scale controls, print-surface rendering, smoke tests, and app styling.

It depends on the headless geometry engine through `@euclid-forge/core`.

## Commands

```bash
npm run dev -w euclid-forge
npm run check -w euclid-forge
npm run smoke -w euclid-forge
```

Or through root aliases:

```bash
npm run dev
npm run check:forge
npm run smoke
npm run check:concise
scripts/checks.sh concise
```

## User workflows

Forge supports modal browser/mobile-friendly workflows and keyboard-oriented power-user workflows.

Modal workflows include Point, Segment, Line, Parallel, Perpendicular, Circle, Triangle, Midpoint, Intersection, Lasso, and Delete tools. Shape tools can create free points from empty-space clicks and use them immediately as construction inputs.

Parallel and perpendicular tools create finite segments from a reference line/segment and an anchor point, using a visible constrained endpoint provided by Core.

Power-user workflows include Shift-click selection, keyboard construction commands, `P` for a parallel segment from one selected segment/line and one selected point, `O` for a perpendicular segment from the same selection shape, Delete/Backspace, and undo/redo.

## Rendering and display

Rendering is adapter code. It consumes evaluated geometry and render options; it should not mutate graph state or decide mathematical validity.

Current rendering affordances include label pills, dark/high-contrast canvas modes, incremental display scale, print-specific white-background rendering, parallel-family chevrons, and the lasso overlay.

Parallel-family chevrons are render-derived from `LINEAR_CONSTRAINED_POINT` nodes whose mode is `"PARALLEL"`; they are not graph state.

## Architectural rule

Forge may adapt Core concepts to the browser, but browser-specific code should stay here. Do not move DOM, canvas, rendering, toolbar, pointer-capture, status-message, print-image, display-theme, or file-picker concerns into `packages/core`.

## Recent project state

Recent decisions that should be treated as current context:

- Lasso selection is app-side interaction. It selects fully contained visible selectable geometry; infinite lines are excluded from lasso containment.
- Labels render with translucent label pills for readability over geometry.
- The canvas has dark and high-contrast display modes plus incremental display scale for line/point/label size.
- Print output uses a print-only offscreen render/image path, not the live canvas, with a white-background print theme.
- Curve intersections suppress duplicate derived points when a candidate already coincides with an existing evaluated point.
- Circle-circle branch keys are stable relative to the directed center-to-center axis, not sorted by world coordinates.
- `LINEAR_CONSTRAINED_POINT` is a core constrained visible endpoint for finite parallel and perpendicular segments.
- Dragging a constrained endpoint updates its scalar offset through `MOVE_CONSTRAINED_POINT`; this is not a general constraint solver.
- Parallel chevrons are render-derived notation from transitive parallel families; they are not graph state.
