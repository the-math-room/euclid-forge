import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT = join(ROOT, ".tmp", "euclid-core");

const PACKAGE_LAYERS = [
  "core",
  "view",
  "meaning",
  "representation",
  "evaluation",
  "geometry",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "src"), { recursive: true });

for (const layer of PACKAGE_LAYERS) {
  cpSync(join(ROOT, "src", layer), join(OUT, "src", layer), {
    recursive: true,
  });
}

writeFileSync(
  join(OUT, "package.json"),
  `${JSON.stringify(
    {
      name: "@euclid-forge/core-preview",
      version: "0.0.0",
      private: true,
      type: "module",
      exports: {
        ".": "./src/core/index.ts",
      },
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(OUT, "tsconfig.json"),
  `${JSON.stringify(
    {
      extends: "../../tsconfig.json",
      compilerOptions: {
        rootDir: "./src",
        noEmit: true,
      },
      include: ["src/**/*.ts"],
    },
    null,
    2,
  )}\n`,
);

const listed = run("node", ["scripts/list-core-package-files.mjs"])
  .trim()
  .split("\n")
  .filter(Boolean);

const staged = PACKAGE_LAYERS.map((layer) => `src/${layer}`);

console.log(`Staged ${listed.length} files into ${relative(ROOT, OUT)}`);
console.log("");
console.log("Package layers:");
for (const layer of staged) {
  console.log(`- ${layer}`);
}
console.log("");
console.log("Preview entrypoint:");
console.log("- src/core/index.ts");
console.log("");
console.log("Run isolated typecheck with:");
console.log("- npm run check:core-package");
