import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, ".tmp", "euclid-core");

function run(command, args, cwd = ROOT) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(join(OUT, "tsconfig.json"))) {
  run("npm", ["run", "stage:core-package"]);
}

run("npx", ["tsc", "--noEmit", "-p", "tsconfig.json"], OUT);
