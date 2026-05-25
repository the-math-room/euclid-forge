# Source review dumps

These scripts generate source packets for code review.

## Full review

Use this for a broad architectural review of the repo:

```bash
scripts/dumps/dump-review.sh > /tmp/euclid-forge-review.txt
```

The default review dump excludes tests, smoke specs, fixture data, lockfiles, dependency metadata, and command output.

## Packet zip

Use this when a structured archive is easier to inspect:

```bash
scripts/dumps/dump-packets.sh
```

Outputs:

```text
.tmp/dumps/packets/
.tmp/dumps/review-packets.zip
```

## Targeted review

Use this when only one area is relevant:

```bash
scripts/dumps/dump-target app-tools > /tmp/app-tools.txt
scripts/dumps/dump-target core-geometry > /tmp/core-geometry.txt
scripts/dumps/dump-target guardrails > /tmp/guardrails.txt
```

See all targets:

```bash
scripts/dumps/dump-target help
```

## Opt-in test/check data

The default review dumps intentionally skip test and command output. Use explicit targets when those are relevant:

```bash
scripts/dumps/dump-target recent > /tmp/recent-checks.txt
scripts/dumps/dump-target tests-core > /tmp/core-tests.txt
scripts/dumps/dump-target tests-forge > /tmp/forge-tests.txt
scripts/dumps/dump-target smoke > /tmp/smoke.txt
scripts/dumps/dump-target lockfiles > /tmp/lockfiles.txt
```

## All focused packets

```bash
scripts/dumps/dump-all-focused.sh
```

Outputs go to:

```text
.tmp/dumps/
```

## Legacy wrappers

These older entrypoints now delegate to the source review dump system:

```bash
scripts/dump-source.sh
packages/core/scripts/dump-source.sh
```

Mappings:

```text
scripts/dump-source.sh                → scripts/dumps/dump-review.sh
packages/core/scripts/dump-source.sh  → scripts/dumps/dump-target core-geometry
```

Prefer the explicit `scripts/dumps/*` commands in new workflows.

## Output hygiene

Review dumps should avoid leaking local machine details. Command-output targets sanitize the user's home directory to `~` and strip ANSI control sequences.

Default review dumps should remain source-focused and should not include routine test output.

