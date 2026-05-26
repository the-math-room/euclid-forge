# Euclid Forge LLM Handoff Note

You are joining an active TypeScript geometry app project called **Euclid Forge**. Treat the source dump and docs as the primary truth. This note is recent-context glue: it explains design decisions, workflow preferences, and feature state that may not be obvious from the source alone.

## Project Shape

Euclid Forge is a canvas-based dynamic geometry tool for classroom geometry. The architecture intentionally separates:

- **Core**: mathematical meaning, graph representation, construction helpers, graph edits, dependency inspection, evaluation, diagnostics, serialization, and headless viewport math.
- **Forge app**: browser interaction, DOM/pointer/keyboard handling, modal tools, commands, canvas rendering, visual notation, styling, print/display behavior, and smoke tests.

The guiding rule is:

> If it is a real mathematical object that should survive save/load, participate in dependency evaluation, or be usable by later constructions, it belongs in Core. If it is user interaction, browser adaptation, visual notation, display theme, or rendering derived from meaning, it belongs in Forge.

Core should remain browser-free and UI-free. Forge may adapt Core concepts to the browser.

## Current Feature State: Parallel and Perpendicular

Parallel and perpendicular finite construction now share a single Core denotation:

```text
LINEAR_CONSTRAINED_POINT(reference, anchor, mode, offset)
SEGMENT(anchor, constrainedPoint)
````

where:

```text
mode = "PARALLEL" | "PERPENDICULAR"
```

This is **dynamic construction**, not a general constraint solver.

A constrained endpoint is visible and draggable. Dragging it does not solve arbitrary constraints or move unrelated geometry. Instead, `MOVE_CONSTRAINED_POINT` projects the drag target onto the declared constraint axis and updates the point’s signed scalar `offset`.

Important implementation notes:

- The shared direction helper lives in `packages/core/src/geometry/linearConstraint.ts`.
- `parallelSegmentConstruction(...)` and `perpendicularSegmentConstruction(...)` are Core construction helpers exported through the Core facade.
- Forge should import app-facing Core helpers through `@euclid-forge/core`, not through internal Core paths.
- `PARALLEL_POINT` is obsolete. Do not reintroduce it.
- Old `PP_...` ids were replaced by mode-specific constrained-point ids such as `LP_...` for parallel and `OP_...` for perpendicular.

## Rendering and Visual Notation

Parallel chevrons are **render-derived Forge notation**, not Core graph state.

They are computed from transitive families of `LINEAR_CONSTRAINED_POINT` nodes with `mode: "PARALLEL"` and rendered on associated line/segment geometry. They now render slightly off the exact midpoint to avoid high-traffic geometry/label areas.

Perpendicular visual notation has **not** been added yet. If added, it should also be Forge rendering notation, not Core semantic state.

## UX State

The app has toolbar/modal support for:

- Move
- Lasso
- Point
- Segment
- Parallel
- Perp
- Circle
- Triangle
- Delete

The Perp tool follows the same modal input shape as Parallel:

1. Choose a reference segment or line.
2. Choose an anchor point, or click empty canvas to create one.
3. Forge creates a finite perpendicular segment as constrained endpoint + ordinary segment.

Keyboard commands include:

- `P` for parallel segment from selected segment/line + point.
- `O` for perpendicular segment from the same selected-input shape.

## Recent Architecture Cleanup

Shared app helper names were cleaned up so internals say “linear constrained” where the code supports both parallel and perpendicular. User-facing labels still say “Parallel” and “Perpendicular” where appropriate.

The boundary checks were strengthened. Core now rejects a broader set of browser globals and Forge presentation concepts, including things like DOM/canvas/browser APIs, `RenderTheme`, `parallelMark`, toolbar concepts, pointer capture, and smoke-test concepts.

The current validation closeout was green:

- Core import audit passed with no discouraged or unknown imports.
- Boundary check passed.
- Core typecheck/tests passed.
- Forge typecheck/tests passed.
- Smoke tests passed, including a Perp toolbar construction smoke test.

## Performance / Interaction Sensitivity

The app is performance-sensitive and currently feels smooth. Avoid changes that cause extra React-style rerender loops or unnecessary graph evaluation during pointermove.

Be especially careful around:

- pointermove
- drag behavior
- viewport pan/zoom/rotation
- render scheduling
- lasso feedback
- canvas repaint frequency

Viewport pan/zoom/rotation use a smoothed viewport motion path. Preserve that feel.

## Product Decisions to Preserve

Do **not** introduce a general constraint solver yet.

Parallel and perpendicular are construction objects, not arbitrary constraints between existing lines. The preferred UX is a visible constrained endpoint that lives exactly where the segment endpoint appears. Avoid hidden/off-line projected handles.

Infinite lines are mathematically valid but awkward for classroom UX. Finite constrained segments are preferred for parallel/perpendicular-style construction.

Lasso selects fully contained visible selectable geometry. Infinite lines are excluded because full containment is not meaningful.

Curve-intersection duplicate prevention should skip new derived intersection points that coincide with existing evaluated point positions.

Circle-circle branch ordering should remain stable relative to directed circle centers, not world y/x sorting.

## Denotational Boundary Reminders

Core should own:

- geometry node kinds
- graph edits
- construction helpers
- dependency semantics
- evaluation behavior
- headless math helpers
- serialization-visible meaning

Forge should own:

- DOM events
- pointer intent
- keyboard shortcuts
- toolbar/status UI
- rendering and visual notation
- display themes
- print image generation
- smoke tests

Do not move parallel chevrons, future perpendicular square marks, label pills, rendering themes, or browser workflow concepts into Core.

## Workflow Preferences

The user often runs patches by pasting an executable shell script into `scripts/patch.sh`. Despite the name, it is just a shell script, not a patch parser.

Preferred patch style:

```bash
#!/usr/bin/env bash
set -euo pipefail

python3 <<'PY'
# focused multi-file edits
PY

npm run check:concise
```

Use `python3`, not `python`.

For tricky edits, inspect first. Use a standalone script that prints to stdout rather than huge terminal one-liners. Example:

```bash
cat > /tmp/euclid-forge-inspect.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

nl -ba path/to/file.ts | sed -n '120,180p'
SH

bash /tmp/euclid-forge-inspect.sh
```

If asking for inspection first, do **not** also provide the patch in the same response unless explicitly confident and saying so. The user does not want to read diagnostic output for the assistant.

For markdown/doc updates, prefer downloadable Markdown files or zips rather than huge Markdown code blocks in chat, because large Markdown source tends to break the UI.

For large TypeScript replacements, a downloadable clean `.ts` file is acceptable. For reasonably sized changes, a shell script that replaces the whole file is okay.

Regex patches are acceptable when careful, but do a quick `nl -ba ... | sed -n 'x,yp'` shape check first if the target may be brittle.

The user has a custom clipboard command `xc`, but for long inspections a script that prints to stdout is preferred so terminal history is not clogged.

## Validation Commands

Primary validation:

```bash
npm run check:concise
```

Useful focused checks:

```bash
npm run typecheck -w @euclid-forge/core
npm run typecheck -w euclid-forge
npm run audit:core-imports:quiet
npm run check:boundaries
```

Smoke tests:

```bash
npm run smoke -w euclid-forge
```

## Likely Next Work

Good next tasks:

1. Add right-angle/perpendicular visual notation in Forge rendering only.
2. Consider visual distinction for constrained endpoints if classroom UX needs it.
3. Prune or merge overlapping boundary docs, if desired.
4. Continue architectural cleanup only when a real seam appears; avoid premature generic constraint abstractions.

For right-angle notation, keep the same principle as parallel chevrons: Core provides semantic graph/evaluation state; Forge derives visual notation from evaluated graph meaning.
