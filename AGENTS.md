# AGENTS.md

## Purpose

This file describes how human/assistant collaboration works best in this repository. It is workflow guidance for making safe, reviewable changes, not product documentation.

## Preferred workflow

Work in small, green steps. Prefer targeted source dumps over full-repo dumps. Use `scripts/dumps/dump-target help` to find available targets.

When proposing changes, state the intended behavior first, then provide the patch. After changes, run:

```bash
scripts/checks.sh concise
```

Use broader checks only when needed.

## Source sharing workflow

The user usually pipes source dumps into a custom clipboard command:

```bash
... | xc
```

Use `| xc` in suggested dump commands. Ask for the smallest useful dump or `nl -ba ... | sed -n 'x,yp'` range rather than the whole repo.

## Patch format preferences

For Markdown/docs, prefer downloadable files or zips. Inline Markdown can break chat rendering.

For reasonably sized source files, a paste-to-terminal shell script that replaces the whole file is usually preferred. For very large source files where the exact current source is known, a targeted patch script is acceptable.

For regex patches, use a safety-first flow:

1. Request or provide a quick `sed` / `nl -ba ... | sed` context command first.
2. Anchor on actual local helper names and nearby structure.
3. Prefer exact block replacement over clever broad patterns.
4. Include a count guard, usually “replace exactly one.”
5. Run format and concise checks afterward.

Avoid clever regex repairs for fragile syntax, brace structure, or test-file surgery. Prefer full-file or full-section replacement.

## Testing expectations

Use the repo’s check scripts rather than ad hoc commands when possible.

```bash
scripts/checks.sh concise
npm run typecheck -w @euclid-forge/core
npm run typecheck -w euclid-forge
```

## Interaction/product semantics to remember

Move mode is for selecting, dragging, and panning. It should not create points. Point mode creates free points. Shape tools may create free points as inputs when clicking empty space. Viewport drag and keyboard pan are screen-relative, including after rotation. Viewport motion for held pan/zoom/rotate keys is continuous and animation-frame driven.

## Recent project state

Recent decisions that should be treated as current context:

- Lasso selection is app-side interaction. It selects fully contained visible selectable geometry; infinite lines are excluded from lasso containment.
- Labels render with translucent label pills for readability over geometry.
- The canvas has dark and high-contrast display modes plus incremental display scale for line/point/label size.
- Print output uses a print-only offscreen render/image path, not the live canvas, with a white-background print theme.
- Curve intersections suppress duplicate derived points when a candidate already coincides with an existing evaluated point.
- Circle-circle branch keys are stable relative to the directed center-to-center axis, not sorted by world coordinates.
- `PARALLEL_POINT` is a core constrained visible endpoint. A finite parallel segment is represented as `PARALLEL_POINT + SEGMENT`.
- Dragging a constrained endpoint updates its scalar offset through `MOVE_CONSTRAINED_POINT`; this is not a general constraint solver.
- Parallel chevrons are render-derived notation from transitive parallel families; they are not graph state.


## Communication style

Be direct about uncertainty. Call out when a change is architectural versus test expectation drift. Prefer lessons-learned summaries after a multi-patch sequence.
