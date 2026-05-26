# Feature Workflow

Core geometry features should be developed headless-first.

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

## Example: constrained endpoint

Headless patch:

```text
add or extend LINEAR_CONSTRAINED_POINT mode support
evaluate it from reference + anchor + signed offset
add construction helpers that create constrained point + SEGMENT
support MOVE_CONSTRAINED_POINT for the movement edit
export app-facing helpers through the core facade
test evaluation, construction, edit behavior, and public API
```

Forge patch:

```text
add command/tool behavior
hit test and drag the constrained endpoint
call the constrained movement edit during drag
render ordinary evaluated points/segments
add visual notation only if useful
```

## Validation

```bash
npm run check:concise
scripts/checks.sh concise
npm run check:core
npm run check
```
