# Occlusion and Polygons TODO

## Current stable state

Euclid Forge now has explicit `POLYGON` graph nodes. A polygon exists only when the user creates one; closed segment cycles are not automatically treated as polygons.

Current polygon creation workflow:

1. Draw or select the boundary of a face.
2. Select a closed cycle of boundary segments, or select 3+ polygon vertices.
3. Press `f` or use the Face button.
4. A `POLYGON` node such as `PG1` is created.

The canvas also has two display/debug toggles:

- `Hidden lines` / `Hidden lines beta`
- `Z levels`

Both are display-only. They should not affect mathematical meaning, graph dependencies, saving/loading, selection semantics, or construction logic.

## Intended model

Occlusion is a visual convention derived from z-order:

- Higher z-level area geometry may visually occlude lower z-level geometry.
- Hidden linear portions should render dashed, not disappear.
- Z-order is the front/back model.
- Layer order is only a same-z tie-breaker.

The important product rule is:

> Explicit polygons are authored faces. Segments and lines remain construction geometry unless the user creates a polygon face.

## What works well enough

- Explicit `POLYGON` nodes evaluate and render.
- `POLYGON` participates in the area render layer.
- Polygon nodes can be created from a selected closed segment cycle.
- Polygon nodes can also be created from selected vertices.
- Z-level overlay is useful for diagnosing front/back order.
- Hidden-line rendering is gated by a display toggle and defaults off.

## Known incomplete behavior

### 1. Occlusion is not yet coherent for all outline-vs-outline cases

The intended behavior is:

- A lower-z segment/line should dash where it passes behind a higher-z polygon/circle/triangle.
- A lower-z polygon perimeter should dash where it passes behind a higher-z polygon/circle/triangle.
- The feature should not require filled faces.

The current implementation has the beginnings of this, but it is not yet reliable enough for cube drawing.

### 2. Polygon/circle/triangle occluders need a single shared “area outline occlusion” abstraction

There should be one render-time abstraction for occluders:

```ts
type ScreenAreaOccluder = {
  id: NodeId;
  zIndex: number;
  boundary: readonly ScreenPoint[];
};
````

Then all outline renderers should consume it consistently:

- Segment renderer
- Line renderer
- Polygon renderer
- Possibly circle renderer later

### 3. Occlusion needs tests before further tuning

Add tests around the splitting logic and renderer calls:

- Lower-z segment crossing higher-z polygon uses dashed middle interval.
- Higher-z segment crossing lower-z polygon stays solid.
- Lower-z polygon edge behind higher-z polygon dashes only the hidden span.
- Hidden-lines toggle off produces no dashed segments.
- Z-level tie uses layer order only as a tie-breaker.

### 4. Polygon hit-testing is incomplete

Polygon nodes render and can be lasso-selected, but direct polygon interior hit-testing is not fully implemented.

Needed:

- Hit polygon interior as an `AREA` target.
- Allow direct selection of a polygon face.
- Allow body dragging a polygon face by its vertices when possible.

### 5. Face UI is still primitive

The Face button currently runs the create-polygon command. It should eventually show better state:

- Disabled when the selection cannot form a polygon.
- Tooltip/status explaining what is missing.
- Possibly a selected-action surface rather than a normal tool button.

## Recommended next implementation pass

Do not continue by special-casing more shapes. Instead:

1. Rename the occluder abstraction from polygon-specific to area-specific.
2. Normalize all occluders to screen-space closed boundaries.
3. Move segment/line/polygon outline drawing through one `drawOccludedPolylineSegment` helper.
4. Keep the feature behind the `Hidden lines beta` toggle until tests pass.
5. Add direct polygon hit-testing after the render behavior is predictable.

## Non-goals

For now, do not implement:

- Automatic polygons from every closed segment cycle.
- Filled faces as a requirement for occlusion.
- Core/math-level occlusion semantics.
- Per-object “occludable” flags.
- Shape clipping in Core.

Occlusion should remain a Forge rendering concern.
