import type {
  ToolPermissionDecision,
  ToolPermissionEffect,
  ToolPermissionSubjectType,
} from "../constants.js";

export interface ToolPermissionBudgetLimit {
  amount: number;
  windowKind: "calendar_month_utc";
  metric: "execution_count";
}

export interface ToolPermissionPolicy {
  id: string;
  companyId: string;
  subjectType: ToolPermissionSubjectType;
  subjectId: string | null;
  pluginKey: string | null;
  toolName: string | null;
  effect: ToolPermissionEffect;
  budgetLimit: ToolPermissionBudgetLimit | null;
  enabled: boolean;
  createdByUserId: string | null;
  updatedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertToolPermissionPolicyRequest {
  id?: string;
  subjectType: ToolPermissionSubjectType;
  subjectId?: string | null;
  pluginKey?: string | null;
  toolName?: string | null;
  effect: ToolPermissionEffect;
  budgetLimit?: ToolPermissionBudgetLimit | null;
  enabled?: boolean;
}

export interface ReplaceToolPermissionPoliciesRequest {
  policies: UpsertToolPermissionPolicyRequest[];
}

export interface EffectiveToolPermission {
  companyId: string;
  agentId: string | null;
  pluginKey: string;
  toolName: string;
  namespacedTool: string;
  effect: Exclude<ToolPermissionEffect, "inherit">;
  source: "agent" | "company_tool" | "company_plugin" | "company_default" | "implicit_allow";
  policyId: string | null;
  reason: string;
  budgetLimit: ToolPermissionBudgetLimit | null;
}

export interface ToolPermissionListResponse {
  companyId: string;
  policies: ToolPermissionPolicy[];
  effective: EffectiveToolPermission[];
}

export interface ToolPermissionDecisionRecord {
  id: string;
  companyId: string;
  agentId: string | null;
  runId: string | null;
  pluginKey: string;
  toolName: string;
  namespacedTool: string;
  invocationKind: string;
  decision: ToolPermissionDecision;
  policyId: string | null;
  approvalId: string | null;
  reason: string | null;
  parameterHash: string | null;
  createdAt: Date;
}
