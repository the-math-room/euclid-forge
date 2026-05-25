# Euclid Forge

An experimental 2D geometry construction editor with a growing headless geometry core.

Euclid Forge is intentionally small and architecture-heavy. The core model is a validated construction graph; evaluation derives geometric meaning; rendering and interaction project that meaning into a canvas UI.

## Current capabilities

- Add and drag free points.
- Shift-click to select points, segments, circles, triangles, and derived points.
- Join selected constructible points with `J`: two points create a segment; three points create a triangle.
- Construct lines with `L` from two selected constructible points.
- Construct circles with `C` from center and through points.
- Construct intersections with `I` from selected curve nodes.
- Construct centroids with `G` and triangle side midpoints with `M`.
- Use derived points as downstream construction inputs: midpoints, centroids, segment intersections, and curve intersections.
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

`I` creates intersections from selected curve nodes. Segment + segment still creates the legacy bounded `SEGMENT_INTERSECTION` point. Segment + circle and circle + circle create branch-specific `CURVE_INTERSECTION` points for each currently defined candidate.

Triangle borders are not segment nodes unless explicit segments have been constructed.

## Headless core

Euclid Forge now has an internal headless core surface:

```txt
src/core/index.ts
```

Consumer-style code should prefer the core index instead of reaching into app modules:

```ts
import {
  createGeometryEngine,
  geometryWorkspaceFromJsonText,
  diagnosticsWithCode,
} from "./core";
```

The headless core owns:

```txt
workspace parsing and serialization
workspace JSON text parsing
WorkspaceState = graph + viewState
ViewState and pure view-state helpers
engine evaluation facade
diagnostic query helpers
golden workspace fixtures
```

The browser app remains a consumer. It owns DOM events, keyboard shortcuts, browser file I/O, status messages, history, render scheduling, and transient editor state.

A typical headless path is:

```ts
const workspace = geometryWorkspaceFromJsonText(jsonText);
const engine = createGeometryEngine(workspace);

const evaluated = engine.evaluate();
const diagnostics = engine.diagnostics();

const next = engine.applyEdit({
  kind: "MOVE_FREE_POINT",
  id: "P1",
  point: { x: 1, y: 2 },
});

const serialized = next.serialize();
```

## Dynamic derived geometry

Derived constructions are dynamic. A construction node records how to compute an object when its dependencies currently define one. It does not force dependencies to remain in a valid configuration.

Curve intersections are persisted as branch-specific point nodes. Their internal IDs encode the source curves and branch key, while their display labels remain short (`X1`, `X2`, ...).

If a derived construction becomes undefined, Euclid Forge omits that evaluated geometry and records a diagnostic. Dependents of undefined geometry are also omitted. The graph still remembers the construction, so if dependencies become valid again the derived geometry reappears.

## Diagnostics

Evaluation diagnostics are structured:

```ts
{
  nodeId: "X",
  severity: "warning",
  code: "NO_REAL_INTERSECTION",
  message: "Cannot evaluate X; Circles do not intersect"
}
```

Current diagnostic codes include:

```txt
MISSING_DEPENDENCY
NO_REAL_INTERSECTION
NO_UNIQUE_INTERSECTION
STALE_INTERSECTION_BRANCH
UNDEFINED_GEOMETRY
```

Diagnostics are part of the headless core surface and can be queried with helper functions such as `diagnosticsWithCode(...)`.

## Architecture at a glance

```txt
meaning
→ representation
→ evaluation
→ core
→ app
```

The deliberate exception is `src/geometry/`, which acts as the controlled cross-layer seam for per-shape behavior. Shape definitions centralize dependencies, evaluation, rendering, hit testing, construction factories, and body-drag source metadata.

The graph remains the construction document. Derived coordinates are evaluated from the graph, not stored separately.

## Denotational direction

Geometry nodes should denote mathematical objects. Evaluation is an interpretation of those denotations into numeric canvas geometry.

For curve/intersection work, prefer abstractions over curve denotations and point sets rather than a combinatorial family of pair-specific graph concepts. The current general representation is `CURVE_INTERSECTION`:

```txt
source curve A
source curve B
branch key
→ point
```

## Golden fixtures

Golden workspace fixtures live with the headless core:

```txt
src/core/fixtures/
```

The first positive fixture is Euclid I.1 / equilateral triangle. It uses two points, two circles, two circle-circle intersection branches, and segments built from a derived intersection point.

There is also a negative fixture for disjoint circles, proving that unavailable curve intersections are omitted from evaluation and reported through stable diagnostic codes.

## Validation

Run the full project check with:

```bash
npm run check
```

That command runs TypeScript, unit tests, boundary checks, and Playwright smoke tests.
