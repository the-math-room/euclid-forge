# Architecture

Euclid Core is a headless geometry package. It describes geometry in terms of meaning, graph representation, and evaluation. It does not know how geometry is rendered or edited in a browser.

## Pipeline

The core pipeline is:

```text
meaning → representation → geometry registry → evaluation → core API
```

## Layers

### `meaning`

Mathematical primitives and denotations live here. This layer contains objects like vectors, lines, curves, and intersection logic. Code in this layer should be pure mathematical logic.

### `view`

Viewport math lives here. This includes screen/world transforms and viewport state that can be expressed without DOM or Canvas dependencies.

Viewport math is coordinate-system meaning. It is not rendering.

### `representation`

The representation layer defines the authored graph: node shapes, edits, graph invariants, dependencies, constructions, and delete policy.

This layer should answer questions like:

- What nodes exist?
- What does each node depend on?
- Which graph edits are valid?
- Which construction helpers create stable graph additions?

### `geometry`

The geometry layer registers geometry kinds and connects representation to evaluation and construction metadata.

Geometry definitions should remain headless. They should not contain rendering, hit testing, pointer behavior, DOM APIs, or editor commands.

### `evaluation`

The evaluation layer interprets the graph into evaluated geometry and diagnostics.

It should answer questions like:

- What geometric value does this node denote?
- Which nodes failed to evaluate?
- What ordered scene does the graph produce?
- Which hidden nodes should be excluded from a visible evaluated scene?

### `core`

The core layer is the package facade. It owns public entrypoints, workspace serialization/deserialization, diagnostics helpers, fixture running, and API smoke tests.

## Adapter boundary

Rendering and pointer interaction are adapter concerns. They live in Euclid Forge, not in Euclid Core.

Forge may ask the core package for evaluated geometry, graph edits, constructions, viewport transforms, and workspace serialization. Forge is then responsible for drawing, hit testing, commands, browser files, and UI state.
