# Annotations and Measurements

Euclid Forge now models display annotations as persistent graph state when they are authored by the user and should survive save/load.

## Segment measurements

Segment length measurements are graph annotations, not global display toggles.

They belong in Core because they:

- are authored state;
- survive save/load;
- depend on a segment;
- cascade-delete with their segment;
- participate in evaluation;
- render and print as part of the scene.

They are not geometry because they should not be used as points, lines, curves, construction inputs, lasso-selectable geometry, or draggable geometric bodies.

## Formatting policy

Length measurement labels currently use an automatic compact format. The policy is to avoid hiding meaningful deviation.

Examples:

```text
1        -> 1
1.01     -> 1.01
1.4142   -> 1.41
```

Before adding angle measurements, consider extracting shared formatting into a small measurement-format module.

## Point label offsets

Point-label-bearing nodes may carry an authored screen-pixel label offset:

```ts
labelOffsetPx?: Vec2
```

This applies to point labels on free points and derived/constrained points. The offset is added to the default theme label offset during rendering.

Offsets are screen-pixel notation, not mathematical geometry. This makes label spacing stable while zooming.

## Label dragging

The Forge app supports dragging point labels by hit-testing the label pill, entering a `LABEL` drag state, and applying a Core graph edit to update the persistent label offset.

The intended flow is:

```text
pointerdown on point label pill
  -> DRAG_LABEL intent
  -> LABEL drag state
pointermove
  -> SET_POINT_LABEL_OFFSET edit
pointerup
  -> commit history entry
```

## Shared label pill layout

Label pill bounds are shared between rendering and hit testing through a neutral UI/layout module, not by making interaction import rendering or rendering import interaction. This keeps dependency boundaries clean.

## Future annotation work

Likely future work:

- draggable segment-measurement labels;
- angle measurements;
- annotation-specific hit testing;
- selected-object action surface for toggling measurements instead of relying on a temporary global shortcut.
