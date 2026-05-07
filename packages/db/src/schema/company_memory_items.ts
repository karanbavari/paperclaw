import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { agents } from "./agents.js";

export const companyMemoryItems = pgTable(
  "company_memory_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    memoryType: text("memory_type").notNull().default("long_term"),
    kind: text("kind").notNull().default("note"),
    status: text("status").notNull().default("proposed"),
    scopeType: text("scope_type").notNull().default("company"),
    scopeId: text("scope_id"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    summary: text("summary"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    sourceType: text("source_type").notNull().default("manual"),
    sourceId: text("source_id"),
    createdByUserId: text("created_by_user_id"),
    createdByAgentId: uuid("created_by_agent_id").references(() => agents.id, { onDelete: "set null" }),
    approvedByUserId: text("approved_by_user_id"),
    approvedByAgentId: uuid("approved_by_agent_id").references(() => agents.id, { onDelete: "set null" }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    confidence: integer("confidence").notNull().default(70),
    importance: integer("importance").notNull().default(50),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyStatusIdx: index("company_memory_items_company_status_idx").on(table.companyId, table.status),
    companyTypeIdx: index("company_memory_items_company_type_idx").on(table.companyId, table.memoryType),
    companyScopeIdx: index("company_memory_items_company_scope_idx").on(table.companyId, table.scopeType, table.scopeId),
    companyUpdatedIdx: index("company_memory_items_company_updated_idx").on(table.companyId, table.updatedAt),
    expiresIdx: index("company_memory_items_expires_idx").on(table.companyId, table.expiresAt),
    titleSearchIdx: index("company_memory_items_title_search_idx").using("gin", table.title.op("gin_trgm_ops")),
    bodySearchIdx: index("company_memory_items_body_search_idx").using("gin", table.body.op("gin_trgm_ops")),
  }),
);
