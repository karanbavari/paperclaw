import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { companies, companySkills, createDb } from "@kesarcloud/db";
import { marketplaceService } from "../services/marketplace.js";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";

const previousLocalRoot = process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
const previousRemoteUrl = process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres marketplace service tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describe("marketplaceService local fallback catalog", () => {
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    if (previousLocalRoot === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = previousLocalRoot;
    }
    if (previousRemoteUrl === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_URL = previousRemoteUrl;
    }
    await Promise.all(Array.from(cleanupDirs, (dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("parses awesome skill category markdown into marketplace categories and skills", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-"));
    cleanupDirs.add(root);
    await fs.mkdir(path.join(root, "categories"), { recursive: true });
    await fs.writeFile(
      path.join(root, "categories", "communication.md"),
      [
        "# Communication",
        "",
        "**2 skills**",
        "",
        "- [agent-mail](https://clawskills.sh/skills/rimelucci-agent-mail) - Email inbox for AI agents.",
        "- [github-skill](https://github.com/openclaw/skills/tree/main/skills/demo/github-skill) - GitHub backed skill.",
      ].join("\n"),
      "utf8",
    );
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    const categories = await svc.categories();

    expect(categories).toEqual(expect.arrayContaining([
      { id: "communication", name: "Communication", slug: "communication", skillCount: 2 },
      { id: "tools", name: "Tools", slug: "tools", skillCount: 5 },
    ]));
  });

  it("exposes bundled tool skills without a remote or local fallback catalog", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-empty-"));
    cleanupDirs.add(root);
    process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = root;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;

    const svc = marketplaceService({} as never);
    await expect(svc.categories()).resolves.toEqual([
      { id: "tools", name: "Tools", slug: "tools", skillCount: 5 },
    ]);
  });
});

describeEmbeddedPostgres("marketplaceService bundled tool skills", () => {
  let db!: ReturnType<typeof createDb>;
  let svc!: ReturnType<typeof marketplaceService>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-marketplace-service-");
    db = createDb(tempDb.connectionString);
    svc = marketplaceService(db);
  }, 20_000);

  afterEach(async () => {
    if (previousLocalRoot === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT = previousLocalRoot;
    }
    if (previousRemoteUrl === undefined) {
      delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    } else {
      process.env.PAPERCLAW_SKILL_MARKETPLACE_URL = previousRemoteUrl;
    }
    await db.delete(companySkills);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  async function createCompany() {
    const companyId = randomUUID();
    await db.insert(companies).values({
      id: companyId,
      name: "PaperClaw",
      issuePrefix: `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    return companyId;
  }

  it("lists bundled tool skills in the Tools category with preview metadata", async () => {
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    const companyId = await createCompany();

    const listed = await svc.list(companyId, { category: "tools", limit: 10 });
    expect(listed.nextCursor).toBeNull();
    expect(listed.items.map((item) => item.slug)).toEqual([
      "research-protocol-tools",
      "browser-automation-tools",
      "google-workspace-tools",
      "meta-ads-tools",
      "appointment-booking-tools",
    ]);
    expect(listed.items[0]).toMatchObject({
      id: "tools/research-protocol-tools",
      categorySlug: "tools",
      categoryName: "Tools",
      trustLevel: "markdown_only",
      installedSkillId: null,
    });

    const detail = await svc.detail(companyId, "tools/browser-automation-tools");
    expect(detail).toMatchObject({
      id: "tools/browser-automation-tools",
      slug: "browser-automation-tools",
      name: "Browser Automation Tools",
      categorySlug: "tools",
      categoryName: "Tools",
      trustLevel: "markdown_only",
    });
    expect(detail?.markdown).toContain("# Browser Automation Tools");
    expect(detail?.installNotes).toContain("Playwright MCP Browser Automation plugin");
    expect(detail?.installSource).toContain(path.join("marketplace", "skills", "tools", "browser-automation-tools"));
  });

  it("installs a bundled tool skill from its local package source", async () => {
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    const companyId = await createCompany();

    const installed = await svc.install(companyId, {
      skillId: "tools/browser-automation-tools",
      assignMode: "library_only",
    }, {
      actorType: "user",
      actorId: "test-user",
      agentId: null,
    });

    expect(installed.approval).toBeNull();
    expect(installed.assignedAgentIds).toEqual([]);
    expect(installed.skill).toMatchObject({
      slug: "browser-automation-tools",
      name: "browser-automation-tools",
      sourceType: "local_path",
      trustLevel: "markdown_only",
    });

    const detail = await svc.detail(companyId, "tools/browser-automation-tools");
    expect(detail?.installedSkillId).toBe(installed.skill?.id);
  });
});
