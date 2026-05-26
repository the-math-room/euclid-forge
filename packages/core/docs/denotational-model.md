# Denotational Model

Euclid Core is organized around a denotational model of geometry.

The central question is: **what does this graph mean?**

## Meaning

Meaning is mathematical. It includes vectors, curves, lines, circles, intersections, and geometric relationships independent of display.

## Representation

Representation is the authored graph structure. It records user-created nodes and dependency relationships. A representation node is an instruction that can be evaluated into a geometric denotation.

Representation also owns graph-level invariants such as graph creation/topological ordering, immutable graph edits, dependency inspection, cascading delete policy, deterministic free-point planning, and constrained-point movement edits.

## Evaluation

Evaluation interprets representation into geometric values and diagnostics. It is deterministic and headless.

Undefined geometry is reported as diagnostics. It is not repaired by the evaluator and does not depend on viewport tolerance or pointer context.

## Dynamic construction, not general constraint solving

A construction node says how to compute something when defined. It does not force its dependencies to remain in a configuration where it is defined.

Constrained endpoints are narrower than a general solver. A `LINEAR_CONSTRAINED_POINT` records a linear reference, an anchor point, a mode, and a signed scalar offset. Evaluation computes the endpoint along a reference-derived unit direction:

```text
mode: "PARALLEL"       => anchor + unitDirection(reference) * offset
mode: "PERPENDICULAR" => anchor + perpendicular(unitDirection(reference)) * offset
```

A finite parallel or perpendicular segment is represented as:

```text
LINEAR_CONSTRAINED_POINT(reference, anchor, mode, offset)
SEGMENT(anchor, constrainedPoint)
```

Dragging the constrained endpoint updates the scalar `offset`; it does not move other points or solve arbitrary constraints.

## Display notation is not denotation

Parallel chevrons, future perpendicular marks, label pills, display scale, high-contrast canvas, print theme, and lasso overlay are adapter/rendering concerns. Do not store them in the graph unless explicit user-authored style annotations become a product feature.

## Design rule

Geometry definitions may describe representation, evaluation, and construction. They should not describe rendering or interaction.
