import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.join(projectRoot, "dist");
const publicFiles = ["index.html", "styles.css", "script.js", "favicon.svg"];

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

for (const file of publicFiles) {
  copyFileSync(path.join(projectRoot, file), path.join(outputDirectory, file));
}

cpSync(path.join(projectRoot, "assets"), path.join(outputDirectory, "assets"), {
  recursive: true,
});

console.log(`Static site built in ${outputDirectory}`);
