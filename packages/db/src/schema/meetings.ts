import { pgTable, uuid, text, timestamp, integer, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { agents } from "./agents.js";
import { heartbeatRuns } from "./heartbeat_runs.js";

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    topic: text("topic").notNull(),
    status: text("status").notNull().default("open"),
    markdownPath: text("markdown_path").notNull(),
    createdByUserId: text("created_by_user_id"),
    createdByAgentId: uuid("created_by_agent_id").references(() => agents.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyUpdatedIdx: index("meetings_company_updated_idx").on(table.companyId, table.updatedAt),
    companyStatusIdx: index("meetings_company_status_idx").on(table.companyId, table.status),
    titleSearchIdx: index("meetings_title_search_idx").using("gin", table.title.op("gin_trgm_ops")),
    topicSearchIdx: index("meetings_topic_search_idx").using("gin", table.topic.op("gin_trgm_ops")),
  }),
);

export const meetingParticipants = pgTable(
  "meeting_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    meetingIdx: index("meeting_participants_meeting_idx").on(table.meetingId),
    companyAgentIdx: index("meeting_participants_company_agent_idx").on(table.companyId, table.agentId),
    meetingAgentUq: uniqueIndex("meeting_participants_meeting_agent_uq").on(table.meetingId, table.agentId),
  }),
);

export const meetingMessages = pgTable(
  "meeting_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
    roundNumber: integer("round_number").notNull().default(0),
    authorType: text("author_type").notNull(),
    authorUserId: text("author_user_id"),
    authorAgentId: uuid("author_agent_id").references(() => agents.id, { onDelete: "set null" }),
    body: text("body").notNull().default(""),
    status: text("status").notNull().default("completed"),
    error: text("error"),
    runId: uuid("run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    meetingCreatedIdx: index("meeting_messages_meeting_created_idx").on(table.meetingId, table.createdAt),
    companyMeetingRoundIdx: index("meeting_messages_company_meeting_round_idx").on(
      table.companyId,
      table.meetingId,
      table.roundNumber,
    ),
    runIdx: index("meeting_messages_run_idx").on(table.runId),
    bodySearchIdx: index("meeting_messages_body_search_idx").using("gin", table.body.op("gin_trgm_ops")),
  }),
);
