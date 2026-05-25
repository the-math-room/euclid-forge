# Feature Workflow

Core geometry features should be developed headless-first.

The goal is to make the mathematical and graph semantics correct before adding editor commands, rendering, or pointer interaction in Euclid Forge.

## Recommended sequence

1. Add or extend meaning-level tests.
2. Add mathematical primitives or denotations if needed.
3. Add representation node shape if the feature needs a persistent graph node.
4. Add construction helpers for stable graph creation.
5. Add evaluation behavior.
6. Register the geometry definition.
7. Add workspace, fixture, and public API coverage where appropriate.
8. Run `npm run check` in `euclid-core`.
9. Adapt Euclid Forge rendering, interaction, and commands after the headless API is stable.

## Example: adding `LINE`

A good `LINE` implementation should start with meaning, not UI.

Suggested patches:

### Patch 1: meaning only

- Add an unbounded linear curve denotation.
- Use the existing curve/intersection model where possible.
- Test line-line intersections.
- Test line-circle intersections.
- Include cases where segment-bounded behavior would be wrong.

### Patch 2: representation and evaluation

- Add a `LINE` node shape.
- Add construction helpers.
- Add dependency behavior.
- Add evaluation from line node to evaluated curve/geometry.
- Add geometry registry coverage.

### Patch 3: core API and workspace

- Add serialization/deserialization coverage.
- Add fixture coverage if useful.
- Ensure public imports are intentional.

### Patch 4: Forge adapters

In `euclid-forge`, add rendering, hit testing, commands, shortcuts, and smoke coverage.

## Commit style

Prefer small commits that preserve a green check:

```text
Add unbounded line denotation
Add line graph representation
Evaluate line geometry nodes
Adapt Forge to render lines
```

Avoid combining math, graph representation, rendering, and UI commands into one large patch unless the change is purely mechanical.
