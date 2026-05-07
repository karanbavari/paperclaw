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
    or(isNull(companyMemoryItems.expiresAt), sql`${companyMemoryItems.expiresAt} > ${now}`),
  );
}

function defaultStatusFor(input: CreateCompanyMemoryItem, canApprove: boolean): CompanyMemoryStatus {
  if (input.status && canApprove) return input.status as CompanyMemoryStatus;
  if (input.memoryType === "short_term") return "active";
  return canApprove ? "approved" : "proposed";
}

export function companyMemoryService(db: Db) {
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
      return toMemoryItem(row);
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
        .where(and(eq(companyMemoryItems.companyId, companyId), activeMemoryCondition(now), scoped))
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
