#!/usr/bin/env bash
set -euo pipefail

OUT_DIR="${OUT_DIR:-.tmp/dumps}"
PACKET_DIR="$OUT_DIR/packets"

rm -rf "$PACKET_DIR"
mkdir -p "$PACKET_DIR"

scripts/dumps/dump-target docs > "$PACKET_DIR/01-docs.txt"
scripts/dumps/dump-target guardrails > "$PACKET_DIR/02-guardrails.txt"
scripts/dumps/dump-target core-api > "$PACKET_DIR/03-core-public-api.txt"
scripts/dumps/dump-target core-meaning > "$PACKET_DIR/04-core-meaning.txt"
scripts/dumps/dump-target core-representation > "$PACKET_DIR/05-core-representation.txt"
scripts/dumps/dump-target core-evaluation > "$PACKET_DIR/06-core-evaluation.txt"
scripts/dumps/dump-target app-shell > "$PACKET_DIR/07-forge-app-shell.txt"
scripts/dumps/dump-target app-commands > "$PACKET_DIR/08-forge-commands.txt"
scripts/dumps/dump-target app-tools > "$PACKET_DIR/09-forge-tools.txt"
scripts/dumps/dump-target interaction-rendering > "$PACKET_DIR/10-interaction-rendering.txt"
scripts/dumps/dump-target scripts-ci > "$PACKET_DIR/11-scripts-ci.txt"

cat > "$PACKET_DIR/00-brief.txt" <<'EOF_BRIEF'
Euclid Forge review packets

These packets are organized for source review without test files, smoke specs, fixture data, lockfiles, dependency metadata, or command output.

Suggested reading order:
01-docs
02-guardrails
03-core-public-api
04-core-meaning
05-core-representation
06-core-evaluation
07-forge-app-shell
08-forge-commands
09-forge-tools
10-interaction-rendering
11-scripts-ci

Separate opt-in targets:
- scripts/dumps/dump-target recent
- scripts/dumps/dump-target tests-core
- scripts/dumps/dump-target tests-forge
- scripts/dumps/dump-target smoke
- scripts/dumps/dump-target lockfiles
EOF_BRIEF

mkdir -p "$OUT_DIR"
(
  cd "$PACKET_DIR/.."
  zip -qr review-packets.zip packets
)

echo "Wrote packets to $PACKET_DIR"
echo "Wrote zip to $OUT_DIR/review-packets.zip"
ls -lh "$OUT_DIR/review-packets.zip"
