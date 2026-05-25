# Euclid Forge

An experimental 2D geometry construction editor.

Euclid Forge is intentionally small and architecture-heavy. The core model is a
validated construction graph; evaluation derives geometric meaning; rendering and
interaction project that meaning into a canvas UI.

## Current capabilities

- Add free points by clicking empty canvas.
- Drag free points directly.
- Shift-click to select points, segments, circles, and triangles.
- Join selected free points:
  - two selected free points create an undirected segment
  - three selected free points create a triangle
- Construct circles from two selected free points interpreted as center and through point.
- Construct a centroid from a selected triangle.
- Construct side midpoints from a selected triangle.
- Drag area bodies when their definitions expose free source points:
  - triangles drag by translating their three free vertices
  - circles drag by translating their center and through points
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
| Join selected free points | `J` |
| Circle from center/through points | `C` |
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
| Reset viewport rotation | `\` |
| Reset viewport | `0` |
| Save workspace | `Ctrl/Cmd+S` |
| Open workspace | `Ctrl/Cmd+O` |
| Undo | `Ctrl/Cmd+Z` |
| Redo | `Ctrl/Cmd+Shift+Z` or `Ctrl/Cmd+Y` |

`J` is the boundary-construction command. With two selected free points it creates
a segment; with three selected free points it creates a triangle. `C` stays
separate because its two selected points mean center and through point rather
than unordered endpoints.

## Architecture at a glance

```txt
meaning
→ representation
→ evaluation
→ rendering
→ interaction
→ app
```

The deliberate exception is `src/geometry/`, which acts as the controlled
cross-layer seam for per-shape behavior. Shape definitions centralize
dependencies, evaluation, rendering, hit testing, construction factories, and
body-drag source metadata.

The graph remains the construction document. Derived coordinates are evaluated
from the graph, not stored separately.

## Ordering model

Euclid Forge keeps render order and interaction priority separate:

```txt
Render layers: AREA → LINEAR → POINT
Hit priority:  POINT → LINEAR → AREA
```

`zIndex` resolves conflicts within a render layer or hit class. It does not let
an area block direct point interaction.

## Validation

Run the full project check with:

```bash
npm run check
```

That command runs TypeScript, unit tests, boundary checks, and Playwright smoke
tests.
