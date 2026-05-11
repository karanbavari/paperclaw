import { pgTable, uuid, text, timestamp, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { agents } from "./agents.js";
import { heartbeatRuns } from "./heartbeat_runs.js";

export const directChatThreads = pgTable(
  "direct_chat_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("board_ceo"),
    ceoAgentId: uuid("ceo_agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyKindCeoUq: uniqueIndex("direct_chat_threads_company_kind_ceo_uq").on(
      table.companyId,
      table.kind,
      table.ceoAgentId,
    ),
    companyUpdatedIdx: index("direct_chat_threads_company_updated_idx").on(table.companyId, table.updatedAt),
  }),
);

export const directChatMessages = pgTable(
  "direct_chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    threadId: uuid("thread_id").notNull().references(() => directChatThreads.id, { onDelete: "cascade" }),
    authorType: text("author_type").notNull(),
    authorUserId: text("author_user_id"),
    authorAgentId: uuid("author_agent_id").references(() => agents.id, { onDelete: "set null" }),
    body: text("body").notNull().default(""),
    status: text("status").notNull().default("completed"),
    error: text("error"),
    runId: uuid("run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
    inReplyToMessageId: uuid("in_reply_to_message_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    threadCreatedIdx: index("direct_chat_messages_thread_created_idx").on(table.threadId, table.createdAt),
    companyThreadStatusIdx: index("direct_chat_messages_company_thread_status_idx").on(
      table.companyId,
      table.threadId,
      table.status,
    ),
    runIdx: index("direct_chat_messages_run_idx").on(table.runId),
  }),
);
