import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { companies } from "./companies.js";
import { heartbeatRuns } from "./heartbeat_runs.js";
import { projectWorkspaces } from "./project_workspaces.js";
import { projects } from "./projects.js";

export const abStudies = pgTable("ab_studies", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").notNull().references(() => projectWorkspaces.id),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidenceSummary: text("evidence_summary"),
  sourceSummary: text("source_summary").notNull(),
  sourceHash: text("source_hash").notNull(),
  auditReport: jsonb("audit_report").$type<{ summary: string; files: string[]; warnings: string[]; priceEvidence?: { productPrice: number; currency: string; pricePeriod: "month" | "year" | "one_time"; sourcePath: string } }>(),
  marketContext: jsonb("market_context").$type<{ country?: string; currency?: string; productPrice?: number; pricePeriod?: "month" | "year" | "one_time" }>(),
  draftHeartbeatRunId: uuid("draft_heartbeat_run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
  draftStatus: text("draft_status").notNull().default("starter"),
  draftError: text("draft_error"),
  audience: jsonb("audience").$type<Array<{ name: string; share: number; need: string }>>().notNull().default([]),
  variantA: text("variant_a").notNull(),
  variantB: text("variant_b").notNull(),
  status: text("status").notNull().default("draft"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyUpdatedIdx: index("ab_studies_company_updated_idx").on(table.companyId, table.updatedAt),
  companyProjectIdx: index("ab_studies_company_project_idx").on(table.companyId, table.projectId),
}));

export const abPersonas = pgTable("ab_personas", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  studyId: uuid("study_id").notNull().references(() => abStudies.id, { onDelete: "cascade" }),
  ordinal: integer("ordinal").notNull(),
  segment: text("segment").notNull(),
  profile: jsonb("profile").$type<Record<string, unknown>>().notNull(),
  assignedVariant: text("assigned_variant").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  studyOrdinalUq: uniqueIndex("ab_personas_study_ordinal_uq").on(table.studyId, table.ordinal),
  companyStudyIdx: index("ab_personas_company_study_idx").on(table.companyId, table.studyId),
}));

export const abRuns = pgTable("ab_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  studyId: uuid("study_id").notNull().references(() => abStudies.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending_approval"),
  targetCount: integer("target_count").notNull().default(1000),
  outputVersion: integer("output_version").notNull().default(1),
  sourceHash: text("source_hash").notNull(),
  variantA: text("variant_a").notNull(),
  variantB: text("variant_b").notNull(),
  completedCount: integer("completed_count").notNull().default(0),
  error: text("error"),
  requestedByUserId: text("requested_by_user_id"),
  approvedByUserId: text("approved_by_user_id"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  companyStudyIdx: index("ab_runs_company_study_idx").on(table.companyId, table.studyId, table.createdAt),
  statusIdx: index("ab_runs_status_idx").on(table.status, table.updatedAt),
}));

export const abBatches = pgTable("ab_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  runId: uuid("run_id").notNull().references(() => abRuns.id, { onDelete: "cascade" }),
  batchIndex: integer("batch_index").notNull(),
  startOrdinal: integer("start_ordinal").notNull(),
  endOrdinal: integer("end_ordinal").notNull(),
  heartbeatRunId: uuid("heartbeat_run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
  status: text("status").notNull().default("queued"),
  attempts: integer("attempts").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  runBatchUq: uniqueIndex("ab_batches_run_index_uq").on(table.runId, table.batchIndex),
  statusIdx: index("ab_batches_status_idx").on(table.status, table.updatedAt),
}));

export const abFeedback = pgTable("ab_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  studyId: uuid("study_id").notNull().references(() => abStudies.id, { onDelete: "cascade" }),
  runId: uuid("run_id").notNull().references(() => abRuns.id, { onDelete: "cascade" }),
  personaId: uuid("persona_id").notNull().references(() => abPersonas.id, { onDelete: "cascade" }),
  variant: text("variant").notNull(),
  rating: integer("rating").notNull(),
  budgetFit: text("budget_fit").notNull().default("unknown"),
  workflowFit: text("workflow_fit").notNull().default("unknown"),
  rationale: text("rationale").notNull(),
  objection: text("objection"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  runPersonaUq: uniqueIndex("ab_feedback_run_persona_uq").on(table.runId, table.personaId),
  companyRunRatingIdx: index("ab_feedback_company_run_rating_idx").on(table.companyId, table.runId, table.rating),
}));
