# Euclid Forge Agent Notes

Euclid Forge is a canvas-based dynamic geometry app for classroom geometry. The project is intentionally split between Core geometry meaning/representation/evaluation and Forge app interaction/rendering/UI.

## Primary architectural rule

If something is a real authored mathematical or notational object that should survive save/load, participate in dependency tracking, or be usable by later operations, it belongs in Core. If something is transient interaction behavior, hit testing, visual drawing, or UI policy, it belongs in Forge.

## Current denotational hierarchy

Core now distinguishes graph state from geometric meaning:

```ts
GraphNode = GeometryNode | AnnotationNode
AnnotationNode = SegmentMeasurementNode
```

Evaluated output mirrors that distinction:

```ts
EvaluatedSceneItem = EvaluatedGeometry | EvaluatedAnnotation
EvaluatedAnnotation = EvaluatedSegmentMeasurement
```

Use geometry-only helpers and predicates when a function really needs geometry. Do not teach every geometry consumer about every annotation case manually.

## Cyborg workflow conventions

The human often runs shell scripts pasted from chat. Prefer scripts that are safe, clear, and root-relative.

When a patch is uncertain, provide an inspection script first and wait for the output before providing a fix. Do not include a patch immediately after a sed/inspection command when the patch depends on seeing that output.

For shell snippets:

- Use `#!/usr/bin/env bash` and `set -euo pipefail`.
- Prefer Python scripts for multi-file edits.
- Keep scripts root-relative.
- Avoid writing or scanning `node_modules`, `dist`, and `.git`.
- Use braces around sed commands when practical, and pipe inspection output through the user's `xc` command only when explicitly requested.
- Put long terminal input into a shell script rather than many separate commands.
- End patch scripts with `npm run check:concise` unless the user asks for inspection only.
- Do not include `npm run check:concise` in source inspection dumps unless baseline output is explicitly useful.

## Patch style

Make small green slices. Prefer type-level seams over scattered stringly checks. When TypeScript reports fallout from a refactor, use the errors to identify real boundary mismatches rather than casting through them.

Avoid changing performance-sensitive pointermove or viewport motion paths unless necessary. The app should remain buttery during pointer movement, pan, zoom, and rotation.

## Current feature notes

Segment measurements are persistent Core annotation nodes, not global display toggles. Point label offsets are persistent authored visual notation stored on point-label-bearing nodes as screen-pixel offsets.

Interaction layers should treat annotations explicitly. Geometry hit testing remains geometry-first; annotation hit testing should be opt-in.
