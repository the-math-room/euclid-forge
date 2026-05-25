# Euclid Forge

An experimental 2D geometry construction editor.

Euclid Forge is intentionally small and architecture-heavy. The core model is a validated construction graph; evaluation derives geometric meaning; rendering and interaction project that meaning into a canvas UI.

## Current capabilities

- Add free points by clicking empty canvas.
- Drag free points directly.
- Shift-click to select points, segments, circles, triangles, and derived points.
- Join selected constructible points:
  - two selected constructible points create an undirected segment
  - three selected constructible points create a triangle
- Construct circles from two selected constructible points interpreted as center and through point.
- Construct bounded segment intersections from two selected segment nodes.
- Construct a centroid from a selected triangle.
- Construct side midpoints from a selected triangle.
- Use derived points as downstream construction inputs: midpoints, centroids, and segment intersections.
- Drag area bodies when their definitions expose free source points.
- Hide selected nodes and automatically hide their dependents.
- Delete selected nodes only when no unselected dependents would be left dangling.
- Save and open workspace JSON files.
- Undo and redo committed graph/view changes.
- Pan, zoom, and rotate the viewport.
- Reorder selected geometry within its render/hit layer with z-order commands.

## Controls

| Action | Shortcut / Gesture |
| --- | --- |
| Add point | Click empty canvas |
| Move free point | Drag point |
| Move draggable area body | Drag triangle/circle body |
| Select / toggle selection | Shift-click geometry |
| Join selected constructible points | `J` |
| Circle from center/through points | `C` |
| Segment intersection from two selected segments | `I` |
| Centroid of selected triangle | `G` |
| Side midpoints of selected triangle | `M` |
| Delete selected nodes | `Delete` / `Backspace` |
| Hide selected nodes | `H` |
| Unhide all hidden nodes | `U` |
| Bring selected forward | `PageUp` |
| Send selected backward | `PageDown` |
| Bring selected to front | `Shift+PageUp` |
| Send selected to back | `Shift+PageDown` |
| Pan viewport | Arrow keys |
| Zoom viewport | `+` / `-` |
| Rotate viewport | `[` / `]` |
| Reset viewport rotation | `\\` |
| Reset viewport | `0` |
| Save workspace | `Ctrl/Cmd+S` |
| Open workspace | `Ctrl/Cmd+O` |
| Undo | `Ctrl/Cmd+Z` |
| Redo | `Ctrl/Cmd+Shift+Z` or `Ctrl/Cmd+Y` |

`J` is the boundary-construction command. With two selected constructible points it creates a segment; with three selected constructible points it creates a triangle. `C` stays separate because its two selected points mean center and through point rather than unordered endpoints.

`I` creates a bounded finite-segment intersection from two selected segment nodes. Triangle borders are not segment nodes unless explicit segments have been constructed.

## Dynamic derived geometry

Derived constructions are dynamic. A construction node records how to compute an object when its dependencies currently define one. It does not force dependencies to remain in a valid configuration.

If a derived construction becomes undefined, Euclid Forge omits that evaluated geometry and records an evaluation issue. Dependents of undefined geometry are also omitted. The graph still remembers the construction, so if dependencies become valid again the derived geometry reappears.

Example:

```txt
segment AB ∩ segment CD → X
J(X, E) → segment XE
```

If `AB` and `CD` no longer intersect as finite segments, `X` disappears and `XE` disappears too. If the segments cross again, both can reappear.

## Architecture at a glance

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The deliberate exception is `src/geometry/`, which acts as the controlled cross-layer seam for per-shape behavior. Shape definitions centralize dependencies, evaluation, rendering, hit testing, construction factories, and body-drag source metadata.

The graph remains the construction document. Derived coordinates are evaluated from the graph, not stored separately.

## Denotational direction

Geometry nodes should denote mathematical objects. Evaluation is an interpretation of those denotations into numeric canvas geometry.

For future curve/intersection work, prefer abstractions over curve denotations and point sets rather than a combinatorial family of pair-specific graph concepts. The current segment-intersection feature is a concrete construction, but the intended direction is:

```txt
curve denotation
→ intersection operation over denotations
→ numeric evaluator / solver
→ classified intersection candidates
```

Specialized numeric solvers may exist underneath, but app and representation concepts should avoid leaking a pairwise explosion such as `SEGMENT_CIRCLE_INTERSECTION`, `CIRCLE_CIRCLE_INTERSECTION`, and so on unless a separate user-facing meaning truly requires it.

## Ordering model

Euclid Forge keeps render order and interaction priority separate:

```txt
Render layers: AREA → LINEAR → POINT
Hit priority:  POINT → LINEAR → AREA
```

`zIndex` resolves conflicts within a render layer or hit class. It does not let an area block direct point interaction.

## Validation

Run the full project check with:

```bash
npm run check
```

That command runs TypeScript, unit tests, boundary checks, and Playwright smoke tests.
