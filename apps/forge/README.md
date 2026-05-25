# Euclid Forge App

This workspace contains the browser/editor application for Euclid Forge.

It owns:

- canvas rendering
- DOM event binding
- keyboard commands
- modal construction and delete tools
- pointer intent
- selection, hover, drag, and history behavior
- browser workspace save/open actions
- Playwright smoke tests
- app styling

It depends on the headless geometry engine through `@euclid-forge/core`.

## Commands

From the repository root:

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
```

## User workflows

Forge supports both modal browser/mobile-friendly workflows and keyboard-oriented power-user workflows.

Modal workflows:

- Point tool creates free points with ordinary clicks/taps.
- Segment, Circle, and Triangle tools collect point inputs with ordinary clicks/taps.
- Shape tools can create free points from empty-space clicks and use them immediately as construction inputs.
- Delete mode deletes clicked geometry without preselecting.

Power-user workflows:

- Shift-click selects geometry.
- Keyboard commands create shapes from selected geometry.
- Delete/Backspace deletes selected geometry.
- Undo/redo restore graph and view-state history.

## Smoke tests

Smoke tests live in `apps/forge/smoke`.

The Playwright config uses a dedicated test port so it does not collide with the normal Vite dev server.

Smoke coverage should document real user paths, especially modal tool workflows and legacy keyboard/Shift-select workflows.

## Architectural rule

Forge may adapt Core concepts to the browser, but browser-specific code should stay here. Do not move DOM, canvas, rendering, toolbar, pointer-capture, status-message, or file-picker concerns into `packages/core`.

Core should own math and graph invariants. Forge should own the browser gesture that invokes those invariants.
