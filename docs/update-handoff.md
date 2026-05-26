# Euclid Forge Update Handoff

This note summarizes the most recent architecture and feature work.

## Completed work

- Added persistent segment measurement annotations.
- Split evaluated scene items into geometry and annotations.
- Added evaluated scene-item helpers for geometry-only iteration.
- Split representation-side graph nodes into geometry nodes and annotation nodes.
- Widened graph/workspace/edit/dependency containers to `GraphNode`.
- Added Core graph-node predicates for geometry, annotation, segment, and linear narrowing.
- Added persistent point label offsets.
- Rendered point labels using default theme offset plus authored `labelOffsetPx`.
- Added point-label hit testing and mouse dragging through a `LABEL` drag state.
- Kept geometry hit testing geometry-first and annotation behavior explicit.

## Current known scars

- Registry naming still says “geometry” even though definitions now cover broad graph nodes. Rename later in a focused pass.
- Measurement formatting should likely move to a shared measurement-format module before adding angle measurements.
- The selected-segment measurement toggle currently uses a temporary shortcut. A selected-object action surface would be better UX.
- Label pill hit testing approximates text metrics outside rendering. If picking feels off, consider a shared layout/cache path.

## Recommended next steps

Small/high-leverage cleanup:

1. Migrate more local Forge type guards to Core graph-node predicates.
2. Rename registry concepts from geometry to graph-node terminology.
3. Add tests for point-label dragging behavior and label offset persistence through workspace save/load.
4. Extract measurement formatting.
5. Add selected-object actions for “Show length” / “Hide length.”

## Safety state

The latest code updates were reported green through concise checks after the graph-node predicate module and label-offset persistence/rendering slice. The label-drag interaction patch was in progress; ensure `npm run check:concise` is green after applying any final interaction-boundary repair.
