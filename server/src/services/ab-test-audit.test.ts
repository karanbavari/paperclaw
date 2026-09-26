import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { auditAbWorkspace } from "./ab-test-audit.js";

const roots: string[] = [];
afterAll(async () => {
  const { rm } = await import("node:fs/promises");
  for (const root of roots) await rm(root, { recursive: true, force: true });
});

describe("A/B project audit", () => {
  it("reads bounded product files without following secrets or symlinks", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ab-audit-"));
    roots.push(root);
    await mkdir(path.join(root, "docs"));
    await writeFile(path.join(root, "README.md"), "# Studio\nA workflow product for small design teams.\nAPI_KEY=readme-secret\n");
    await writeFile(path.join(root, ".env"), "API_KEY=private-value");
    await writeFile(path.join(root, "docs", "PRODUCT.md"), "# Product\nReview work in one place.");
    await symlink(path.join(root, ".env"), path.join(root, "docs", "pricing.md"));
    const audit = await auditAbWorkspace(root);
    expect(audit.report.files).toContain("README.md");
    expect(audit.report.files).toContain("docs/PRODUCT.md");
    expect(audit.report.files).not.toContain("docs/pricing.md");
    expect(audit.sourceSummary).not.toContain("private-value");
    expect(audit.sourceSummary).not.toContain("readme-secret");
    expect(await readFile(path.join(root, "README.md"), "utf8")).toContain("workflow product");
  });

  it("requires a meaningful manual description only when no safe files exist", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ab-empty-"));
    roots.push(root);
    await expect(auditAbWorkspace(root)).rejects.toThrow();
    const audit = await auditAbWorkspace(root, "A product described by the operator in enough detail");
    expect(audit.report.files).toHaveLength(0);
  });

  it("extracts only an unambiguous documented price", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "ab-price-"));
    roots.push(root);
    await writeFile(path.join(root, "README.md"), "# Product\nA scheduling tool for local teams.");
    await writeFile(path.join(root, "pricing.md"), "The plan costs $29/month.");
    expect((await auditAbWorkspace(root)).report.priceEvidence).toMatchObject({ productPrice: 29, currency: "USD", pricePeriod: "month" });
    await writeFile(path.join(root, "pricing.md"), "Starter $29/month and Pro $59/month.");
    expect((await auditAbWorkspace(root)).report.priceEvidence).toBeUndefined();
  });
});
