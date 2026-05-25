# AGENTS.md

## Purpose

This file describes how human/assistant collaboration works best in this repository. It is not product documentation; it is workflow guidance for making safe, reviewable code changes.

## Preferred workflow

Work in small, green steps.

Prefer targeted source dumps over full-repo dumps when investigating a focused problem. Use `scripts/dumps/dump-target help` to find available targets.

When proposing changes, state the intended behavior first, then provide the patch.

After changes, run:

```bash
scripts/checks.sh concise
```

Use broader checks only when needed.

## Patch format preferences

For Markdown/docs, prefer downloadable files or zips. Inline Markdown can break chat rendering.

For reasonably sized source files, a paste-to-terminal shell script that replaces the whole file is usually preferred.

For very large source files where the exact current source is known, a targeted patch script is acceptable.

For regex patches, use a safety-first flow:

1. Request or provide a quick `sed` / `nl -ba ... | sed` context command first.
2. Anchor on actual local helper names and nearby structure.
3. Prefer exact block replacement over clever broad patterns.
4. Include a count guard, usually “replace exactly one.”
5. Run format and concise checks afterward.

Avoid clever regex repairs for fragile syntax, brace structure, or test-file surgery. Prefer full-file or full-section replacement.

## Testing expectations

Use the repo’s check scripts rather than ad hoc commands when possible.

The usual verification command is:

```bash
scripts/checks.sh concise
```

When changing browser behavior, also expect smoke tests to matter.

## Interaction/product semantics to remember

Move mode is for selecting, dragging, and panning. It should not create points.

Point mode creates free points.

Shape tools may create free points as inputs when clicking empty space.

Viewport drag and keyboard pan are screen-relative, including after rotation.

Viewport motion for held pan/zoom/rotate keys is continuous and animation-frame driven.

## Communication style

Be direct about uncertainty.

Call out when a change is architectural versus just test expectation drift.

Prefer lessons-learned summaries after a multi-patch sequence.

When the assistant needs more context, ask for the smallest useful dump or `sed` range rather than the whole repo.
