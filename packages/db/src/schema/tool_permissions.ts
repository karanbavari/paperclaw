import { boolean, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type {
  ToolPermissionBudgetLimit,
  ToolPermissionDecision,
  ToolPermissionEffect,
  ToolPermissionSubjectType,
} from "@kesarcloud/shared";
import { agents } from "./agents.js";
import { approvals } from "./approvals.js";
import { companies } from "./companies.js";
import { heartbeatRuns } from "./heartbeat_runs.js";

export const toolPermissionPolicies = pgTable(
  "tool_permission_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    subjectType: text("subject_type").$type<ToolPermissionSubjectType>().notNull(),
    subjectId: uuid("subject_id").references(() => agents.id, { onDelete: "cascade" }),
    pluginKey: text("plugin_key"),
    toolName: text("tool_name"),
    effect: text("effect").$type<ToolPermissionEffect>().notNull(),
    budgetLimit: jsonb("budget_limit").$type<ToolPermissionBudgetLimit | null>(),
    enabled: boolean("enabled").notNull().default(true),
    createdByUserId: text("created_by_user_id"),
    updatedByUserId: text("updated_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companySubjectIdx: index("tool_permission_policies_company_subject_idx").on(
      table.companyId,
      table.subjectType,
      table.subjectId,
    ),
    companyToolIdx: index("tool_permission_policies_company_tool_idx").on(
      table.companyId,
      table.pluginKey,
      table.toolName,
    ),
  }),
);

export const toolPermissionDecisions = pgTable(
  "tool_permission_decisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),
    runId: uuid("run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),
    pluginKey: text("plugin_key").notNull(),
    toolName: text("tool_name").notNull(),
    namespacedTool: text("namespaced_tool").notNull(),
    invocationKind: text("invocation_kind").notNull().default("agent_run"),
    decision: text("decision").$type<ToolPermissionDecision>().notNull(),
    policyId: uuid("policy_id").references(() => toolPermissionPolicies.id, { onDelete: "set null" }),
    approvalId: uuid("approval_id").references(() => approvals.id, { onDelete: "set null" }),
    reason: text("reason"),
    parameterHash: text("parameter_hash"),
    estimatedCostCents: integer("estimated_cost_cents"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyCreatedIdx: index("tool_permission_decisions_company_created_idx").on(table.companyId, table.createdAt),
    companyAgentIdx: index("tool_permission_decisions_company_agent_idx").on(table.companyId, table.agentId),
    companyToolIdx: index("tool_permission_decisions_company_tool_idx").on(
      table.companyId,
      table.pluginKey,
      table.toolName,
    ),
    approvalIdx: index("tool_permission_decisions_approval_idx").on(table.approvalId),
  }),
);
