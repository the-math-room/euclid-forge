#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"

echo "# Euclid Core source dump"
echo "# Generated: $(date -Iseconds)"
echo

echo
echo "================================================================================"
echo "PROJECT TREE"
echo "================================================================================"
echo

find . \
  -path "./.git" -prune -o \
  -path "./node_modules" -prune -o \
  -path "./dist" -prune -o \
  -path "./coverage" -prune -o \
  -path "./.tmp" -prune -o \
  -print | sort

echo
echo "================================================================================"
echo "SOURCE FILES"
echo "================================================================================"

find package.json tsconfig.json src scripts \
  -type f \
  \( -name "*.ts" -o -name "*.json" -o -name "*.sh" -o -name "*.mjs" \) \
  2>/dev/null | sort | while read -r file; do
    echo
    echo "================================================================================"
    echo "FILE: ./$file"
    echo "================================================================================"
    echo
    cat "$file"
  done