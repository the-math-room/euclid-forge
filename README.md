# Euclid Forge

An experimental 2D geometry construction engine.

The design goal is simple:

```txt
construction syntax → validated graph → evaluated geometry → rendering
```

User interactions produce graph edits. They do not mutate evaluated geometry.

## Quick start

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal.

## Checks

```bash
npm run check
```

This runs:

```txt
typecheck
unit tests
denotational boundary check
Playwright smoke tests
```

Useful individual commands:

```bash
npm test
npm run typecheck
npm run check:boundaries
npm run smoke
```

## Source dump

To share the current source state:

```bash
./scripts/dump-source.sh > source-dump.txt
```

## Current interactions

```txt
click empty canvas        add free point
drag free point           move that point
drag triangle body        translate its free vertices
shift-click free point    toggle point selection
shift-click triangle body  toggle triangle selection
press T                   create triangle from exactly 3 selected free points
press G                   create centroid for selected triangle
press H                   hide selected nodes
press U                   unhide all hidden nodes
```

Three points do not automatically imply a triangle. A triangle is created only by explicit user intent.

## Architecture

See:

```txt
docs/architecture.md
docs/feature-workflow.md
```
