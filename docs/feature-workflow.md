# Feature Workflow

Prefer small vertical changes.

Each feature should preserve the pipeline:

```txt
GraphEdit → Graph → EvaluatedScene → render
```

## Add a new construction

1. Add syntax in `representation/node.ts`.
2. Add dependencies in `representation/dependencies.ts`.
3. Add evaluated type in `evaluation/evaluated.ts`, if needed.
4. Add evaluation case in `evaluation/evaluateGraph.ts`.
5. Add renderer only if the evaluated geometry needs new drawing behavior.
6. Add graph edit support in `representation/edit.ts`, if users can create it.
7. Add unit tests.
8. Add smoke coverage only for user-visible behavior.

## Add a new user interaction

1. Decide the user intent.
2. Convert the gesture into a `GraphEdit` or view-state change.
3. Keep DOM effects in `app/`.
4. Keep geometry changes in `representation/edit.ts`.
5. Keep hit testing in `interaction/`.

## Add view state

View state is not graph state.

Good examples:

```txt
selected nodes
hidden nodes
hovered node
active tool
viewport
```

These should not become geometry nodes unless they have mathematical meaning.

## Add derived geometry

Derived geometry should depend on source construction.

Good:

```txt
CENTROID depends on TRIANGLE
TRIANGLE_SIDE_MIDPOINT depends on TRIANGLE + side
```

Avoid storing derived coordinates in the graph.

## Tests

Use unit tests for:

```txt
math
graph validation
evaluation
graph edits
hit testing
render scheduling
```

Use smoke tests for:

```txt
browser wiring
canvas rendering
real pointer/keyboard interactions
```

Smoke tests should assert behavior, not implementation details.

## Comments

Comment why, not what.

Good:

```ts
// Only triangles with free vertices are body-draggable. Translating only
// some vertices would deform the construction instead of moving it.
```

Bad:

```ts
// Loop over triangles.
```
