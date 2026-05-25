#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Core public API dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_named_files "CORE PACKAGE AND PUBLIC DOCS" \
  packages/core/package.json \
  packages/core/README.md \
  packages/core/docs/public-api.md \
  packages/core/docs/boundaries.md \
  packages/core/src/core/index.ts \
  packages/core/src/core/engine.ts \
  packages/core/src/core/workspace.ts \
  packages/core/src/core/viewState.ts \
  packages/core/src/core/viewport.ts \
  packages/core/src/core/diagnostics.ts

dump_named_files "CORE PUBLIC API TESTS" \
  packages/core/src/core/index.test.ts \
  packages/core/src/core/coreApiSmoke.test.ts \
  packages/core/src/core/coreBoundary.test.ts \
  packages/core/src/core/engine.test.ts \
  packages/core/src/core/workspace.test.ts \
  packages/core/src/core/fixtureRunner.test.ts
