# Denotational Model

Euclid Core is organized around a denotational model of geometry.

The central question is: **what does this graph mean?**

## Meaning

Meaning is mathematical. It includes vectors, curves, lines, circles, intersections, and geometric relationships independent of any display.

Meaning code should not know about:

- Canvas
- DOM
- pointer events
- CSS
- editor commands
- selection state
- hover state
- toolbar state

## Representation

Representation is the authored graph structure. It records user-created nodes and the dependency relationships between them.

A representation node is not itself the final mathematical value. It is an instruction that can be evaluated into a geometric denotation.

For example, a segment node records endpoint IDs. Evaluation resolves those endpoints and produces an evaluated segment value.

Representation also owns graph-level invariants and operations such as:

- graph creation and topological ordering
- immutable graph edits
- dependency and dependent inspection
- cascading delete policy
- deterministic free-point planning

These behaviors are editor-relevant, but they are not browser-specific.

## Evaluation

Evaluation interprets representation into geometric values and diagnostics.

Evaluation should be deterministic and headless. Given the same graph, it should produce the same evaluated scene and issues regardless of browser, renderer, or editor state.

Undefined geometry is reported as diagnostics. It is not repaired by the evaluator, and it does not depend on viewport tolerance or pointer context.

## View math

View math converts between coordinate systems, such as world and screen coordinates.

This belongs in Core because it is pure coordinate-system math. It does not depend on Canvas or DOM APIs.

The presence of screen coordinates does not make this rendering. Rendering begins when an adapter draws onto a target such as `CanvasRenderingContext2D`.

## Rendering and interaction

Rendering and hit testing are adapters over evaluated geometry.

They answer questions like:

- How should this evaluated point be drawn?
- Which visible shape is under this pointer?
- Which cursor or interaction affordance should appear?
- Which toolbar status text should be shown?

Those questions belong outside Core, in Euclid Forge.

## Dynamic construction, not constraint solving

A construction node says how to compute something when defined. It does not force its dependencies to remain in a configuration where it is defined.

For example:

```text
X = intersection(AB, CD)
Y = segment(X, E)
```

If `AB` and `CD` stop intersecting as finite segments:

```text
X is undefined
Y is undefined because X is unavailable
the graph still contains X and Y
both can reappear if AB and CD intersect again
```

Refusing a drag, clamping motion, or moving other points to preserve an intersection would be constraint solving. That may be a future mode, but it is not the current evaluator.

## Design rule

Geometry definitions may describe representation, evaluation, and construction. They should not describe rendering or interaction.

When adding a feature, prove the denotation first. Add editor behavior only after the headless meaning is stable.
