# Feature Workflow

Core geometry features should be developed headless-first.

The goal is to make the mathematical and graph semantics correct before adding editor commands, rendering, pointer interaction, or toolbar affordances in Euclid Forge.

## Recommended sequence

1. Add or extend meaning-level tests.
2. Add mathematical primitives or denotations if needed.
3. Add representation node shape if the feature needs a persistent graph node.
4. Add construction helpers for stable graph creation.
5. Add graph edit, dependency, or delete-policy behavior if needed.
6. Add evaluation behavior.
7. Register the geometry definition.
8. Add workspace, fixture, and public API coverage where appropriate.
9. Run `npm run check -w @euclid-forge/core`.
10. Adapt Euclid Forge rendering, interaction, modal tools, commands, and smoke coverage after the headless API is stable.

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

In `apps/forge`, add rendering, hit testing, commands, shortcuts, modal tool support, status text, and smoke coverage.

## Example: app ergonomics over core invariants

For modal construction tools, Core should own only the headless invariant:

```text
Graph + Vec2 → planned free-point node/id
```

Forge should own the browser interpretation:

```text
An empty click in Segment mode creates a point and uses it as the first segment input.
```

That split keeps Core mathy and lets the app evolve its UX without weakening the engine boundary.

## Commit style

Prefer small commits that preserve a green check:

```text
Add unbounded line denotation
Add line graph representation
Evaluate line geometry nodes
Adapt Forge to render lines
Add line modal tool coverage
```

Avoid combining math, graph representation, rendering, and UI commands into one large patch unless the change is purely mechanical.

## Validation

Routine patch-loop gate:

```bash
npm run check:concise
```

Core-focused gate:

```bash
npm run check:core
```

Full gate:

```bash
npm run check
```
