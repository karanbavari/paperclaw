import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { agents } from "./agents.js";
import { approvals } from "./approvals.js";
import { companies } from "./companies.js";
import { executionWorkspaces } from "./execution_workspaces.js";
import { projects } from "./projects.js";

export const researchLabs = pgTable(
  "research_labs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    executionWorkspaceId: uuid("execution_workspace_id").references(() => executionWorkspaces.id, { onDelete: "set null" }),
    ownerAgentId: uuid("owner_agent_id").references(() => agents.id, { onDelete: "set null" }),
    ownerUserId: text("owner_user_id"),
    boardApprovalId: uuid("board_approval_id").references(() => approvals.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    objective: text("objective").notNull(),
    labType: text("lab_type").notNull().default("research"),
    status: text("status").notNull().default("draft"),
    allowedAgentIds: jsonb("allowed_agent_ids").$type<string[]>().notNull().default([]),
    demoUrls: jsonb("demo_urls").$type<string[]>().notNull().default([]),
    artifacts: jsonb("artifacts").$type<Array<Record<string, unknown>>>().notNull().default([]),
    finalReport: text("final_report"),
    decisionNote: text("decision_note"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    submittedToCeoAt: timestamp("submitted_to_ceo_at", { withTimezone: true }),
    submittedToBoardAt: timestamp("submitted_to_board_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyStatusIdx: index("research_labs_company_status_idx").on(table.companyId, table.status),
    companyUpdatedIdx: index("research_labs_company_updated_idx").on(table.companyId, table.updatedAt),
    companyProjectIdx: index("research_labs_company_project_idx").on(table.companyId, table.projectId),
    companyWorkspaceIdx: index("research_labs_company_workspace_idx").on(table.companyId, table.executionWorkspaceId),
    companyOwnerAgentIdx: index("research_labs_company_owner_agent_idx").on(table.companyId, table.ownerAgentId),
  }),
);
