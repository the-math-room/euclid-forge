#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Forge docs dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_files "ROOT AND FORGE DOCS" docs apps/forge/docs packages/core/docs
dump_named_files "README FILES" README.md apps/forge/README.md packages/core/README.md
