/** Rebrand prose in published Mintlify pages without touching historical repo docs. */
import fs from "node:fs";
import path from "node:path";

const docsRoot = path.resolve("docs");
const config = JSON.parse(fs.readFileSync(path.join(docsRoot, "docs.json"), "utf8"));
const pages = new Set();

function collect(value) {
  if (Array.isArray(value)) {
    for (const item of value) collect(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "pages" && Array.isArray(child)) {
      for (const page of child) {
        if (typeof page === "string") pages.add(page);
        else collect(page);
      }
    } else {
      collect(child);
    }
  }
}

collect(config.navigation);
let changed = 0;
for (const page of pages) {
  if (page === "start/what-is-paperclaw") continue; // Retain explicit upstream attribution.
  const file = [".mdx", ".md"].map((ext) => path.join(docsRoot, `${page}${ext}`))
    .find((candidate) => fs.existsSync(candidate));
  if (!file) continue;
  const source = fs.readFileSync(file, "utf8");
  const next = source.replace(/\bPaperclip\b(?! Cloud\b| Labs\b| AI\b)/g, "Paperclaw");
  if (next === source) continue;
  fs.writeFileSync(file, next);
  changed += 1;
}
console.log(`Rebranded ${changed} published docs pages.`);
