#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Core geometry/evaluation dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_tree "CORE GEOMETRY TREE" \
  packages/core/src/meaning \
  packages/core/src/representation \
  packages/core/src/evaluation \
  packages/core/src/geometry

dump_files "CORE GEOMETRY SOURCES" \
  packages/core/src/meaning \
  packages/core/src/representation \
  packages/core/src/evaluation \
  packages/core/src/geometry
