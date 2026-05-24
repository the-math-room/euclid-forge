# Euclid Forge

An experimental 2D geometry construction editor.

Core shape:

```txt
construction syntax → validated graph → evaluated geometry → rendering
```

User interactions produce graph edits or view-state changes. They do not mutate evaluated geometry.

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

Runs:

```txt
typecheck
unit tests
denotational boundary check
Playwright smoke tests
```

Useful commands:

```bash
npm test
npm run typecheck
npm run check:boundaries
npm run smoke
npm run build
```

## Source dump

```bash
./scripts/dump-source.sh > source-dump.txt
```

## Current interactions

```txt
click empty canvas         add free point
drag free point            move free point
drag triangle body         translate free vertices
hover object               preview hit target

shift-click point          toggle point selection
shift-click segment        toggle segment selection
shift-click triangle body  toggle triangle selection

T                          create triangle from 3 selected free points
G                          create centroid for selected triangle
M                          create/reuse side segments and midpoints

Delete / Backspace         delete selected nodes when dependency-safe
H                          hide selected nodes
U                          unhide all hidden nodes

Arrow keys                 pan viewport
+ / =                      zoom in
- / _                      zoom out
hold [ / ]                 smoothly rotate viewport
\                          reset viewport rotation
0                          reset viewport

Ctrl/Cmd+Z                 undo
Ctrl/Cmd+Shift+Z           redo
Ctrl/Cmd+Y                 redo

Ctrl/Cmd+S                 save workspace JSON
Ctrl/Cmd+O                 open workspace JSON
```

Three points do not automatically imply a triangle. A triangle is created only by explicit user intent.

Delete is conservative. It does not cascade. If selected nodes have unselected dependents, deletion is blocked and the app shows a status message explaining why.

Undo restores successful deletes.

## Durable vs transient state

Durable project state:

```txt
Graph
selected node IDs
hidden node IDs
viewport center
viewport zoom
viewport rotation
```

Transient runtime state:

```txt
hover
drag state
pointer capture
smooth viewport motion
undo/redo stacks
status messages
```

Workspace save/load stores durable project state only.

## Runtime seams

```txt
main.ts          app composition
domEvents.ts     DOM listener wiring
appRuntime.ts    state/history/render/status coordinator
AppTransition    state/render/history/effects protocol
AppEffect[]      app-edge effects such as pointer capture and status feedback
```

Commands have explicit eligibility:

```txt
command.disabledReason(state)
command.run(state)
```

This supports keyboard shortcuts now and future menus, toolbars, and command palettes later.

## Architecture

See:

```txt
docs/architecture.md
docs/feature-workflow.md
```
