import { and, asc, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import { companyMemoryItems, companyProfiles } from "@kesarcloud/db";
import type {
  CompanyMemoryItem,
  CompanyMemoryListQuery,
  CompanyMemoryListResponse,
  CompanyMemoryRecallRequest,
  CompanyMemoryRecallResponse,
  CompanyMemoryStatus,
  CompanyProfile,
  CreateCompanyMemoryItem,
  UpdateCompanyMemoryItem,
  UpdateCompanyProfile,
} from "@kesarcloud/shared";
import { logger } from "../middleware/logger.js";
import { agentService } from "./agents.js";
import { agentInstructionsService } from "./agent-instructions.js";

function iso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function dateString(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}

function normalizeTags(tags: string[] | null | undefined): string[] {
  return Array.from(new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))).slice(0, 20);
}

function toProfile(row: typeof companyProfiles.$inferSelect | null): CompanyProfile | null {
  if (!row) return null;
  return {
    companyId: row.companyId,
    registeredSince: dateString(row.registeredSince),
    businessCategory: row.businessCategory,
    businessSubcategory: row.businessSubcategory,
    defaultLanguage: row.defaultLanguage as CompanyProfile["defaultLanguage"],
    defaultCurrency: row.defaultCurrency as CompanyProfile["defaultCurrency"],
    website: row.website,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    contactAddress: row.contactAddress,
    timezone: row.timezone as CompanyProfile["timezone"],
    businessSummary: row.businessSummary,
    targetCustomers: row.targetCustomers,
    brandVoice: row.brandVoice,
    operatingNotes: row.operatingNotes,
    createdAt: iso(row.createdAt)!,
    updatedAt: iso(row.updatedAt)!,
  };
}

function toMemoryItem(row: typeof companyMemoryItems.$inferSelect): CompanyMemoryItem {
  return {
    id: row.id,
    companyId: row.companyId,
    memoryType: row.memoryType as CompanyMemoryItem["memoryType"],
    kind: row.kind as CompanyMemoryItem["kind"],
    status: row.status as CompanyMemoryStatus,
    scopeType: row.scopeType as CompanyMemoryItem["scopeType"],
    scopeId: row.scopeId,
    title: row.title,
    body: row.body,
    summary: row.summary,
    tags: normalizeTags(row.tags),
    sourceType: row.sourceType as CompanyMemoryItem["sourceType"],
    sourceId: row.sourceId,
    createdByUserId: row.createdByUserId,
    createdByAgentId: row.createdByAgentId,
    approvedByUserId: row.approvedByUserId,
    approvedByAgentId: row.approvedByAgentId,
    approvedAt: iso(row.approvedAt),
    confidence: row.confidence,
    importance: row.importance,
    expiresAt: iso(row.expiresAt),
    lastUsedAt: iso(row.lastUsedAt),
    metadata: row.metadata,
    createdAt: iso(row.createdAt)!,
    updatedAt: iso(row.updatedAt)!,
  };
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

function textSearchCondition(query: string): SQL<boolean> | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;
  const pattern = `%${escapeLikePattern(normalized)}%`;
  return sql<boolean>`(
    lower(${companyMemoryItems.title}) LIKE ${pattern} ESCAPE '\\'
    OR lower(${companyMemoryItems.body}) LIKE ${pattern} ESCAPE '\\'
    OR lower(coalesce(${companyMemoryItems.summary}, '')) LIKE ${pattern} ESCAPE '\\'
  )`;
}

function activeMemoryCondition(now = new Date()) {
  return and(
    inArray(companyMemoryItems.status, ["approved", "active"]),
    or(isNull(companyMemoryItems.expiresAt), sql`${companyMemoryItems.expiresAt} > ${now.toISOString()}`),
  );
}

export function defaultStatusFor(input: CreateCompanyMemoryItem, canApprove: boolean): CompanyMemoryStatus {
  if (input.status && canApprove) return input.status as CompanyMemoryStatus;
  if (input.memoryType === "short_term") return "active";
  if (!canApprove) {
    const autoScope = input.scopeType === "agent" || input.scopeType === "project" || input.scopeType === "issue";
    const autoKind = input.kind === "fact" || input.kind === "note" || input.kind === "preference" || input.kind === "procedure";
    if (autoScope && autoKind && input.memoryType !== "profile") return "active";
  }
  return canApprove ? "approved" : "proposed";
}

const MEMORY_FILE_NAME = "MEMORY.md";
const MEMORY_FILE_MAX_ITEMS = 20;
const MEMORY_FILE_TEXT_MAX_CHARS = 600;

function compactMemoryFileText(value: string | null | undefined, maxChars = MEMORY_FILE_TEXT_MAX_CHARS) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function renderMemoryFile(profile: CompanyProfile | null, items: CompanyMemoryItem[]) {
  const profileLines = profile
    ? [
        profile.businessCategory ? `- Business category: ${profile.businessCategory}` : "",
        profile.businessSubcategory ? `- Business subcategory: ${profile.businessSubcategory}` : "",
        profile.businessSummary ? `- Business summary: ${compactMemoryFileText(profile.businessSummary)}` : "",
        profile.targetCustomers ? `- Target customers: ${compactMemoryFileText(profile.targetCustomers)}` : "",
        profile.brandVoice ? `- Brand voice: ${compactMemoryFileText(profile.brandVoice)}` : "",
        profile.operatingNotes ? `- Operating notes: ${compactMemoryFileText(profile.operatingNotes)}` : "",
      ].filter(Boolean)
    : [];
  const memoryLines = items.slice(0, MEMORY_FILE_MAX_ITEMS).map((item) => {
    const scope = item.scopeType === "agent" ? "agent" : "company";
    const body = compactMemoryFileText(item.summary ?? item.body);
    const tags = item.tags.length > 0 ? `; tags: ${item.tags.join(", ")}` : "";
    return `- ${item.title} (${scope}; ${item.memoryType}; ${item.kind}; importance ${item.importance}${tags})${body ? `\n  ${body}` : ""}`;
  });

  return [
    "# PaperClaw Agent Memory",
    "",
    "This file is generated from approved/active PaperClaw memory. Do not treat it as the source of truth; create or propose PaperClaw memory items when durable facts change.",
    "Never store secrets, credentials, API keys, private tokens, raw sensitive logs, or unverified guesses in memory.",
    profileLines.length > 0 ? ["", "## Company Profile", ...profileLines].join("\n") : "",
    memoryLines.length > 0 ? ["", "## Recalled Durable Memory", ...memoryLines].join("\n") : "",
    profileLines.length === 0 && memoryLines.length === 0 ? "\n_No active company or agent memory yet._" : "",
    "",
  ].filter(Boolean).join("\n");
}

export function companyMemoryService(db: Db) {
  const agents = agentService(db);
  const instructions = agentInstructionsService();

  async function activeProjectionItems(companyId: string, agentId: string) {
    const now = new Date();
    const rows = await db
      .select()
      .from(companyMemoryItems)
      .where(
        and(
          eq(companyMemoryItems.companyId, companyId),
          activeMemoryCondition(now),
          or(
            eq(companyMemoryItems.scopeType, "company"),
            and(eq(companyMemoryItems.scopeType, "agent"), eq(companyMemoryItems.scopeId, agentId)),
          ),
        ),
      )
      .orderBy(desc(companyMemoryItems.importance), desc(companyMemoryItems.updatedAt), asc(companyMemoryItems.id))
      .limit(MEMORY_FILE_MAX_ITEMS);
    return rows.map(toMemoryItem);
  }

  async function buildAgentMemoryMarkdown(companyId: string, agentId: string): Promise<string> {
    const [profile, items] = await Promise.all([
      db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.companyId, companyId))
        .then((profileRows) => toProfile(profileRows[0] ?? null)),
      activeProjectionItems(companyId, agentId),
    ]);
    return renderMemoryFile(profile, items);
  }

  async function syncAgentMemoryFile(companyId: string, agentId: string) {
    const agent = await agents.getById(agentId);
    if (!agent || agent.companyId !== companyId) return { updated: 0, skipped: 1, failed: 0 };
    try {
      const bundle = await instructions.getBundle(agent);
      if (bundle.mode !== "managed") return { updated: 0, skipped: 1, failed: 0 };
      const nextContent = await buildAgentMemoryMarkdown(companyId, agentId);
      let currentContent = "";
      try {
        currentContent = (await instructions.readFile(agent, MEMORY_FILE_NAME)).content;
      } catch {
        currentContent = "";
      }
      if (currentContent === nextContent) return { updated: 0, skipped: 1, failed: 0 };
      const result = await instructions.writeFile(agent, MEMORY_FILE_NAME, nextContent);
      await agents.update(agent.id, { adapterConfig: result.adapterConfig });
      return { updated: 1, skipped: 0, failed: 0 };
    } catch (error) {
      logger.warn({ err: error, companyId, agentId }, "Failed to sync agent MEMORY.md");
      return { updated: 0, skipped: 0, failed: 1 };
    }
  }

  return {
    getProfile: async (companyId: string): Promise<CompanyProfile | null> => {
      const row = await db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.companyId, companyId))
        .then((rows) => rows[0] ?? null);
      return toProfile(row);
    },

    upsertProfile: async (companyId: string, input: UpdateCompanyProfile): Promise<CompanyProfile> => {
      const now = new Date();
      const insertValues = {
        registeredSince: input.registeredSince ?? null,
        businessCategory: input.businessCategory ?? null,
        businessSubcategory: input.businessSubcategory ?? null,
        defaultLanguage: input.defaultLanguage ?? null,
        defaultCurrency: input.defaultCurrency ?? null,
        website: input.website ?? null,
        contactEmail: input.contactEmail ?? null,
        contactPhone: input.contactPhone ?? null,
        contactAddress: input.contactAddress ?? null,
        timezone: input.timezone ?? null,
        businessSummary: input.businessSummary ?? null,
        targetCustomers: input.targetCustomers ?? null,
        brandVoice: input.brandVoice ?? null,
        operatingNotes: input.operatingNotes ?? null,
      };
      const patch: Partial<typeof companyProfiles.$inferInsert> = { updatedAt: now };
      for (const key of Object.keys(insertValues) as Array<keyof typeof insertValues>) {
        if (input[key] !== undefined) patch[key] = input[key] ?? null;
      }
      const row = await db
        .insert(companyProfiles)
        .values({ companyId, ...insertValues, createdAt: now, updatedAt: now })
        .onConflictDoUpdate({
          target: companyProfiles.companyId,
          set: patch,
        })
        .returning()
        .then((rows) => rows[0]!);
      return toProfile(row)!;
    },

    listMemory: async (companyId: string, query: CompanyMemoryListQuery): Promise<CompanyMemoryListResponse> => {
      const conditions: SQL[] = [eq(companyMemoryItems.companyId, companyId)];
      if (query.memoryType) conditions.push(eq(companyMemoryItems.memoryType, query.memoryType));
      if (query.status) conditions.push(eq(companyMemoryItems.status, query.status));
      if (query.scopeType) conditions.push(eq(companyMemoryItems.scopeType, query.scopeType));
      if (query.scopeId) conditions.push(eq(companyMemoryItems.scopeId, query.scopeId));
      const search = textSearchCondition(query.q);
      if (search) conditions.push(search);
      const where = and(...conditions);
      const rows = await db
        .select()
        .from(companyMemoryItems)
        .where(where)
        .orderBy(desc(companyMemoryItems.importance), desc(companyMemoryItems.updatedAt))
        .limit(query.limit)
        .offset(query.offset);
      const total = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(companyMemoryItems)
        .where(where)
        .then((result) => result[0]?.count ?? 0);
      return { items: rows.map(toMemoryItem), total };
    },

    createMemory: async (
      companyId: string,
      input: CreateCompanyMemoryItem,
      actor: { userId?: string | null; agentId?: string | null; canApprove: boolean },
    ): Promise<CompanyMemoryItem> => {
      const now = new Date();
      const status = defaultStatusFor(input, actor.canApprove);
      const approved = status === "approved" || status === "active";
      const row = await db
        .insert(companyMemoryItems)
        .values({
          companyId,
          memoryType: input.memoryType,
          kind: input.kind,
          status,
          scopeType: input.scopeType,
          scopeId: input.scopeId ?? null,
          title: input.title,
          body: input.body,
          summary: input.summary ?? null,
          tags: normalizeTags(input.tags),
          sourceType: input.sourceType,
          sourceId: input.sourceId ?? null,
          createdByUserId: actor.userId ?? null,
          createdByAgentId: actor.agentId ?? null,
          approvedByUserId: approved ? actor.userId ?? null : null,
          approvedByAgentId: approved ? actor.agentId ?? null : null,
          approvedAt: approved ? now : null,
          confidence: input.confidence,
          importance: input.importance,
          expiresAt: input.expiresAt ?? null,
          metadata: input.metadata ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .then((rows) => rows[0]!);
      const item = toMemoryItem(row);
      return item;
    },

    updateMemory: async (
      companyId: string,
      memoryId: string,
      input: UpdateCompanyMemoryItem,
    ): Promise<CompanyMemoryItem | null> => {
      const patch: Partial<typeof companyMemoryItems.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.memoryType !== undefined) patch.memoryType = input.memoryType;
      if (input.kind !== undefined) patch.kind = input.kind;
      if (input.status !== undefined) patch.status = input.status;
      if (input.scopeType !== undefined) patch.scopeType = input.scopeType;
      if (input.scopeId !== undefined) patch.scopeId = input.scopeId;
      if (input.title !== undefined) patch.title = input.title;
      if (input.body !== undefined) patch.body = input.body;
      if (input.summary !== undefined) patch.summary = input.summary;
      if (input.tags !== undefined) patch.tags = normalizeTags(input.tags);
      if (input.sourceType !== undefined) patch.sourceType = input.sourceType;
      if (input.sourceId !== undefined) patch.sourceId = input.sourceId;
      if (input.confidence !== undefined) patch.confidence = input.confidence;
      if (input.importance !== undefined) patch.importance = input.importance;
      if (input.expiresAt !== undefined) patch.expiresAt = input.expiresAt;
      if (input.metadata !== undefined) patch.metadata = input.metadata;
      const row = await db
        .update(companyMemoryItems)
        .set(patch)
        .where(and(eq(companyMemoryItems.companyId, companyId), eq(companyMemoryItems.id, memoryId)))
        .returning()
        .then((rows) => rows[0] ?? null);
      return row ? toMemoryItem(row) : null;
    },

    approveMemory: async (
      companyId: string,
      memoryId: string,
      actor: { userId?: string | null; agentId?: string | null },
    ): Promise<CompanyMemoryItem | null> => {
      const now = new Date();
      const row = await db
        .update(companyMemoryItems)
        .set({
          status: "approved",
          approvedByUserId: actor.userId ?? null,
          approvedByAgentId: actor.agentId ?? null,
          approvedAt: now,
          updatedAt: now,
        })
        .where(and(eq(companyMemoryItems.companyId, companyId), eq(companyMemoryItems.id, memoryId)))
        .returning()
        .then((rows) => rows[0] ?? null);
      return row ? toMemoryItem(row) : null;
    },

    archiveMemory: async (companyId: string, memoryId: string): Promise<CompanyMemoryItem | null> => {
      const row = await db
        .update(companyMemoryItems)
        .set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(companyMemoryItems.companyId, companyId), eq(companyMemoryItems.id, memoryId)))
        .returning()
        .then((rows) => rows[0] ?? null);
      return row ? toMemoryItem(row) : null;
    },

    buildAgentMemoryMarkdown: async (companyId: string, agentId: string): Promise<string> => {
      return buildAgentMemoryMarkdown(companyId, agentId);
    },

    syncAgentMemoryFile: async (companyId: string, agentId: string) => {
      return syncAgentMemoryFile(companyId, agentId);
    },

    syncManagedAgentMemoryFiles: async (companyId: string, agentId?: string | null) => {
      const companyAgents = agentId
        ? (await agents.getById(agentId).then((agent) => agent && agent.companyId === companyId ? [agent] : []))
        : await agents.list(companyId, { includeTerminated: true });
      let updated = 0;
      let skipped = 0;
      let failed = 0;
      for (const agent of companyAgents) {
        const result = await syncAgentMemoryFile(companyId, agent.id);
        updated += result.updated;
        skipped += result.skipped;
        failed += result.failed;
      }
      return { updated, skipped, failed };
    },

    recall: async (companyId: string, input: CompanyMemoryRecallRequest): Promise<CompanyMemoryRecallResponse> => {
      const now = new Date();
      const terms = [
        input.query,
        input.agentRole,
        input.issueId,
        input.projectId,
      ].filter((value): value is string => Boolean(value && value.trim())).join(" ");
      const search = textSearchCondition(terms);
      const scopeConditions: SQL[] = [eq(companyMemoryItems.scopeType, "company")];
      if (input.agentId) scopeConditions.push(and(eq(companyMemoryItems.scopeType, "agent"), eq(companyMemoryItems.scopeId, input.agentId))!);
      if (input.issueId) scopeConditions.push(and(eq(companyMemoryItems.scopeType, "issue"), eq(companyMemoryItems.scopeId, input.issueId))!);
      if (input.projectId) scopeConditions.push(and(eq(companyMemoryItems.scopeType, "project"), eq(companyMemoryItems.scopeId, input.projectId))!);
      const scoped = or(...scopeConditions);
      const relevance = search
        ? or(
            search,
            input.agentId ? and(eq(companyMemoryItems.scopeType, "agent"), eq(companyMemoryItems.scopeId, input.agentId))! : sql`false`,
            input.issueId ? and(eq(companyMemoryItems.scopeType, "issue"), eq(companyMemoryItems.scopeId, input.issueId))! : sql`false`,
            input.projectId ? and(eq(companyMemoryItems.scopeType, "project"), eq(companyMemoryItems.scopeId, input.projectId))! : sql`false`,
          )
        : sql`true`;
      const score = sql<number>`
        (
          ${companyMemoryItems.importance}
          + (${companyMemoryItems.confidence} / 4)
          + CASE WHEN ${companyMemoryItems.memoryType} = 'long_term' THEN 30 ELSE 0 END
          + CASE WHEN ${companyMemoryItems.memoryType} = 'knowledge' THEN 25 ELSE 0 END
          + CASE WHEN ${companyMemoryItems.memoryType} = 'profile' THEN 20 ELSE 0 END
          + CASE WHEN ${companyMemoryItems.scopeType} = 'agent' THEN 20 ELSE 0 END
          + CASE WHEN ${search ?? sql`false`} THEN 80 ELSE 0 END
        )::int
      `.as("recallScore");
      const rows = await db
        .select({
          item: companyMemoryItems,
          recallScore: score,
        })
        .from(companyMemoryItems)
        .where(and(eq(companyMemoryItems.companyId, companyId), activeMemoryCondition(now), scoped, relevance))
        .orderBy(desc(score), desc(companyMemoryItems.updatedAt), asc(companyMemoryItems.id))
        .limit(input.limit);
      const ids = rows.map((row) => row.item.id);
      if (ids.length > 0) {
        await db
          .update(companyMemoryItems)
          .set({ lastUsedAt: now })
          .where(and(eq(companyMemoryItems.companyId, companyId), inArray(companyMemoryItems.id, ids)));
      }
      const profile = await db
        .select()
        .from(companyProfiles)
        .where(eq(companyProfiles.companyId, companyId))
        .then((profileRows) => toProfile(profileRows[0] ?? null));
      return {
        items: rows.map((row) => ({
          ...toMemoryItem(row.item),
          recallScore: Number(row.recallScore),
        })),
        profile,
      };
    },
  };
}
