#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Forge app dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_tree "FORGE APP TREE" apps/forge/src apps/forge/smoke

dump_files "FORGE APP SOURCES" apps/forge/src apps/forge/smoke

dump_named_files "FORGE APP CONFIG" \
  apps/forge/package.json \
  apps/forge/index.html \
  apps/forge/vite.config.ts \
  apps/forge/vitest.config.ts \
  apps/forge/playwright.config.ts \
  apps/forge/README.md
