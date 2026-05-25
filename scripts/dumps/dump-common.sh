#!/usr/bin/env bash

set -euo pipefail

dump_header() {
  local title="$1"
  echo
  echo "================================================================================"
  echo "$title"
  echo "================================================================================"
  echo
}

dump_tree() {
  local title="$1"
  shift

  dump_header "$title"
  find "$@" \
    -path "*/.git" -prune -o \
    -path "*/node_modules" -prune -o \
    -path "*/dist" -prune -o \
    -path "*/dist-ssr" -prune -o \
    -path "*/coverage" -prune -o \
    -path "*/test-results" -prune -o \
    -path "*/playwright-report" -prune -o \
    -path "*/.vite" -prune -o \
    -path "*/.cache" -prune -o \
    -path "*/.tmp" -prune -o \
    -print | sort
}

dump_files() {
  local title="$1"
  shift

  dump_header "$title"

  find "$@" \
    -type f \
    \( \
      -name "*.ts" -o \
      -name "*.tsx" -o \
      -name "*.js" -o \
      -name "*.mjs" -o \
      -name "*.json" -o \
      -name "*.md" -o \
      -name "*.css" -o \
      -name "*.html" -o \
      -name "*.sh" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/dist-ssr/*" \
    -not -path "*/coverage/*" \
    -not -path "*/test-results/*" \
    -not -path "*/playwright-report/*" \
    -not -path "*/.vite/*" \
    -not -path "*/.cache/*" \
    -not -path "*/.tmp/*" \
    | sort \
    | while read -r file; do
        echo
        echo "================================================================================"
        echo "FILE: ./$file"
        echo "================================================================================"
        echo
        cat "$file"
      done
}

dump_named_files() {
  local title="$1"
  shift

  dump_header "$title"

  for file in "$@"; do
    if [ -f "$file" ]; then
      echo
      echo "================================================================================"
      echo "FILE: ./$file"
      echo "================================================================================"
      echo
      cat "$file"
    fi
  done
}
