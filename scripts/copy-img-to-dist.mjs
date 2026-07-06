import { access, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const sourceDir = path.join(rootDir, "img");
const distDir = path.join(rootDir, "dist");
const targetDir = path.join(distDir, "img");

try {
  await access(sourceDir);
} catch {
  console.log("No img/ directory found. Skipping image copy.");
  process.exit(0);
}

await mkdir(distDir, { recursive: true });
await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });

console.log("Copied img/ to dist/img/.");
