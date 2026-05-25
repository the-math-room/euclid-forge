#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-.tmp/dumps}"
mkdir -p "$OUT_DIR"

targets=(
  docs
  guardrails
  core-api
  core-geometry
  app-shell
  app-commands
  app-tools
  interaction-rendering
  scripts-ci
)

for target in "${targets[@]}"; do
  scripts/dumps/dump-target "$target" > "$OUT_DIR/$target.txt"
done

scripts/dumps/dump-review.sh > "$OUT_DIR/review.txt"
scripts/dumps/dump-packets.sh

echo "Wrote focused review dumps to $OUT_DIR:"
ls -lh "$OUT_DIR"
