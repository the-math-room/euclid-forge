#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

source scripts/dumps/dump-common.sh

echo "# Euclid Forge boundary/import dump"
echo "# Generated: $(date -Iseconds)"
echo

dump_named_files "BOUNDARY AND IMPORT TOOLS" \
  scripts/check-boundaries.mjs \
  scripts/audit-core-imports.mjs \
  package.json \
  apps/forge/package.json \
  packages/core/package.json \
  packages/core/docs/boundaries.md \
  packages/core/docs/public-api.md \
  docs/core-import-audit.md

dump_header "CORE IMPORT AUDIT OUTPUT"
if [ -f scripts/audit-core-imports.mjs ]; then
  node scripts/audit-core-imports.mjs || true
else
  echo "scripts/audit-core-imports.mjs not found"
fi

dump_header "BOUNDARY CHECK OUTPUT"
if [ -f scripts/check-boundaries.mjs ]; then
  node scripts/check-boundaries.mjs || true
else
  echo "scripts/check-boundaries.mjs not found"
fi

dump_header "FORGE IMPORTS FROM CORE"
grep -RIn --include="*.ts" --include="*.tsx" "@euclid-forge/core" apps/forge/src || true
