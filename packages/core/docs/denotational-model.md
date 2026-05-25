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

## Representation

Representation is the authored graph structure. It records user-created nodes and the dependency relationships between them.

A representation node is not itself the final mathematical value. It is an instruction that can be evaluated into a geometric denotation.

For example, a segment node records endpoint IDs. Evaluation resolves those endpoints and produces an evaluated segment value.

## Evaluation

Evaluation interprets representation into geometric values and diagnostics.

Evaluation should be deterministic and headless. Given the same graph, it should produce the same evaluated scene and issues regardless of browser, renderer, or editor state.

## View math

View math converts between coordinate systems, such as world and screen coordinates.

This belongs in core because it is pure coordinate-system math. It does not depend on Canvas or DOM APIs.

The presence of screen coordinates does not make this rendering. Rendering begins when an adapter draws onto a target such as `CanvasRenderingContext2D`.

## Rendering and interaction

Rendering and hit testing are adapters over evaluated geometry.

They answer questions like:

- How should this evaluated point be drawn?
- Which visible shape is under this pointer?
- Which cursor or interaction affordance should appear?

Those questions belong outside core, in Euclid Forge.

## Design rule

Geometry definitions may describe representation, evaluation, and construction. They should not describe rendering or interaction.

When adding a feature, prove the denotation first. Add editor behavior only after the headless meaning is stable.
