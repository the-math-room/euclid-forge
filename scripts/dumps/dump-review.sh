#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

dump_title "Euclid Forge full review dump"

cat <<'EOF_BRIEF'
This is a story-ordered source dump for reviewing Euclid Forge.

Reading order:
1. Repository brief, docs, and guardrails
2. Workspace/package/config shape
3. Core public API and headless geometry engine
4. Core meaning, representation, construction, evaluation, and edit semantics
5. Forge browser app state, runtime, commands, tool modes, interaction, and rendering
6. Scripts and CI/deploy

Architectural intent:
- packages/core is headless and math/graph-oriented.
- apps/forge is the browser/editor shell.
- Forge may import Core through the public root facade plus approved public family subpaths.
- Core must not import Forge or use DOM/canvas/browser APIs.

This default review dump intentionally excludes:
- test files
- smoke specs
- fixture/workspace test data
- lockfiles
- dependency metadata
- command/test output

For focused data, use:
- scripts/dumps/dump-target tests-core
- scripts/dumps/dump-target tests-forge
- scripts/dumps/dump-target smoke
- scripts/dumps/dump-target recent
EOF_BRIEF

dump_tree "REPOSITORY TREE" .

dump_files "REPO DOCS AND ARCHITECTURE NOTES" \
  README.md \
  docs/core-import-audit.md \
  packages/core/README.md \
  packages/core/docs/public-api.md \
  packages/core/docs/boundaries.md \
  packages/core/docs/architecture.md \
  packages/core/docs/denotational-model.md \
  packages/core/docs/feature-workflow.md \
  apps/forge/README.md \
  apps/forge/docs/architecture.md \
  apps/forge/docs/denotational-geometry-direction.md \
  apps/forge/docs/feature-workflow.md \
  apps/forge/docs/monorepo-boundary-checklist.md

dump_files "WORKSPACE AND TOOLING CONFIG" \
  package.json \
  tsconfig.base.json \
  packages/core/package.json \
  packages/core/tsconfig.json \
  apps/forge/package.json \
  apps/forge/tsconfig.json \
  apps/forge/vite.config.ts \
  apps/forge/vitest.config.ts \
  apps/forge/playwright.config.ts

dump_files "CORE PUBLIC API AND FACADE" \
  packages/core/src/core/index.ts \
  packages/core/src/core/engine.ts \
  packages/core/src/core/workspace.ts \
  packages/core/src/core/viewState.ts \
  packages/core/src/core/viewport.ts \
  packages/core/src/core/diagnostics.ts

dump_find_files "CORE MEANING LAYER" \
  packages/core/src/meaning

dump_find_files "CORE REPRESENTATION AND EDIT SEMANTICS" \
  packages/core/src/representation

dump_find_files "CORE GEOMETRY REGISTRY AND EVALUATION" \
  packages/core/src/geometry \
  packages/core/src/evaluation

dump_files "FORGE APP ENTRY, STATE, RUNTIME, AND TRANSITIONS" \
  apps/forge/src/app/main.ts \
  apps/forge/src/app/appState.ts \
  apps/forge/src/app/appRuntime.ts \
  apps/forge/src/app/appTransition.ts \
  apps/forge/src/app/transitionEffects.ts \
  apps/forge/src/app/canvasSurface.ts \
  apps/forge/src/app/buildInfo.ts \
  apps/forge/src/app/statusSurface.ts \
  apps/forge/src/app/domEvents.ts

dump_files "FORGE COMMANDS, HISTORY, WORKSPACE, AND INITIAL SCENE" \
  apps/forge/src/app/commands.ts \
  apps/forge/src/app/history.ts \
  apps/forge/src/app/workspace.ts \
  apps/forge/src/app/workspaceActions.ts \
  apps/forge/src/app/workspaceFiles.ts \
  apps/forge/src/app/initialScene.ts

dump_files "FORGE MODAL TOOLS AND POINTER BEHAVIOR" \
  apps/forge/src/app/appController.ts \
  apps/forge/src/app/activeTool.ts \
  apps/forge/src/app/activeToolPointer.ts \
  apps/forge/src/app/toolSurface.ts \
  apps/forge/src/app/pointerIntent.ts \
  apps/forge/src/app/dragState.ts \
  apps/forge/src/app/freePointDrag.ts \
  apps/forge/src/app/selectionPredicates.ts \
  apps/forge/src/app/effectiveVisibility.ts \
  apps/forge/src/app/zOrder.ts \
  apps/forge/src/app/keyboardShortcuts.ts \
  apps/forge/src/app/viewportMotion.ts \
  apps/forge/src/app/renderScheduler.ts

dump_find_files "FORGE INTERACTION LAYER" \
  apps/forge/src/interaction

dump_find_files "FORGE RENDERING AND STYLES" \
  apps/forge/src/rendering \
  apps/forge/src/styles

dump_files "GUARDRAILS, DUMPS, CHECKS, AND CI" \
  scripts/check-boundaries.mjs \
  scripts/audit-core-imports.mjs \
  scripts/checks.sh \
  .github/workflows/pages.yml

dump_find_files "DUMP SCRIPTS" \
  scripts/dumps
