import { readFileSync } from "node:fs";

const files = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/globals.css",
  "lib/content.ts",
  "README.md",
];

const requiredSnippets = [
  ["app/page.tsx", "aplicația creează direct video-ul final"],
  ["app/page.tsx", "Generează video-uri"],
  ["lib/content.ts", "renderPipeline"],
  ["README.md", "generate_video"],
];

let failed = false;

for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes("TODO")) {
    console.error(`${file}: remove TODO before shipping the MVP scaffold.`);
    failed = true;
  }
}

for (const [file, snippet] of requiredSnippets) {
  const content = readFileSync(file, "utf8");
  if (!content.includes(snippet)) {
    console.error(`${file}: missing required copy: ${snippet}`);
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("Static lint checks passed.");
