/**
 * Repeatable customer-facing copy pass for upstream UI merges.
 * It edits only literal text nodes, never identifiers, imports, or API keys.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import tsPackage from "typescript";

// TypeScript 7's public package currently exposes only its version and CLI.
// Find a parser-equipped compatibility install in the existing pnpm store.
let ts = tsPackage;
if (typeof ts.createSourceFile !== "function") {
  const store = path.resolve("node_modules/.pnpm");
  const compatible = fs.readdirSync(store).find((name) => /^typescript@5\./.test(name));
  if (!compatible) throw new Error("A parser-equipped TypeScript 5.x install is required for this codemod.");
  const modulePath = path.join(store, compatible, "node_modules/typescript/lib/typescript.js");
  ts = (await import(pathToFileURL(modulePath).href)).default;
}

const root = path.resolve("ui/src");
const candidates = [];

function visitDirectory(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "__tests__" && entry.name !== "fixtures") visitDirectory(absolute);
    } else if (/\.tsx?$/.test(entry.name) && !/\.(test|spec|stories)\.tsx?$/.test(entry.name)
      && path.relative(root, absolute) !== "lib/successful-run-handoff.ts") {
      candidates.push(absolute);
    }
  }
}

function rebrand(text) {
  return text.replace(/\bPaperclip\b(?! Cloud\b| Labs\b| AI\b)/g, "Paperclaw");
}

visitDirectory(root);
let changed = 0;
for (const file of candidates) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes("Paperclip")) continue;
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node) || ts.isJsxText(node)) {
      const start = node.getStart(tree);
      const end = node.end;
      const original = source.slice(start, end);
      const replacement = rebrand(original);
      if (replacement !== original) edits.push({ start, end, replacement });
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!edits.length) continue;
  let next = source;
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    next = next.slice(0, edit.start) + edit.replacement + next.slice(edit.end);
  }
  fs.writeFileSync(file, next);
  changed += 1;
}
console.log(`Rebranded literal copy in ${changed} UI files.`);
