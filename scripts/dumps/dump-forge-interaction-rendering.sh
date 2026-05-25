#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Forge interaction/rendering dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_tree "INTERACTION AND RENDERING TREE" \
  apps/forge/src/app \
  apps/forge/src/interaction \
  apps/forge/src/rendering \
  apps/forge/src/styles \
  apps/forge/src/testHelpers

dump_files "INTERACTION AND RENDERING SOURCES" \
  apps/forge/src/app \
  apps/forge/src/interaction \
  apps/forge/src/rendering \
  apps/forge/src/styles \
  apps/forge/src/testHelpers
