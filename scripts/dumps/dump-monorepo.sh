#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Forge monorepo overview dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_tree "PROJECT TREE" .

dump_named_files "ROOT CONFIG AND DOCS" \
  package.json \
  package-lock.json \
  tsconfig.base.json \
  README.md \
  scripts/check-boundaries.mjs \
  scripts/audit-core-imports.mjs

dump_named_files "WORKSPACE CONFIGS" \
  apps/forge/package.json \
  apps/forge/tsconfig.json \
  apps/forge/vite.config.ts \
  apps/forge/vitest.config.ts \
  apps/forge/playwright.config.ts \
  apps/forge/README.md \
  packages/core/package.json \
  packages/core/tsconfig.json \
  packages/core/README.md
