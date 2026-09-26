import fs from "node:fs/promises";
import path from "node:path";
import { unprocessable } from "../errors.js";

const SKIP_DIRS = new Set([".git", ".paperclaw", "node_modules", "dist", "build", "coverage", ".next", ".cache", "vendor", "tmp"]);
const SAFE_EXTENSIONS = new Set([".md", ".mdx", ".json", ".html", ".tsx", ".jsx", ".vue", ".svelte"]);
const RELEVANT_NAME = /^(readme|product|pricing|features|overview|about|landing|home|index|app|package)([.\-_]|$)/i;
const SENSITIVE_NAME = /(^|[.\-_])(secret|credential|token|private|password|keyfile|lock)([.\-_]|$)|^\.env/i;
const MAX_VISITED = 240;
const MAX_FILES = 16;
const MAX_TOTAL_CHARS = 16_000;

function redact(text: string) {
  return text
    .replace(/(api[_-]?key|access[_-]?token|password|secret)\s*[:=]\s*["']?[^\s"',]+/gi, "$1=[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/-----BEGIN [\s\S]*?PRIVATE KEY-----[\s\S]*?-----END [\s\S]*?PRIVATE KEY-----/g, "[redacted private key]");
}

export async function auditAbWorkspace(cwd: string, extraContext = "") {
  const root = await fs.realpath(cwd).catch(() => { throw unprocessable("Project directory is unavailable"); });
  const candidates: Array<{ relative: string; priority: number }> = [];
  let visited = 0;

  async function visit(relative: string, depth: number): Promise<void> {
    if (depth > 4 || visited >= MAX_VISITED) return;
    const entries = await fs.readdir(path.join(root, relative), { withFileTypes: true }).catch(() => []);
    entries.sort((a, b) => Number(b.isFile()) - Number(a.isFile()) || a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (++visited > MAX_VISITED) break;
      if (entry.name.startsWith(".") || SENSITIVE_NAME.test(entry.name) || entry.isSymbolicLink()) continue;
      const child = path.join(relative, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name.toLowerCase()) && depth < 4) await visit(child, depth + 1);
        continue;
      }
      if (!entry.isFile() || !SAFE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      if (!RELEVANT_NAME.test(entry.name) && !/^(doc|docs|src|ui|app|pages)(\/|$)/i.test(relative)) continue;
      const priority = /(^|\/)readme\.md$/i.test(child) ? 0
        : /(^|\/)(product|pricing|features|overview)\./i.test(child) ? 1
          : /(^|\/)package\.json$/i.test(child) ? 2 : 3;
      candidates.push({ relative: child, priority });
    }
  }
  await visit("", 0);
  candidates.sort((a, b) => a.priority - b.priority || a.relative.localeCompare(b.relative));
  const files: string[] = [];
  const chunks: string[] = [];
  const priceCandidates: Array<{ productPrice: number; currency: string; pricePeriod: "month" | "year" | "one_time"; sourcePath: string }> = [];
  let multiplePrices = false;
  let remaining = MAX_TOTAL_CHARS;
  for (const candidate of candidates) {
    if (files.length >= MAX_FILES || remaining < 200) break;
    const absolute = path.resolve(root, candidate.relative);
    const real = await fs.realpath(absolute).catch(() => null);
    if (!real || !real.startsWith(`${root}${path.sep}`)) continue;
    const stat = await fs.stat(real).catch(() => null);
    if (!stat?.isFile() || stat.size > 48_000) continue;
    const content = await fs.readFile(real, "utf8").catch(() => "");
    if (!content || content.includes("\0")) continue;
    const excerpt = redact(content).slice(0, Math.min(3_000, remaining));
    files.push(candidate.relative.split(path.sep).join("/"));
    if (/pricing/i.test(candidate.relative)) {
      const prices = [...excerpt.matchAll(/(?<symbol>\$|₹|€|£)\s*(?<amount>\d+(?:\.\d{1,2})?)\s*(?:\/|per\s+)(?<period>month|mo|year|yr)\b/gi)];
      if (prices.length === 1) {
        const match = prices[0]!;
        const currency = ({ "$": "USD", "₹": "INR", "€": "EUR", "£": "GBP" } as Record<string, string>)[match.groups?.symbol ?? ""];
        const period = /^m/i.test(match.groups?.period ?? "") ? "month" : "year";
        if (currency) priceCandidates.push({ productPrice: Number(match.groups?.amount), currency, pricePeriod: period, sourcePath: files.at(-1)! });
      }
      if (prices.length > 1) multiplePrices = true;
    }
    chunks.push(`### ${files.at(-1)}\n${excerpt}`);
    remaining -= excerpt.length;
  }
  if (files.length === 0 && extraContext.trim().length < 20) {
    throw unprocessable("No readable product context was found. Add a README or provide optional product context.");
  }
  const sourceSummary = chunks.join("\n\n");
  const lead = chunks.find((chunk) => /readme|product|overview/i.test(chunk.split("\n")[0] ?? "")) ?? chunks[0] ?? "";
  const summary = lead.replace(/^### [^\n]+\n/, "").replace(/^#+\s*/gm, "").replace(/\s+/g, " ").slice(0, 500)
    || extraContext.trim().slice(0, 500);
  const warnings = [
    ...(files.length === 0 ? ["No project files were suitable for analysis; preview relies on your optional context."] : []),
    ...(multiplePrices || priceCandidates.length > 1 ? ["Multiple prices were found; choose the specific offer price if budget fit matters."] : []),
    "Synthetic audience details are assumptions, not verified customer data.",
  ];
  return { sourceSummary, report: { summary, files, warnings, priceEvidence: !multiplePrices && priceCandidates.length === 1 ? priceCandidates[0] : undefined } };
}
