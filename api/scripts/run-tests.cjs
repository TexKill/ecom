const { readdirSync, statSync } = require("node:fs");
const { join, relative } = require("node:path");
const { spawnSync } = require("node:child_process");

const rootDir = join(__dirname, "..");
const srcDir = join(rootDir, "src");

const collectTestFiles = (dir) => {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
      continue;
    }

    if (entry.endsWith(".test.ts")) {
      files.push(relative(rootDir, fullPath));
    }
  }

  return files;
};

const testFiles = collectTestFiles(srcDir);

if (testFiles.length === 0) {
  console.error("No test files found under src");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["-r", "ts-node/register", "--test", ...testFiles],
  {
    cwd: rootDir,
    stdio: "inherit",
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
