# Euclid Forge App

This workspace contains the browser/editor application for Euclid Forge.

It owns:

- canvas rendering
- DOM event binding
- keyboard commands
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
```

## Smoke tests

Smoke tests live in `apps/forge/smoke`.

The Playwright config uses a dedicated test port so it does not collide with the normal Vite dev server.

## Architectural rule

Forge may adapt core concepts to the browser, but browser-specific code should stay here. Do not move DOM, canvas, or rendering concerns into `packages/core`.
