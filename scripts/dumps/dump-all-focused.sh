#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

OUT_DIR="${OUT_DIR:-.tmp/dumps}"
mkdir -p "$OUT_DIR"

scripts/dumps/dump-monorepo.sh > "$OUT_DIR/monorepo.txt"
scripts/dumps/dump-core-public-api.sh > "$OUT_DIR/core-public-api.txt"
scripts/dumps/dump-core-geometry.sh > "$OUT_DIR/core-geometry.txt"
scripts/dumps/dump-forge-app.sh > "$OUT_DIR/forge-app.txt"
scripts/dumps/dump-forge-interaction-rendering.sh > "$OUT_DIR/forge-interaction-rendering.txt"
scripts/dumps/dump-boundaries-and-imports.sh > "$OUT_DIR/boundaries-and-imports.txt"
scripts/dumps/dump-docs.sh > "$OUT_DIR/docs.txt"

echo "Wrote focused dumps to $OUT_DIR:"
ls -lh "$OUT_DIR"
