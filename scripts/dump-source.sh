#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "# Euclid Forge source dump"
echo "# Generated: $(date -Iseconds)"
echo

print_section() {
  local title="$1"

  echo
  echo "================================================================================"
  echo "$title"
  echo "================================================================================"
  echo
}

include_file() {
  local file="$1"

  echo
  echo "================================================================================"
  echo "FILE: $file"
  echo "================================================================================"
  echo

  sed 's/\t/  /g' "$file"
}

print_tree() {
  print_section "PROJECT TREE"

  find . \
    \( \
      -path "./node_modules" \
      -o -path "./.git" \
      -o -path "./dist" \
      -o -path "./dist-ssr" \
      -o -path "./coverage" \
      -o -path "./test-results" \
      -o -path "./playwright-report" \
      -o -path "./.vite" \
      -o -path "./.cache" \
      -o -path "./.idea" \
      -o -path "./.vscode" \
      -o -path "./public" \
      -o -path "./src/assets" \
    \) -prune \
    -o \
    ! -name "package-lock.json" \
    ! -name "*.log" \
    -print \
    | sort
}

print_files_matching() {
  local title="$1"
  shift

  print_section "$title"

  find "$@" \
    -type f \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./dist/*" \
    ! -path "./dist-ssr/*" \
    ! -path "./coverage/*" \
    ! -path "./test-results/*" \
    ! -path "./playwright-report/*" \
    ! -path "./.vite/*" \
    ! -path "./.cache/*" \
    ! -path "./.idea/*" \
    ! -path "./.vscode/*" \
    ! -path "./public/*" \
    ! -path "./src/assets/*" \
    ! -name "package-lock.json" \
    ! -name "*.svg" \
    ! -name "*.png" \
    ! -name "*.jpg" \
    ! -name "*.jpeg" \
    ! -name "*.gif" \
    ! -name "*.webp" \
    ! -name "*.ico" \
    ! -name "*.map" \
    ! -name "*.log" \
    ! -name "*.tsbuildinfo" \
    | sort \
    | while read -r file; do
        include_file "$file"
      done
}

print_tree

print_files_matching "RUNTIME SOURCE FILES" \
  ./src \
  ! -name "*.test.ts" \
  ! -name "*.test.tsx" \
  ! -name "*.spec.ts" \
  ! -name "*.spec.tsx"

print_files_matching "UNIT TEST FILES" \
  ./src \
  \( \
    -name "*.test.ts" \
    -o -name "*.test.tsx" \
  \)

print_files_matching "SMOKE TEST FILES" \
  ./smoke

print_files_matching "PROJECT SCRIPTS" \
  ./scripts

print_files_matching "PROJECT CONFIG FILES" \
  . \
  -maxdepth 1 \
  \( \
    -name "index.html" \
    -o -name "package.json" \
    -o -name "tsconfig.json" \
    -o -name "tsconfig.*.json" \
    -o -name "vite.config.*" \
    -o -name "vitest.config.*" \
    -o -name "playwright.config.*" \
    -o -name ".gitignore" \
    -o -name ".npmrc" \
    -o -name ".nvmrc" \
    -o -name "README.md" \
  \)