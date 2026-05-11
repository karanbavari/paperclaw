import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { companies, companySkills, createDb } from "@kesarcloud/db";
import type {
  MarketplaceCapabilityPackDetail,
  MarketplacePluginDetail,
  MarketplaceSkillDetail,
} from "@kesarcloud/shared";
import { marketplaceService } from "../services/marketplace.js";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";

const previousMarketplaceUrl = process.env.PAPERCLAW_MARKETPLACE_URL;
const previousSkillMarketplaceUrl = process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres marketplace service tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

function restoreMarketplaceEnv() {
  if (previousMarketplaceUrl === undefined) {
    delete process.env.PAPERCLAW_MARKETPLACE_URL;
  } else {
    process.env.PAPERCLAW_MARKETPLACE_URL = previousMarketplaceUrl;
  }
  if (previousSkillMarketplaceUrl === undefined) {
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
  } else {
    process.env.PAPERCLAW_SKILL_MARKETPLACE_URL = previousSkillMarketplaceUrl;
  }
}

function skillListItem(skill: MarketplaceSkillDetail) {
  const { markdown: _markdown, installNotes: _installNotes, ...listItem } = skill;
  return listItem;
}

function pluginListItem(plugin: MarketplacePluginDetail) {
  const { markdown: _markdown, installNotes: _installNotes, ...listItem } = plugin;
  return listItem;
}

function packListItem(pack: MarketplaceCapabilityPackDetail) {
  const { markdown: _markdown, installNotes: _installNotes, checklist: _checklist, ...listItem } = pack;
  return listItem;
}

function json(response: http.ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function startMarketplaceApi(catalog: {
  skills?: MarketplaceSkillDetail[];
  plugins?: MarketplacePluginDetail[];
  packs?: MarketplaceCapabilityPackDetail[];
}) {
  const skills = catalog.skills ?? [];
  const plugins = catalog.plugins ?? [];
  const packs = catalog.packs ?? [];
  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);

    if (url.pathname === "/skills/categories") {
      return json(response, 200, [{ id: "tools", slug: "tools", name: "Tools", skillCount: skills.length }]);
    }
    if (url.pathname === "/plugins/categories") {
      return json(response, 200, [{ id: "tools", slug: "tools", name: "Tools", pluginCount: plugins.length }]);
    }
    if (url.pathname === "/packs/categories") {
      return json(response, 200, [{ id: "tools", slug: "tools", name: "Tools", packCount: packs.length }]);
    }

    if (parts[0] === "skills" && parts.length === 1) {
      return json(response, 200, { items: skills.map(skillListItem), nextCursor: null });
    }
    if (parts[0] === "plugins" && parts.length === 1) {
      return json(response, 200, { items: plugins.map(pluginListItem), nextCursor: null });
    }
    if (parts[0] === "packs" && parts.length === 1) {
      return json(response, 200, { items: packs.map(packListItem), nextCursor: null });
    }

    if (parts[0] === "skills" && parts.length >= 2) {
      const id = parts.slice(1).join("/");
      const skill = skills.find((item) => item.id === id || item.slug === id);
      return skill ? json(response, 200, skill) : json(response, 404, { error: "not found" });
    }
    if (parts[0] === "plugins" && parts.length >= 2) {
      const id = parts.slice(1).join("/");
      const plugin = plugins.find((item) => item.id === id || item.slug === id || item.packageName === id);
      return plugin ? json(response, 200, plugin) : json(response, 404, { error: "not found" });
    }
    if (parts[0] === "packs" && parts.length >= 2) {
      const id = parts.slice(1).join("/");
      const pack = packs.find((item) => item.id === id || item.slug === id);
      return pack ? json(response, 200, pack) : json(response, 404, { error: "not found" });
    }

    return json(response, 404, { error: "not found" });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

async function createTempSkill(slug: string) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "paperclaw-marketplace-skill-"));
  const skillDir = path.join(root, slug);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(
    path.join(skillDir, "SKILL.md"),
    [
      "---",
      `name: ${slug}`,
      `description: ${slug} test skill`,
      "---",
      "",
      `# ${slug}`,
      "",
      "Follow the test workflow.",
    ].join("\n"),
    "utf8",
  );
  return { root, skillDir };
}

function makeSkill(overrides: Partial<MarketplaceSkillDetail> = {}): MarketplaceSkillDetail {
  const slug = overrides.slug ?? "demo-research-skill";
  return {
    id: overrides.id ?? `tools/${slug}`,
    slug,
    name: overrides.name ?? "Demo Research Skill",
    description: overrides.description ?? "A marketplace skill from the private API.",
    categorySlug: overrides.categorySlug ?? "tools",
    categoryName: overrides.categoryName ?? "Tools",
    sourceUrl: overrides.sourceUrl ?? null,
    installSource: overrides.installSource ?? null,
    trustLevel: overrides.trustLevel ?? "markdown_only",
    tags: overrides.tags ?? ["research"],
    installedSkillId: overrides.installedSkillId ?? null,
    markdown: overrides.markdown ?? "# Demo Research Skill\n\nUse the private marketplace API.",
    installNotes: overrides.installNotes ?? null,
  };
}

function makePlugin(overrides: Partial<MarketplacePluginDetail> = {}): MarketplacePluginDetail {
  return {
    id: overrides.id ?? "demo-plugin",
    slug: overrides.slug ?? "demo-plugin",
    name: overrides.name ?? "Demo Plugin",
    description: overrides.description ?? "A marketplace plugin from the private API.",
    categorySlug: overrides.categorySlug ?? "tools",
    categoryName: overrides.categoryName ?? "Tools",
    packageName: overrides.packageName ?? "@paperclaw/demo-plugin",
    version: overrides.version ?? "0.1.0",
    sourceType: overrides.sourceType ?? "npm",
    localPath: overrides.localPath ?? null,
    tags: overrides.tags ?? ["demo"],
    capabilities: overrides.capabilities ?? ["demo.tool"],
    toolCount: overrides.toolCount ?? 1,
    uiSlotCount: overrides.uiSlotCount ?? 0,
    jobCount: overrides.jobCount ?? 0,
    webhookCount: overrides.webhookCount ?? 0,
    installedPluginId: overrides.installedPluginId ?? null,
    installedStatus: overrides.installedStatus ?? null,
    markdown: overrides.markdown ?? "# Demo Plugin",
    installNotes: overrides.installNotes ?? null,
  };
}

function makePack(overrides: Partial<MarketplaceCapabilityPackDetail> = {}): MarketplaceCapabilityPackDetail {
  return {
    id: overrides.id ?? "tools/demo-research-pack",
    slug: overrides.slug ?? "demo-research-pack",
    name: overrides.name ?? "Demo Research Pack",
    description: overrides.description ?? "A capability pack from the private API.",
    categorySlug: overrides.categorySlug ?? "tools",
    categoryName: overrides.categoryName ?? "Tools",
    tags: overrides.tags ?? ["research"],
    plugin: overrides.plugin ?? null,
    skills: overrides.skills ?? [{ id: "tools/demo-research-skill", name: "Demo Research Skill", installedId: null, status: null }],
    defaultAssignMode: overrides.defaultAssignMode ?? "library_only",
    installed: overrides.installed ?? false,
    needsSetup: overrides.needsSetup ?? true,
    markdown: overrides.markdown ?? "# Demo Research Pack",
    installNotes: overrides.installNotes ?? null,
    checklist: overrides.checklist ?? [],
  };
}

describeEmbeddedPostgres("marketplaceService API-backed catalog", () => {
  const cleanupDirs = new Set<string>();
  const cleanupServers = new Set<{ close: () => Promise<void> }>();
  let db!: ReturnType<typeof createDb>;
  let svc!: ReturnType<typeof marketplaceService>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-marketplace-service-");
    db = createDb(tempDb.connectionString);
    svc = marketplaceService(db);
  }, 20_000);

  afterEach(async () => {
    restoreMarketplaceEnv();
    await Promise.all(Array.from(cleanupServers, (server) => server.close()));
    cleanupServers.clear();
    await Promise.all(Array.from(cleanupDirs, (dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
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

  async function useCatalog(catalog: {
    skills?: MarketplaceSkillDetail[];
    plugins?: MarketplacePluginDetail[];
    packs?: MarketplaceCapabilityPackDetail[];
  }) {
    const api = await startMarketplaceApi(catalog);
    cleanupServers.add(api);
    process.env.PAPERCLAW_MARKETPLACE_URL = api.baseUrl;
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    return api;
  }

  it("returns empty marketplace surfaces when the private API is unavailable", async () => {
    process.env.PAPERCLAW_MARKETPLACE_URL = "http://127.0.0.1:1";
    delete process.env.PAPERCLAW_SKILL_MARKETPLACE_URL;
    const companyId = await createCompany();

    await expect(svc.categories()).resolves.toEqual([]);
    await expect(svc.pluginCategories()).resolves.toEqual([]);
    await expect(svc.packCategories()).resolves.toEqual([]);
    await expect(svc.list(companyId, { limit: 10 })).resolves.toEqual({ items: [], nextCursor: null });
    await expect(svc.pluginList(companyId, { limit: 10 })).resolves.toEqual({ items: [], nextCursor: null });
    await expect(svc.packList(companyId, { limit: 10 })).resolves.toEqual({ items: [], nextCursor: null });
    await expect(svc.detail(companyId, "tools/missing")).resolves.toBeNull();
    await expect(svc.pluginDetail(companyId, "missing")).resolves.toBeNull();
    await expect(svc.packDetail(companyId, "missing")).resolves.toBeNull();
  });

  it("fetches skills, plugins, and packs from the private marketplace API", async () => {
    await useCatalog({
      skills: [makeSkill()],
      plugins: [makePlugin()],
      packs: [makePack({ plugin: { id: "demo-plugin", name: "Demo Plugin", installedId: null, status: null } })],
    });
    const companyId = await createCompany();

    await expect(svc.categories()).resolves.toEqual([{ id: "tools", slug: "tools", name: "Tools", skillCount: 1 }]);
    await expect(svc.pluginCategories()).resolves.toEqual([{ id: "tools", slug: "tools", name: "Tools", pluginCount: 1 }]);
    await expect(svc.packCategories()).resolves.toEqual([{ id: "tools", slug: "tools", name: "Tools", packCount: 1 }]);

    const skills = await svc.list(companyId, { category: "tools", limit: 10 });
    expect(skills.items).toHaveLength(1);
    expect(skills.items[0]).toMatchObject({
      id: "tools/demo-research-skill",
      name: "Demo Research Skill",
      installedSkillId: null,
    });

    const plugins = await svc.pluginList(companyId, { category: "tools", limit: 10 });
    expect(plugins.items[0]).toMatchObject({
      id: "demo-plugin",
      packageName: "@paperclaw/demo-plugin",
      installedPluginId: null,
    });

    const pack = await svc.packDetail(companyId, "tools/demo-research-pack");
    expect(pack).toMatchObject({
      id: "tools/demo-research-pack",
      plugin: { id: "demo-plugin", installedId: null },
      skills: [{ id: "tools/demo-research-skill", installedId: null }],
      installed: false,
    });
    expect(pack?.checklist.some((item) => item.key === "skill-demo-research-skill")).toBe(true);
  });

  it("installs a remote marketplace skill from the API installSource", async () => {
    const { root, skillDir } = await createTempSkill("demo-research-skill");
    cleanupDirs.add(root);
    await useCatalog({ skills: [makeSkill({ installSource: skillDir })] });
    const companyId = await createCompany();

    const installed = await svc.install(companyId, {
      skillId: "tools/demo-research-skill",
      assignMode: "library_only",
    }, {
      actorType: "user",
      actorId: "test-user",
      agentId: null,
    });

    expect(installed.approval).toBeNull();
    expect(installed.skill).toMatchObject({
      slug: "demo-research-skill",
      name: "demo-research-skill",
      sourceType: "local_path",
      sourceLocator: skillDir,
    });

    const detail = await svc.detail(companyId, "tools/demo-research-skill");
    expect(detail?.installedSkillId).toBe(installed.skill?.id);
  });

  it("installs a skill-only capability pack from the private marketplace API", async () => {
    const { root, skillDir } = await createTempSkill("demo-research-skill");
    cleanupDirs.add(root);
    await useCatalog({
      skills: [makeSkill({ installSource: skillDir })],
      packs: [makePack()],
    });
    const companyId = await createCompany();

    const installed = await svc.installPack(companyId, {
      packId: "tools/demo-research-pack",
      assignMode: "library_only",
    }, {
      actorType: "user",
      actorId: "test-user",
      agentId: null,
    });

    expect(installed.plugin).toBeNull();
    expect(installed.approval).toBeNull();
    expect(installed.skills).toHaveLength(1);
    expect(installed.skills[0]).toMatchObject({
      slug: "demo-research-skill",
      sourceType: "local_path",
    });
    expect(installed.checklist.find((item) => item.key === "skill-assignment")?.status).toBe("done");

    const detail = await svc.packDetail(companyId, "tools/demo-research-pack");
    expect(detail?.skills[0]?.installedId).toBe(installed.skills[0]?.id);
  });

  it("requires plugin install dependencies for plugin-backed capability packs", async () => {
    await useCatalog({
      plugins: [makePlugin()],
      packs: [makePack({ plugin: { id: "demo-plugin", name: "Demo Plugin", installedId: null, status: null } })],
    });
    const companyId = await createCompany();

    await expect(svc.installPack(companyId, {
      packId: "tools/demo-research-pack",
      assignMode: "library_only",
    }, {
      actorType: "user",
      actorId: "test-user",
      agentId: null,
    })).rejects.toThrow(/Marketplace plugin install is not available/);
  });
});
