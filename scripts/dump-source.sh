#!/usr/bin/env bash
set -euo pipefail

# Legacy wrapper. Prefer scripts/dumps/dump-review.sh directly.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

exec scripts/dumps/dump-review.sh "$@"
