import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import { approvals, companies } from "@kesarcloud/db";
import {
  marketplaceSkillCategorySchema,
  marketplaceSkillDetailSchema,
  marketplaceSkillListResponseSchema,
  type MarketplaceInstallRequest,
  type MarketplaceInstallResult,
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

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 200;
const LOCAL_CATALOG_ROOT = "skills database";
const BUNDLED_TOOL_SKILL_CATEGORY = {
  id: "tools",
  slug: "tools",
  name: "Tools",
} as const;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

const BUNDLED_TOOL_SKILL_CATALOG = [
  {
    slug: "research-protocol-tools",
    name: "Research Protocol Tools",
    description: "Industry-standard research protocol for source selection, evidence capture, synthesis, and task-specific marketplace tool selection.",
    tags: ["research", "evidence", "marketplace", "workflow"],
    installNotes: "Install to the CEO or a research-focused agent. Pair with the relevant plugin-specific skill for browser, Workspace, ads, or scheduling tasks.",
  },
  {
    slug: "browser-automation-tools",
    name: "Browser Automation Tools",
    description: "Guides agents through safe Playwright MCP browser automation for navigation, forms, screenshots, assertions, console/network checks, traces, video, and PDFs.",
    tags: ["browser", "playwright", "mcp", "automation", "testing"],
    installNotes: "Install the Playwright MCP Browser Automation plugin first, then attach this skill to agents that need browser research or UI verification.",
  },
  {
    slug: "google-workspace-tools",
    name: "Google Workspace Tools",
    description: "Usage protocol for Gmail, Calendar, Drive, Docs, Sheets, Chat, and governed raw gws workflows through the Google Workspace plugin.",
    tags: ["google", "workspace", "gmail", "calendar", "drive", "docs", "sheets"],
    installNotes: "Install and configure the Google Workspace plugin with an authenticated gws profile before assigning this skill.",
  },
  {
    slug: "meta-ads-tools",
    name: "Meta Ads Tools",
    description: "Safe Meta Ads workflow for account inspection, insights, diagnostics, dry-run campaign edits, budget guardrails, and approval-ready ad operations.",
    tags: ["meta", "ads", "marketing", "campaigns", "insights"],
    installNotes: "Install and configure the Meta Ads plugin. Keep dry-run enabled until the operator approves live ad changes.",
  },
  {
    slug: "appointment-booking-tools",
    name: "Appointment Booking Tools",
    description: "Workflow for listing appointments, finding availability, creating bookings, rescheduling, cancelling, and handling Google Calendar sync status.",
    tags: ["appointments", "booking", "calendar", "scheduling"],
    installNotes: "Install and configure the Appointment Booking plugin with calendar, timezone, and Google access token secret reference before live booking work.",
  },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "skill";
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
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
  return asString(process.env.PAPERCLAW_SKILL_MARKETPLACE_URL)
    ?? asString(process.env.PAPERCLAW_MARKETPLACE_URL);
}

function resolveLocalCatalogRoot() {
  const configured = asString(process.env.PAPERCLAW_SKILL_MARKETPLACE_LOCAL_ROOT);
  if (configured) return [path.resolve(process.cwd(), configured)];

  return [
    path.resolve(process.cwd(), LOCAL_CATALOG_ROOT),
    path.resolve(process.cwd(), "..", LOCAL_CATALOG_ROOT),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "..", "..", LOCAL_CATALOG_ROOT),
  ];
}

function resolveBundledToolSkillPath(slug: string) {
  return path.resolve(REPO_ROOT, "marketplace", "skills", "tools", slug);
}

async function readBundledToolSkillCatalog(): Promise<MarketplaceSkillDetail[]> {
  const entries: Array<MarketplaceSkillDetail | null> = await Promise.all(BUNDLED_TOOL_SKILL_CATALOG.map(async (skill) => {
    const skillPath = resolveBundledToolSkillPath(skill.slug);
    const markdown = await fs.readFile(path.join(skillPath, "SKILL.md"), "utf8").catch(() => null);
    if (!markdown) return null;
    return {
      id: `${BUNDLED_TOOL_SKILL_CATEGORY.slug}/${skill.slug}`,
      slug: skill.slug,
      name: skill.name,
      description: skill.description,
      categorySlug: BUNDLED_TOOL_SKILL_CATEGORY.slug,
      categoryName: BUNDLED_TOOL_SKILL_CATEGORY.name,
      sourceUrl: null,
      installSource: skillPath,
      trustLevel: "markdown_only",
      tags: [...skill.tags],
      installedSkillId: null,
      markdown,
      installNotes: skill.installNotes,
    };
  }));
  return entries.filter((item): item is MarketplaceSkillDetail => Boolean(item));
}

function mergeSkillCategories(
  categories: MarketplaceSkillCategory[],
  bundledSkills: MarketplaceSkillDetail[],
): MarketplaceSkillCategory[] {
  const bySlug = new Map<string, MarketplaceSkillCategory>();
  for (const category of categories) {
    bySlug.set(category.slug, { ...category });
  }
  if (bundledSkills.length > 0) {
    const current = bySlug.get(BUNDLED_TOOL_SKILL_CATEGORY.slug);
    bySlug.set(BUNDLED_TOOL_SKILL_CATEGORY.slug, {
      id: BUNDLED_TOOL_SKILL_CATEGORY.id,
      slug: BUNDLED_TOOL_SKILL_CATEGORY.slug,
      name: current?.name ?? BUNDLED_TOOL_SKILL_CATEGORY.name,
      skillCount: (current?.skillCount ?? 0) + bundledSkills.length,
    });
  }
  return Array.from(bySlug.values())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((item) => marketplaceSkillCategorySchema.parse(item));
}

function mergeSkillListPage(
  catalog: MarketplaceSkillListResponse,
  bundledSkills: MarketplaceSkillDetail[],
  query: MarketplaceQuery,
): MarketplaceSkillListResponse {
  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const bundledPage = pageSkills(bundledSkills, query);
  return marketplaceSkillListResponseSchema.parse({
    items: [...bundledPage.items, ...catalog.items].slice(0, limit),
    nextCursor: bundledPage.nextCursor ?? catalog.nextCursor,
  });
}

function isInstallableExternalSource(url: string | null) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return parsed.hostname === "github.com"
      || parsed.hostname.endsWith(".github.com")
      || parsed.hostname === "raw.githubusercontent.com"
      || parsed.hostname === "skills.sh"
      || parsed.hostname === "www.skills.sh";
  } catch {
    return false;
  }
}

function normalizeRemoteSkill(raw: Record<string, unknown>): MarketplaceSkillDetail {
  const id = asString(raw.id) ?? asString(raw.slug) ?? slugify(asString(raw.name) ?? "skill");
  const slug = asString(raw.slug) ?? slugify(id);
  const categorySlug = asString(raw.categorySlug) ?? "uncategorized";
  const categoryName = asString(raw.categoryName) ?? titleFromSlug(categorySlug);
  const sourceUrl = asString(raw.sourceUrl);
  const installSource = asString(raw.installSource) ?? (isInstallableExternalSource(sourceUrl) ? sourceUrl : null);
  return {
    id,
    slug,
    name: asString(raw.name) ?? titleFromSlug(slug),
    description: asString(raw.description),
    categorySlug,
    categoryName,
    sourceUrl,
    installSource,
    trustLevel: raw.trustLevel === "assets" || raw.trustLevel === "scripts_executables" || raw.trustLevel === "markdown_only"
      ? raw.trustLevel
      : "unknown",
    tags: Array.isArray(raw.tags) ? raw.tags.filter((item): item is string => typeof item === "string") : [],
    installedSkillId: null,
    markdown: asString(raw.markdown),
    installNotes: asString(raw.installNotes),
  };
}

async function fetchJson(url: string) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw unprocessable(`Marketplace request failed: ${response.status}`);
  }
  return response.json();
}

function parseLocalSkillLine(line: string, category: { slug: string; name: string }): MarketplaceSkillDetail | null {
  const match = line.match(/^- \[([^\]]+)]\(([^)]+)\)\s*-\s*(.+)$/);
  if (!match) return null;
  const name = match[1]!.trim();
  const sourceUrl = match[2]!.trim();
  const description = match[3]!.replace(/\s+/g, " ").trim();
  const sourceSlug = (() => {
    try {
      const parsed = new URL(sourceUrl);
      const last = parsed.pathname.split("/").filter(Boolean).pop();
      return last ? slugify(last) : slugify(name);
    } catch {
      return slugify(name);
    }
  })();
  const installSource = isInstallableExternalSource(sourceUrl) ? sourceUrl : null;
  return {
    id: `${category.slug}/${sourceSlug}`,
    slug: sourceSlug,
    name,
    description,
    categorySlug: category.slug,
    categoryName: category.name,
    sourceUrl,
    installSource,
    trustLevel: "unknown",
    tags: [],
    installedSkillId: null,
    markdown: [
      `# ${name}`,
      "",
      description,
      "",
      sourceUrl ? `Source: ${sourceUrl}` : "",
    ].filter(Boolean).join("\n"),
    installNotes: installSource
      ? null
      : "This local fallback entry does not include package files. PaperClaw will install it as catalog markdown until the remote marketplace provides an install source.",
  };
}

async function readLocalCatalog(): Promise<{ categories: MarketplaceSkillCategory[]; skills: MarketplaceSkillDetail[] }> {
  const candidates = resolveLocalCatalogRoot().map((candidate) => path.join(candidate, "categories"));
  const root = await (async () => {
    for (const candidate of candidates) {
      const stat = await fs.stat(candidate).catch(() => null);
      if (stat?.isDirectory()) return candidate;
    }
    return candidates[0]!;
  })();
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  const skills: MarketplaceSkillDetail[] = [];
  const categories: MarketplaceSkillCategory[] = [];
  for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".md"))) {
    const slug = entry.name.replace(/\.md$/i, "");
    const name = titleFromSlug(slug);
    const content = await fs.readFile(path.join(root, entry.name), "utf8").catch(() => "");
    const categorySkills = content
      .split(/\r?\n/)
      .map((line) => parseLocalSkillLine(line, { slug, name }))
      .filter((item): item is MarketplaceSkillDetail => Boolean(item));
    categories.push({ id: slug, slug, name, skillCount: categorySkills.length });
    skills.push(...categorySkills);
  }
  return {
    categories: categories.sort((left, right) => left.name.localeCompare(right.name)),
    skills,
  };
}

function matchesQuery(skill: MarketplaceSkillDetail, query: MarketplaceQuery) {
  const category = query.category?.trim();
  if (category && skill.categorySlug !== category) return false;
  const q = query.q?.trim().toLowerCase();
  if (!q) return true;
  return [
    skill.name,
    skill.description,
    skill.categoryName,
    skill.slug,
    skill.sourceUrl,
  ].some((value) => value?.toLowerCase().includes(q));
}

function pageSkills(skills: MarketplaceSkillDetail[], query: MarketplaceQuery): MarketplaceSkillListResponse {
  const limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  const offset = Math.max(0, Number.parseInt(query.cursor ?? "0", 10) || 0);
  const filtered = skills.filter((skill) => matchesQuery(skill, query));
  const page = filtered.slice(offset, offset + limit);
  const nextOffset = offset + page.length;
  return {
    items: page.map(({ markdown: _markdown, installNotes: _installNotes, ...skill }) => skill),
    nextCursor: nextOffset < filtered.length ? String(nextOffset) : null,
  };
}

function installedMatch(skill: MarketplaceSkillListItem, companySkill: {
  id: string;
  key: string;
  slug: string;
  sourceLocator: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  return companySkill.metadata?.marketplaceSkillId === skill.id
    || (skill.installSource && companySkill.sourceLocator === skill.installSource)
    || (skill.sourceUrl && companySkill.sourceLocator === skill.sourceUrl)
    || companySkill.key === `catalog/${skill.categorySlug}/${skill.slug}`
    || companySkill.key === `catalog/${skill.slug}`
    || companySkill.slug === skill.slug;
}

function withInstallState<T extends MarketplaceSkillListItem>(
  items: T[],
  companySkills: Array<{
    id: string;
    key: string;
    slug: string;
    sourceLocator: string | null;
    metadata?: Record<string, unknown> | null;
  }>,
): T[] {
  return items.map((item) => {
    const installed = companySkills.find((skill) => installedMatch(item, skill));
    return { ...item, installedSkillId: installed?.id ?? null };
  });
}

export function marketplaceService(db: Db) {
  const agents = agentService(db);
  const approvalsSvc = approvalService(db);
  const skills = companySkillService(db);

  async function fetchCatalogCategories(): Promise<MarketplaceSkillCategory[]> {
    const bundledSkills = await readBundledToolSkillCatalog();
    const baseUrl = resolveMarketplaceBaseUrl();
    if (baseUrl) {
      try {
        const json = await fetchJson(`${baseUrl.replace(/\/+$/, "")}/categories`);
        const categories = Array.isArray(json)
          ? json.map((item) => marketplaceSkillCategorySchema.parse(item))
          : (Array.isArray(json.categories) ? json.categories.map((item: unknown) => marketplaceSkillCategorySchema.parse(item)) : []);
        return mergeSkillCategories(categories, bundledSkills);
      } catch {
        // Fall back to the ignored local reference checkout in dev/offline environments.
      }
    }
    return mergeSkillCategories((await readLocalCatalog()).categories, bundledSkills);
  }

  async function fetchCatalogSkills(query: MarketplaceQuery): Promise<MarketplaceSkillListResponse> {
    const bundledSkills = await readBundledToolSkillCatalog();
    const baseUrl = resolveMarketplaceBaseUrl();
    if (baseUrl) {
      try {
        const url = new URL(`${baseUrl.replace(/\/+$/, "")}/skills`);
        if (query.q) url.searchParams.set("q", query.q);
        if (query.category) url.searchParams.set("category", query.category);
        if (query.limit) url.searchParams.set("limit", String(query.limit));
        if (query.cursor) url.searchParams.set("cursor", query.cursor);
        const json = await fetchJson(url.toString());
        const parsed = marketplaceSkillListResponseSchema.safeParse(json);
        if (parsed.success) return mergeSkillListPage(parsed.data, bundledSkills, query);
        const rawItems = Array.isArray(json.items) ? json.items : Array.isArray(json) ? json : [];
        return mergeSkillListPage({
          items: rawItems.map((item: unknown) => {
            const detail = normalizeRemoteSkill(item as Record<string, unknown>);
            const { markdown: _markdown, installNotes: _installNotes, ...listItem } = detail;
            return listItem;
          }),
          nextCursor: asString(json.nextCursor),
        }, bundledSkills, query);
      } catch {
        // Fall through to local fallback.
      }
    }
    return mergeSkillListPage(pageSkills((await readLocalCatalog()).skills, query), bundledSkills, query);
  }

  async function fetchCatalogDetail(skillId: string): Promise<MarketplaceSkillDetail | null> {
    const bundledSkills = await readBundledToolSkillCatalog();
    const bundled = bundledSkills.find((skill) =>
      skill.id === skillId
      || skill.slug === skillId
      || `${skill.categorySlug}/${skill.slug}` === skillId,
    );
    if (bundled) return marketplaceSkillDetailSchema.parse(bundled);

    const baseUrl = resolveMarketplaceBaseUrl();
    if (baseUrl) {
      try {
        const json = await fetchJson(`${baseUrl.replace(/\/+$/, "")}/skills/${encodeURIComponent(skillId)}`);
        const parsed = marketplaceSkillDetailSchema.safeParse(json);
        return parsed.success ? parsed.data : normalizeRemoteSkill(json as Record<string, unknown>);
      } catch {
        // Fall through to local fallback.
      }
    }
    const local = await readLocalCatalog();
    return local.skills.find((skill) => skill.id === skillId || skill.slug === skillId) ?? null;
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

    install: async (companyId: string, request: MarketplaceInstallRequest, actor: InstallActor) => {
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
        return { skill: null, assignedAgentIds: [], approval, warnings: [] };
      }
      return installNow(companyId, request, actor);
    },

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
