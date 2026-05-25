#!/usr/bin/env bash
set -euo pipefail

profile="${1:-standard}"

run() {
  echo
  echo "== $* =="
  "$@"
}

case "$profile" in
  active-tool)
    run npm run test -w euclid-forge -- \
      src/app/activeTool.test.ts \
      src/app/toolSurface.test.ts \
      src/app/toolModeController.test.ts \
      src/app/appController.test.ts \
      src/app/history.test.ts
    run npm run check:boundaries
    run npm run audit:core-imports:quiet
    run npm run check:forge
    ;;

  core-delete)
    run npm run test -w @euclid-forge/core -- \
      src/representation/deletePolicy.test.ts \
      src/representation/edit.test.ts \
      src/core/engine.test.ts \
      src/core/coreApiSmoke.test.ts
    run npm run test -w euclid-forge -- \
      src/app/appController.test.ts \
      src/app/commands.test.ts \
      src/app/toolModeController.test.ts \
      src/app/history.test.ts
    run npm run check:boundaries
    run npm run audit:core-imports:quiet
    run npm run check:core
    run npm run check:forge
    ;;

  smoke)
    run npm run smoke -w euclid-forge
    ;;

  forge)
    run npm run check:boundaries
    run npm run audit:core-imports:quiet
    run npm run check:forge
    ;;

  core)
    run npm run check:boundaries
    run npm run check:core
    ;;

  standard)
    run npm run check:boundaries
    run npm run audit:core-imports:quiet
    run npm run check:core
    run npm run check:forge
    ;;

  concise)
    run npm run check:boundaries
    run npm run audit:core-imports:quiet
    run npm run typecheck -w @euclid-forge/core
    run npm run test -w @euclid-forge/core -- --reporter=dot
    run npm run typecheck -w euclid-forge
    run npm run test -w euclid-forge -- --reporter=dot
    run npm run smoke -w euclid-forge
    ;;

  full)
    run npm run check
    ;;

  *)
    echo "Unknown check profile: $profile" >&2
    echo >&2
    echo "Available profiles:" >&2
    echo "  active-tool" >&2
    echo "  core-delete" >&2
    echo "  smoke" >&2
    echo "  forge" >&2
    echo "  core" >&2
    echo "  standard" >&2
    echo "  concise" >&2
    echo "  full" >&2
    exit 1
    ;;
esac
