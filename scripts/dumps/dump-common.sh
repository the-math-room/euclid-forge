#!/usr/bin/env bash
set -euo pipefail

DUMP_WIDTH="${DUMP_WIDTH:-96}"

sanitize_dump_output() {
  local home_dir="${HOME:-}"

  if [ -n "$home_dir" ]; then
    sed -E "s|\x1B\[[0-9;]*[A-Za-z]||g; s|$home_dir|~|g"
  else
    sed -E "s|\x1B\[[0-9;]*[A-Za-z]||g"
  fi
}

dump_title() {
  local title="$1"
  echo
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '='
  echo "$title"
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '='
  echo
}

dump_section() {
  local title="$1"
  echo
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '-'
  echo "$title"
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '-'
  echo
}

dump_file() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return 0
  fi

  echo
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '='
  echo "FILE: ./$file"
  printf '%*s\n' "$DUMP_WIDTH" '' | tr ' ' '='
  echo
  cat "$file" | sanitize_dump_output
  echo
}

dump_files() {
  local title="$1"
  shift

  dump_section "$title"

  for file in "$@"; do
    dump_file "$file"
  done
}

dump_find_files() {
  local title="$1"
  shift

  dump_section "$title"

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
      -name "*.yml" -o \
      -name "*.yaml" -o \
      -name "*.sh" \
    \) \
    -not -name "*.test.ts" \
    -not -name "*.spec.ts" \
    -not -name "package-lock.json" \
    -not -name "*.zip" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/coverage/*" \
    -not -path "*/test-results/*" \
    -not -path "*/playwright-report/*" \
    -not -path "*/.vite/*" \
    -not -path "*/.cache/*" \
    -not -path "*/.tmp/*" \
    | sort \
    | while read -r file; do
        dump_file "$file"
      done
}

dump_find_all_files() {
  local title="$1"
  shift

  dump_section "$title"

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
      -name "*.yml" -o \
      -name "*.yaml" -o \
      -name "*.sh" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/coverage/*" \
    -not -path "*/test-results/*" \
    -not -path "*/playwright-report/*" \
    -not -path "*/.vite/*" \
    -not -path "*/.cache/*" \
    -not -path "*/.tmp/*" \
    | sort \
    | while read -r file; do
        dump_file "$file"
      done
}

dump_tree() {
  local title="$1"
  shift

  dump_section "$title"

  find "$@" \
    -path "*/.git" -prune -o \
    -path "*/node_modules" -prune -o \
    -path "*/dist" -prune -o \
    -path "*/coverage" -prune -o \
    -path "*/test-results" -prune -o \
    -path "*/playwright-report" -prune -o \
    -path "*/.vite" -prune -o \
    -path "*/.cache" -prune -o \
    -path "*/.tmp" -prune -o \
    -name "package-lock.json" -prune -o \
    -name "*.zip" -prune -o \
    -name "*.test.ts" -prune -o \
    -name "*.spec.ts" -prune -o \
    -print | sort | sanitize_dump_output
  echo
}

dump_command() {
  local title="$1"
  shift

  dump_section "$title"
  NO_COLOR=1 FORCE_COLOR=0 "$@" 2>&1 | sanitize_dump_output || true
  echo
}
