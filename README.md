# Euclid Forge

An experimental 2D geometry construction editor.

Core shape:

```txt
construction syntax → validated graph → evaluated geometry → rendering / interaction
```

User interactions produce graph edits or view-state changes. They do not mutate evaluated geometry directly.

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

## Current interactions

```txt
click empty canvas         add free point
drag free point            move free point
drag triangle body         translate free vertices
drag circle body           translate center and through points
hover object               preview hit target

shift-click point          toggle point selection
shift-click segment        toggle segment selection
shift-click circle body    toggle circle selection
shift-click triangle body  toggle triangle selection

T                          create triangle from 3 selected free points
C                          create circle from 2 selected free points
G                          create centroid for selected triangle
M                          create/reuse side segments and midpoints

Delete / Backspace         delete selected nodes when dependency-safe
H                          hide selected nodes
U                          unhide all hidden nodes

Arrow keys                 pan viewport
+ / =                      zoom in
- / _                      zoom out
hold [ / ]                 smoothly rotate viewport
\\                          reset viewport rotation
0                          reset viewport

Ctrl/Cmd+Z                 undo
Ctrl/Cmd+Shift+Z           redo
Ctrl/Cmd+Y                 redo

Ctrl/Cmd+S                 save workspace JSON
Ctrl/Cmd+O                 open workspace JSON
```

Three points do not automatically imply a triangle. A triangle is created only by explicit user intent.

Two points do not automatically imply a circle. A circle is created only by explicit user intent.

## Geometry behavior

Euclid Forge keeps shape-specific behavior behind the `src/geometry/` registry seam. Geometry definitions own dependencies, evaluation, rendering, hit testing, construction factories, and opt-in body-drag source semantics.

Dragging a body is intentionally not a generic inverse-constraint solve. A geometry definition must declare the free source points that can be translated to preserve the shape. Triangles expose their three vertices when all are free points. Circles expose their center and through points when both are free points. Constrained points, midpoints, and centroids do not become body-draggable by accident.

## Ordering model

Rendering keeps the broad layer order:

```txt
AREA → LINEAR → POINT
```

Hit testing keeps the broad interaction priority:

```txt
POINT → LINEAR → AREA
```

Within a render layer or hit class, `zIndex` decides which overlapping geometry is visually or interactively on top. This means a point remains easy to grab even when it sits inside a high-z area shape, while overlapping areas such as circles and triangles can be ordered consistently.

## Design notes

The graph is the durable construction document. Evaluated geometry is derived from it.

Workspace files store durable state: graph nodes, selected/hidden node IDs, and viewport information. They do not store hover, drag state, pointer capture, animation state, history, or status messages.

Run `npm run check` before handing off a patch.
