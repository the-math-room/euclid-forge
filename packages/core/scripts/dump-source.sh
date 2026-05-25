#!/usr/bin/env bash
set -euo pipefail

# Legacy wrapper. Prefer the root dump targets directly:
#   scripts/dumps/dump-target core-geometry
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT"

exec scripts/dumps/dump-target core-geometry "$@"
