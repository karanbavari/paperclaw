import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { and, eq } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import { approvals, companies } from "@kesarcloud/db";
import {
  marketplaceCapabilityPackCategorySchema,
  marketplaceCapabilityPackDetailSchema,
  marketplaceCapabilityPackListResponseSchema,
  marketplacePluginCategorySchema,
  marketplacePluginDetailSchema,
  marketplacePluginListResponseSchema,
  marketplaceSkillCategorySchema,
  marketplaceSkillDetailSchema,
  marketplaceSkillListResponseSchema,
  type MarketplaceCapabilityPackCategory,
  type MarketplaceCapabilityPackChecklistItem,
  type MarketplaceCapabilityPackComponent,
  type MarketplaceCapabilityPackDetail,
  type MarketplaceCapabilityPackInstallRequest,
  type MarketplaceCapabilityPackInstallResult,
  type MarketplaceCapabilityPackListItem,
  type MarketplaceCapabilityPackListResponse,
  type MarketplaceInstallRequest,
  type MarketplaceInstallResult,
  type MarketplacePluginCategory,
  type MarketplacePluginDetail,
  type MarketplacePluginInstallRequest,
  type MarketplacePluginInstallResult,
  type MarketplacePluginListItem,
  type MarketplacePluginListResponse,
  type MarketplaceSkillCategory,
  type MarketplaceSkillDetail,
  type MarketplaceSkillListItem,
  type MarketplaceSkillListResponse,
} from "@kesarcloud/shared";
import {
  readPaperClawSkillSyncPreference,
  writePaperClawSkillSyncPreference,
} from "@kesarcloud/adapter-utils/server-utils";
import { notFound, unprocessable } from "../errors.js";
import { agentService } from "./agents.js";
import { approvalService } from "./approvals.js";
import { companySkillService } from "./company-skills.js";
import { pluginRegistryService } from "./plugin-registry.js";
import type { pluginLoader } from "./plugin-loader.js";
import type { pluginLifecycleManager } from "./plugin-lifecycle.js";

type MarketplaceQuery = {
  q?: string | null;
  category?: string | null;
  limit?: number | null;
  cursor?: string | null;
};

type InstallActor = {
  actorType: "user" | "agent" | "system";
  actorId: string | null;
  agentId: string | null;
};

type CompanySkillRow = {
  id: string;
  key: string;
  slug: string;
  sourceLocator: string | null;
  metadata?: Record<string, unknown> | null;
};

type MarketplacePluginDeps = {
  loader?: ReturnType<typeof pluginLoader>;
  lifecycle?: ReturnType<typeof pluginLifecycleManager>;
};

const DEFAULT_MARKETPLACE_BASE_URL = "http://127.0.0.1:8086";
const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 200;
const execFileAsync = promisify(execFile);

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "skill";
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parsePositiveInt(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(parsed)));
}

function resolveMarketplaceBaseUrl() {
  return asString(process.env.PAPERCLAW_MARKETPLACE_URL)
    ?? asString(process.env.PAPERCLAW_SKILL_MARKETPLACE_URL)
    ?? DEFAULT_MARKETPLACE_BASE_URL;
}

function buildMarketplaceUrl(pathname: string, query?: MarketplaceQuery) {
  const baseUrl = resolveMarketplaceBaseUrl().replace(/\/+$/, "");
  const url = new URL(`${baseUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`);
  if (query?.q) url.searchParams.set("q", query.q);
  if (query?.category) url.searchParams.set("category", query.category);
  if (query?.limit) url.searchParams.set("limit", String(parsePositiveInt(query.limit, DEFAULT_LIMIT)));
  if (query?.cursor) url.searchParams.set("cursor", query.cursor);
  return url.toString();
}

async function fetchMarketplaceJson(pathname: string, query?: MarketplaceQuery): Promise<unknown | null> {
  try {
    const response = await fetch(buildMarketplaceUrl(pathname, query), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

function parseSkillCategories(json: unknown): MarketplaceSkillCategory[] {
  const rawItems = Array.isArray(json)
    ? json
    : Array.isArray((json as { categories?: unknown[] } | null)?.categories)
      ? (json as { categories: unknown[] }).categories
      : [];
  return rawItems
    .map((item) => marketplaceSkillCategorySchema.safeParse(item))
    .filter((item): item is { success: true; data: MarketplaceSkillCategory } => item.success)
    .map((item) => item.data);
}

function parsePluginCategories(json: unknown): MarketplacePluginCategory[] {
  const rawItems = Array.isArray(json)
    ? json
    : Array.isArray((json as { categories?: unknown[] } | null)?.categories)
      ? (json as { categories: unknown[] }).categories
      : [];
  return rawItems
    .map((item) => marketplacePluginCategorySchema.safeParse(item))
    .filter((item): item is { success: true; data: MarketplacePluginCategory } => item.success)
    .map((item) => item.data);
}

function parsePackCategories(json: unknown): MarketplaceCapabilityPackCategory[] {
  const rawItems = Array.isArray(json)
    ? json
    : Array.isArray((json as { categories?: unknown[] } | null)?.categories)
      ? (json as { categories: unknown[] }).categories
      : [];
  return rawItems
    .map((item) => marketplaceCapabilityPackCategorySchema.safeParse(item))
    .filter((item): item is { success: true; data: MarketplaceCapabilityPackCategory } => item.success)
    .map((item) => item.data);
}

function parseSkillList(json: unknown): MarketplaceSkillListResponse {
  const parsed = marketplaceSkillListResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { items: [], nextCursor: null };
}

function parsePluginList(json: unknown): MarketplacePluginListResponse {
  const parsed = marketplacePluginListResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { items: [], nextCursor: null };
}

function parsePackList(json: unknown): MarketplaceCapabilityPackListResponse {
  const parsed = marketplaceCapabilityPackListResponseSchema.safeParse(json);
  if (parsed.success) return parsed.data;
  return { items: [], nextCursor: null };
}

function parseSkillDetail(json: unknown): MarketplaceSkillDetail | null {
  const parsed = marketplaceSkillDetailSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function parsePluginDetail(json: unknown): MarketplacePluginDetail | null {
  const parsed = marketplacePluginDetailSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function parsePackDetail(json: unknown): MarketplaceCapabilityPackDetail | null {
  const parsed = marketplaceCapabilityPackDetailSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function resolveLocalPluginPath(localPath: string | null) {
  if (!localPath) return null;
  return path.isAbsolute(localPath) ? localPath : path.resolve(process.cwd(), localPath);
}

function installedMatch(skill: MarketplaceSkillListItem, companySkill: CompanySkillRow) {
  return companySkill.metadata?.marketplaceSkillId === skill.id
    || (skill.installSource && companySkill.sourceLocator === skill.installSource)
    || (skill.sourceUrl && companySkill.sourceLocator === skill.sourceUrl)
    || companySkill.key === `catalog/${skill.categorySlug}/${skill.slug}`
    || companySkill.key === `catalog/${skill.slug}`
    || companySkill.slug === skill.slug;
}

function withInstallState<T extends MarketplaceSkillListItem>(
  items: T[],
  companySkills: CompanySkillRow[],
): T[] {
  return items.map((item) => {
    const installed = companySkills.find((skill) => installedMatch(item, skill));
    return { ...item, installedSkillId: installed?.id ?? null };
  });
}

function packSkillInstalledMatch(component: MarketplaceCapabilityPackComponent, companySkill: CompanySkillRow) {
  const slug = component.id.split("/").filter(Boolean).pop() ?? slugify(component.name);
  return companySkill.metadata?.marketplaceSkillId === component.id
    || companySkill.key === `catalog/${component.id}`
    || companySkill.key.endsWith(`/${slug}`)
    || companySkill.slug === component.id
    || companySkill.slug === slug;
}

function buildPluginSettingsHref(installedPluginId: string | null) {
  return installedPluginId ? `/instance/settings/plugins/${installedPluginId}` : "/instance/settings/plugins";
}

function buildSkillHref(installedSkillId: string | null) {
  return installedSkillId ? `/skills/${installedSkillId}` : "/skills";
}

function updateChecklistItem(
  item: MarketplaceCapabilityPackChecklistItem,
  plugin: MarketplaceCapabilityPackComponent | null,
  packSkills: MarketplaceCapabilityPackComponent[],
): MarketplaceCapabilityPackChecklistItem {
  if (item.key === "plugin-installed") {
    return {
      ...item,
      status: plugin?.installedId ? "done" : "needs_action",
      href: item.href ?? buildPluginSettingsHref(plugin?.installedId ?? null),
    };
  }
  if (item.key === "plugin-ready") {
    return {
      ...item,
      status: plugin?.status === "ready" ? "done" : "needs_action",
      href: item.href ?? buildPluginSettingsHref(plugin?.installedId ?? null),
    };
  }
  if (item.key.startsWith("skill-")) {
    const slug = item.key.replace(/^skill-/, "");
    const skill = packSkills.find((component) =>
      component.id === slug
      || component.id.endsWith(`/${slug}`)
      || slugify(component.name) === slug,
    );
    if (skill) {
      return {
        ...item,
        status: skill.installedId ? "done" : "needs_action",
        href: item.href ?? buildSkillHref(skill.installedId),
      };
    }
  }
  return item;
}

function buildDefaultChecklist(
  plugin: MarketplaceCapabilityPackComponent | null,
  packSkills: MarketplaceCapabilityPackComponent[],
): MarketplaceCapabilityPackChecklistItem[] {
  const checklist: MarketplaceCapabilityPackChecklistItem[] = [];
  if (plugin) {
    checklist.push({
      key: "plugin-installed",
      label: `${plugin.name} plugin installed`,
      status: plugin.installedId ? "done" : "needs_action",
      required: true,
      href: buildPluginSettingsHref(plugin.installedId),
    });
    checklist.push({
      key: "plugin-ready",
      label: "Plugin loaded and ready",
      status: plugin.status === "ready" ? "done" : "needs_action",
      required: true,
      href: buildPluginSettingsHref(plugin.installedId),
    });
    checklist.push({
      key: "plugin-settings",
      label: "Review plugin settings and credentials",
      status: "needs_action",
      required: false,
      href: buildPluginSettingsHref(plugin.installedId),
    });
  }
  for (const skill of packSkills) {
    const slug = skill.id.split("/").filter(Boolean).pop() ?? slugify(skill.name);
    checklist.push({
      key: `skill-${slug}`,
      label: `${skill.name} skill installed`,
      status: skill.installedId ? "done" : "needs_action",
      required: true,
      href: buildSkillHref(skill.installedId),
    });
  }
  checklist.push({
    key: "skill-assignment",
    label: "Attach installed skills to selected agents",
    status: "needs_action",
    required: false,
    href: "/agents/all",
  });
  return checklist;
}

export function marketplaceService(db: Db, deps: MarketplacePluginDeps = {}) {
  const agents = agentService(db);
  const approvalsSvc = approvalService(db);
  const skills = companySkillService(db);
  const pluginRegistry = pluginRegistryService(db);

  async function fetchCatalogCategories(): Promise<MarketplaceSkillCategory[]> {
    return parseSkillCategories(await fetchMarketplaceJson("/skills/categories"));
  }

  async function fetchCatalogSkills(query: MarketplaceQuery): Promise<MarketplaceSkillListResponse> {
    return parseSkillList(await fetchMarketplaceJson("/skills", query));
  }

  async function fetchCatalogDetail(skillId: string): Promise<MarketplaceSkillDetail | null> {
    return parseSkillDetail(await fetchMarketplaceJson(`/skills/${encodeURIComponent(skillId)}`));
  }

  async function fetchPluginCategories(): Promise<MarketplacePluginCategory[]> {
    return parsePluginCategories(await fetchMarketplaceJson("/plugins/categories"));
  }

  async function fetchPlugins(query: MarketplaceQuery): Promise<MarketplacePluginListResponse> {
    return parsePluginList(await fetchMarketplaceJson("/plugins", query));
  }

  async function fetchPluginDetail(pluginId: string): Promise<MarketplacePluginDetail | null> {
    return parsePluginDetail(await fetchMarketplaceJson(`/plugins/${encodeURIComponent(pluginId)}`));
  }

  async function fetchPackCategories(): Promise<MarketplaceCapabilityPackCategory[]> {
    return parsePackCategories(await fetchMarketplaceJson("/packs/categories"));
  }

  async function fetchPacks(query: MarketplaceQuery): Promise<MarketplaceCapabilityPackListResponse> {
    return parsePackList(await fetchMarketplaceJson("/packs", query));
  }

  async function fetchPackDetail(packId: string): Promise<MarketplaceCapabilityPackDetail | null> {
    return parsePackDetail(await fetchMarketplaceJson(`/packs/${encodeURIComponent(packId)}`));
  }

  function withPluginInstallState<T extends MarketplacePluginListItem>(items: T[], installedPlugins: Awaited<ReturnType<typeof pluginRegistry.listInstalled>>): T[] {
    return items.map((item) => {
      const resolvedLocalPath = resolveLocalPluginPath(item.localPath);
      const installed = installedPlugins.find((plugin) =>
        plugin.pluginKey === item.id
        || plugin.packageName === item.packageName
        || (item.localPath && plugin.packagePath === item.localPath)
        || (resolvedLocalPath && plugin.packagePath === resolvedLocalPath)
        || plugin.manifestJson?.displayName === item.name,
      );
      return {
        ...item,
        localPath: resolvedLocalPath ?? item.localPath,
        installedPluginId: installed?.id ?? null,
        installedStatus: installed?.status ?? null,
      };
    });
  }

  function enrichPackPlugin(
    plugin: MarketplaceCapabilityPackComponent | null,
    installedPlugins: Awaited<ReturnType<typeof pluginRegistry.listInstalled>>,
  ): MarketplaceCapabilityPackComponent | null {
    if (!plugin) return null;
    const installed = installedPlugins.find((record) =>
      record.pluginKey === plugin.id
      || record.packageName === plugin.id
      || record.manifestJson?.displayName === plugin.name,
    );
    return {
      ...plugin,
      installedId: installed?.id ?? plugin.installedId ?? null,
      status: installed?.status ?? plugin.status ?? null,
    };
  }

  function enrichPackSkills(
    packSkills: MarketplaceCapabilityPackComponent[],
    companySkills: CompanySkillRow[],
  ): MarketplaceCapabilityPackComponent[] {
    return packSkills.map((skill) => {
      const installed = companySkills.find((companySkill) => packSkillInstalledMatch(skill, companySkill));
      return {
        ...skill,
        installedId: installed?.id ?? skill.installedId ?? null,
        status: installed ? "installed" : skill.status ?? null,
      };
    });
  }

  async function enrichPackListItem(companyId: string, pack: MarketplaceCapabilityPackListItem): Promise<MarketplaceCapabilityPackListItem> {
    const [installedPlugins, companySkills] = await Promise.all([
      pluginRegistry.listInstalled(),
      skills.list(companyId),
    ]);
    const plugin = enrichPackPlugin(pack.plugin, installedPlugins);
    const packSkills = enrichPackSkills(pack.skills, companySkills);
    const pluginInstalled = !plugin || Boolean(plugin.installedId);
    const skillsInstalled = packSkills.every((skill) => Boolean(skill.installedId));
    return {
      ...pack,
      plugin,
      skills: packSkills,
      installed: pluginInstalled && skillsInstalled,
      needsSetup: pack.needsSetup || Boolean(plugin?.installedId && plugin.status !== "ready"),
    };
  }

  async function enrichPackDetail(companyId: string, pack: MarketplaceCapabilityPackDetail): Promise<MarketplaceCapabilityPackDetail> {
    const enriched = await enrichPackListItem(companyId, pack);
    const baseChecklist = pack.checklist.length > 0
      ? pack.checklist.map((item) => updateChecklistItem(item, enriched.plugin, enriched.skills))
      : buildDefaultChecklist(enriched.plugin, enriched.skills);
    const pluginReady = !enriched.plugin || enriched.plugin.status === "ready";
    const requiredDone = baseChecklist
      .filter((item) => item.required)
      .every((item) => item.status === "done");
    return marketplaceCapabilityPackDetailSchema.parse({
      ...enriched,
      installed: enriched.installed && pluginReady && requiredDone,
      needsSetup: baseChecklist.some((item) => item.status !== "done" && !item.required),
      markdown: pack.markdown,
      installNotes: pack.installNotes,
      checklist: baseChecklist,
    });
  }

  async function buildLocalPluginIfNeeded(plugin: MarketplacePluginDetail) {
    const localPath = resolveLocalPluginPath(plugin.localPath);
    if (plugin.sourceType !== "bundled" || !localPath) return;
    const packageJsonPath = path.join(localPath, "package.json");
    const packageJson = await fs.readFile(packageJsonPath, "utf8")
      .then((content) => JSON.parse(content) as Record<string, unknown>)
      .catch(() => null);
    const manifestPath = typeof packageJson?.paperclawPlugin === "object" && packageJson.paperclawPlugin !== null
      ? (packageJson.paperclawPlugin as Record<string, unknown>).manifest
      : null;
    const resolvedManifestPath = typeof manifestPath === "string"
      ? path.resolve(localPath, manifestPath)
      : null;
    if (resolvedManifestPath && await fs.stat(resolvedManifestPath).then((stat) => stat.isFile()).catch(() => false)) {
      return;
    }
    await execFileAsync("pnpm", ["--dir", localPath, "build"], {
      timeout: 120_000,
      maxBuffer: 1_000_000,
    });
  }

  async function installPlugin(_companyId: string, request: MarketplacePluginInstallRequest): Promise<MarketplacePluginInstallResult> {
    if (!deps.loader || !deps.lifecycle) {
      throw unprocessable("Marketplace plugin install is not available in this server context");
    }
    const detail = await fetchPluginDetail(request.pluginId);
    if (!detail) throw notFound("Marketplace plugin not found");
    const localPath = resolveLocalPluginPath(detail.localPath);

    const existing = (await pluginRegistry.listInstalled()).find((plugin) =>
      plugin.packageName === detail.packageName
      || (detail.localPath && plugin.packagePath === detail.localPath)
      || (localPath && plugin.packagePath === localPath)
      || plugin.pluginKey === detail.id,
    );
    if (existing) {
      return { plugin: existing, warnings: ["Plugin is already installed."] };
    }

    await buildLocalPluginIfNeeded({ ...detail, localPath });

    const discovered = await deps.loader.installPlugin({
      localPath: localPath ?? undefined,
      packageName: localPath ? undefined : detail.packageName,
      version: localPath ? undefined : detail.version ?? undefined,
    });

    if (!discovered.manifest) {
      throw unprocessable("Plugin installed but manifest is missing");
    }

    const installed = await pluginRegistry.getByKey(discovered.manifest.id);
    if (!installed) {
      throw unprocessable("Plugin installed but was not found in registry");
    }

    await deps.lifecycle.load(installed.id);
    const updated = await pluginRegistry.getById(installed.id);
    return {
      plugin: updated ?? installed,
      warnings: [],
    };
  }

  async function findCompany(companyId: string) {
    return db.select().from(companies).where(eq(companies.id, companyId)).then((rows) => rows[0] ?? null);
  }

  async function resolveAssignmentTargets(companyId: string, request: MarketplaceInstallRequest) {
    const companyAgents = await agents.list(companyId);
    const eligible = companyAgents.filter((agent) => agent.status !== "terminated" && agent.status !== "pending_approval");
    if (request.assignMode === "library_only") return [];
    if (request.assignMode === "ceo") {
      const ceo = eligible.find((agent) => agent.role === "ceo");
      return ceo ? [ceo] : [];
    }
    if (request.assignMode === "all_agents") return eligible;
    const requested = new Set(request.agentIds ?? []);
    return eligible.filter((agent) => requested.has(agent.id));
  }

  async function assignSkillToAgents(companyId: string, skillKey: string, request: MarketplaceInstallRequest, actor: InstallActor) {
    const targets = await resolveAssignmentTargets(companyId, request);
    const assignedAgentIds: string[] = [];
    for (const agent of targets) {
      const current = readPaperClawSkillSyncPreference(agent.adapterConfig as Record<string, unknown>);
      const nextDesired = Array.from(new Set([...current.desiredSkills, skillKey]));
      if (nextDesired.length === current.desiredSkills.length && nextDesired.every((item, index) => item === current.desiredSkills[index])) {
        assignedAgentIds.push(agent.id);
        continue;
      }
      await agents.update(agent.id, {
        adapterConfig: writePaperClawSkillSyncPreference(agent.adapterConfig as Record<string, unknown>, nextDesired),
      }, {
        recordRevision: {
          createdByAgentId: actor.agentId,
          createdByUserId: actor.actorType === "user" ? actor.actorId : null,
          source: "marketplace-skill-install",
        },
      });
      assignedAgentIds.push(agent.id);
    }
    return assignedAgentIds;
  }

  async function installNow(companyId: string, request: MarketplaceInstallRequest, actor: InstallActor): Promise<MarketplaceInstallResult> {
    const detail = await fetchCatalogDetail(request.skillId);
    if (!detail) throw notFound("Marketplace skill not found");
    const warnings: string[] = [];
    let imported = null as Awaited<ReturnType<typeof skills.createCatalogSkill>> | null;
    if (detail.installSource) {
      try {
        const result = await skills.importFromSource(companyId, detail.installSource);
        imported = result.imported[0] ?? null;
        warnings.push(...result.warnings);
      } catch (error) {
        warnings.push(error instanceof Error ? error.message : String(error));
      }
    }
    if (!imported) {
      imported = await skills.createCatalogSkill(companyId, {
        key: `catalog/${detail.categorySlug}/${detail.slug}`,
        slug: detail.slug,
        name: detail.name,
        description: detail.description,
        markdown: detail.markdown ?? [
          `# ${detail.name}`,
          "",
          detail.description ?? "Marketplace catalog skill.",
          "",
          detail.sourceUrl ? `Source: ${detail.sourceUrl}` : "",
        ].filter(Boolean).join("\n"),
        sourceLocator: detail.installSource ?? detail.sourceUrl,
        metadata: {
          marketplaceSkillId: detail.id,
          marketplaceCategorySlug: detail.categorySlug,
          marketplaceCategoryName: detail.categoryName,
        },
      });
    }
    const assignedAgentIds = await assignSkillToAgents(companyId, imported.key, request, actor);
    return { skill: imported, assignedAgentIds, approval: null, warnings };
  }

  async function installMarketplaceSkill(companyId: string, request: MarketplaceInstallRequest, actor: InstallActor): Promise<MarketplaceInstallResult> {
    const company = await findCompany(companyId);
    if (!company) throw notFound("Company not found");
    if (actor.actorType === "agent" && company.requireBoardApprovalForCeoSkillInstalls) {
      const detail = await fetchCatalogDetail(request.skillId);
      if (!detail) throw notFound("Marketplace skill not found");
      const approval = await approvalsSvc.create(companyId, {
        type: "install_skill",
        requestedByAgentId: actor.agentId,
        requestedByUserId: null,
        status: "pending",
        payload: {
          marketplaceSkillId: detail.id,
          skillId: detail.id,
          name: detail.name,
          slug: detail.slug,
          categorySlug: detail.categorySlug,
          categoryName: detail.categoryName,
          sourceUrl: detail.sourceUrl,
          installSource: detail.installSource,
          assignMode: request.assignMode,
          agentIds: request.agentIds ?? [],
        },
        decisionNote: null,
        decidedByUserId: null,
        decidedAt: null,
        updatedAt: new Date(),
      });
      return { skill: null, assignedAgentIds: [], approval: approval as MarketplaceInstallResult["approval"], warnings: [] };
    }
    return installNow(companyId, request, actor);
  }

  async function installPack(companyId: string, request: MarketplaceCapabilityPackInstallRequest, actor: InstallActor): Promise<MarketplaceCapabilityPackInstallResult> {
    if (request.assignMode === "selected_agents" && (!request.agentIds || request.agentIds.length === 0)) {
      throw unprocessable("Select at least one agent before installing this capability pack.");
    }

    const detail = await fetchPackDetail(request.packId);
    if (!detail) throw notFound("Capability pack not found");
    const warnings: string[] = [];
    let pluginRecord = null as MarketplaceCapabilityPackInstallResult["plugin"];

    if (detail.plugin) {
      const pluginResult = await installPlugin(companyId, { pluginId: detail.plugin.id });
      pluginRecord = pluginResult.plugin;
      warnings.push(...pluginResult.warnings);
    }

    const installedSkills: MarketplaceCapabilityPackInstallResult["skills"] = [];
    const assignedAgentIds = new Set<string>();
    let approval: MarketplaceCapabilityPackInstallResult["approval"] = null;

    for (const skill of detail.skills) {
      const result = await installMarketplaceSkill(companyId, {
        skillId: skill.id,
        assignMode: request.assignMode,
        agentIds: request.agentIds,
      }, actor);
      if (result.approval) {
        approval = result.approval;
        warnings.push(`Approval requested for ${skill.name}.`);
        continue;
      }
      if (result.skill) installedSkills.push(result.skill);
      for (const agentId of result.assignedAgentIds) assignedAgentIds.add(agentId);
      warnings.push(...result.warnings);
    }

    const refreshed = await fetchPackDetail(request.packId);
    const pack = refreshed ? await enrichPackDetail(companyId, refreshed) : await enrichPackDetail(companyId, detail);
    const checklist = pack.checklist.map((item) => {
      if (item.key === "skill-assignment") {
        return {
          ...item,
          status: assignedAgentIds.size > 0 || request.assignMode === "library_only" ? "done" as const : item.status,
        };
      }
      return item;
    });

    return {
      pack: { ...pack, checklist },
      plugin: pluginRecord,
      skills: installedSkills,
      assignedAgentIds: Array.from(assignedAgentIds),
      approval,
      checklist,
      warnings: Array.from(new Set(warnings)),
    };
  }

  return {
    categories: async () => fetchCatalogCategories(),

    list: async (companyId: string, query: MarketplaceQuery) => {
      const [catalog, companySkills] = await Promise.all([
        fetchCatalogSkills(query),
        skills.list(companyId),
      ]);
      return {
        ...catalog,
        items: withInstallState(catalog.items, companySkills),
      };
    },

    detail: async (companyId: string, skillId: string) => {
      const [detail, companySkills] = await Promise.all([
        fetchCatalogDetail(skillId),
        skills.list(companyId),
      ]);
      if (!detail) return null;
      return withInstallState([detail], companySkills)[0] as MarketplaceSkillDetail;
    },

    pluginCategories: async () => fetchPluginCategories(),

    pluginList: async (_companyId: string, query: MarketplaceQuery) => {
      const [catalog, installedPlugins] = await Promise.all([
        fetchPlugins(query),
        pluginRegistry.listInstalled(),
      ]);
      return {
        ...catalog,
        items: withPluginInstallState(catalog.items, installedPlugins),
      };
    },

    pluginDetail: async (_companyId: string, pluginId: string) => {
      const [detail, installedPlugins] = await Promise.all([
        fetchPluginDetail(pluginId),
        pluginRegistry.listInstalled(),
      ]);
      if (!detail) return null;
      return withPluginInstallState([detail], installedPlugins)[0] as MarketplacePluginDetail;
    },

    packCategories: async () => fetchPackCategories(),

    packList: async (companyId: string, query: MarketplaceQuery): Promise<MarketplaceCapabilityPackListResponse> => {
      const catalog = await fetchPacks(query);
      const items = await Promise.all(catalog.items.map((pack) => enrichPackListItem(companyId, pack)));
      return marketplaceCapabilityPackListResponseSchema.parse({
        items,
        nextCursor: catalog.nextCursor,
      });
    },

    packDetail: async (companyId: string, packId: string): Promise<MarketplaceCapabilityPackDetail | null> => {
      const detail = await fetchPackDetail(packId);
      return detail ? enrichPackDetail(companyId, detail) : null;
    },

    installPack,

    installPlugin,

    install: installMarketplaceSkill,

    applyApprovedInstall: async (approvalId: string, actor: InstallActor) => {
      const approval = await db
        .select()
        .from(approvals)
        .where(and(eq(approvals.id, approvalId), eq(approvals.type, "install_skill")))
        .then((rows) => rows[0] ?? null);
      if (!approval) throw notFound("Skill install approval not found");
      const payload = approval.payload as Record<string, unknown>;
      return installNow(approval.companyId, {
        skillId: String(payload.skillId ?? payload.marketplaceSkillId ?? ""),
        assignMode: payload.assignMode === "ceo" || payload.assignMode === "all_agents" || payload.assignMode === "selected_agents"
          ? payload.assignMode
          : "library_only",
        agentIds: Array.isArray(payload.agentIds)
          ? payload.agentIds.filter((item): item is string => typeof item === "string")
          : [],
      }, actor);
    },
  };
}
