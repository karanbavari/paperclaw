import { createHash } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  approvals,
  toolPermissionDecisions,
  toolPermissionPolicies,
} from "@kesarcloud/db";
import type {
  EffectiveToolPermission,
  ToolPermissionDecision,
  ToolPermissionEffect,
  ToolPermissionPolicy,
  UpsertAgentToolPermissionPolicyRequest,
  UpsertToolPermissionPolicyRequest,
} from "@kesarcloud/shared";
import { approvalService } from "./approvals.js";
import { logActivity } from "./activity-log.js";

type ActorInfo = {
  actorType: "agent" | "user" | "system" | "plugin";
  actorId: string;
  agentId?: string | null;
  runId?: string | null;
};

type RegisteredToolLike = {
  pluginId: string;
  name: string;
  namespacedName: string;
};

type EvaluationInput = {
  companyId: string;
  agentId: string | null;
  runId: string | null;
  invocationKind: string;
  tool: RegisteredToolLike;
  parameters: unknown;
  actor: ActorInfo;
};

export class ToolPermissionBlockedError extends Error {
  status: number;
  decision: ToolPermissionDecision;
  approvalId: string | null;

  constructor(message: string, input: {
    status: number;
    decision: ToolPermissionDecision;
    approvalId?: string | null;
  }) {
    super(message);
    this.name = "ToolPermissionBlockedError";
    this.status = input.status;
    this.decision = input.decision;
    this.approvalId = input.approvalId ?? null;
  }
}

export function toolPermissionService(db: Db) {
  const approvalsSvc = approvalService(db);

  function parameterHash(parameters: unknown): string {
    return createHash("sha256")
      .update(JSON.stringify(parameters ?? null))
      .digest("hex");
  }

  function parameterSummary(parameters: unknown): Record<string, unknown> {
    if (!parameters || typeof parameters !== "object" || Array.isArray(parameters)) {
      return { kind: typeof parameters };
    }
    return {
      keys: Object.keys(parameters as Record<string, unknown>).sort().slice(0, 25),
    };
  }

  function toPolicy(row: typeof toolPermissionPolicies.$inferSelect): ToolPermissionPolicy {
    return {
      id: row.id,
      companyId: row.companyId,
      subjectType: row.subjectType,
      subjectId: row.subjectId,
      pluginKey: row.pluginKey,
      toolName: row.toolName,
      effect: row.effect,
      budgetLimit: row.budgetLimit ?? null,
      enabled: row.enabled,
      createdByUserId: row.createdByUserId,
      updatedByUserId: row.updatedByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async function listPolicies(companyId: string): Promise<ToolPermissionPolicy[]> {
    const rows = await db
      .select()
      .from(toolPermissionPolicies)
      .where(eq(toolPermissionPolicies.companyId, companyId));
    return rows.map(toPolicy);
  }

  function rankPolicy(policy: ToolPermissionPolicy, agentId: string | null, pluginKey: string, toolName: string) {
    if (!policy.enabled || policy.effect === "inherit") return -1;
    if (policy.subjectType === "agent" && (!agentId || policy.subjectId !== agentId)) return -1;
    if (policy.subjectType === "company" && policy.subjectId) return -1;
    if (policy.pluginKey && policy.pluginKey !== pluginKey) return -1;
    if (policy.toolName && policy.toolName !== toolName) return -1;

    let score = 0;
    if (policy.subjectType === "agent") score += 100;
    if (policy.pluginKey) score += 10;
    if (policy.toolName) score += 5;
    return score;
  }

  async function resolveEffective(
    companyId: string,
    agentId: string | null,
    pluginKey: string,
    toolName: string,
  ): Promise<EffectiveToolPermission> {
    const policies = await listPolicies(companyId);
    const best = policies
      .map((policy) => ({ policy, score: rankPolicy(policy, agentId, pluginKey, toolName) }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score)[0]?.policy ?? null;

    const namespacedTool = `${pluginKey}:${toolName}`;
    if (!best) {
      return {
        companyId,
        agentId,
        pluginKey,
        toolName,
        namespacedTool,
        effect: "approval_required",
        source: "company_default",
        policyId: null,
        reason: "Company default requires approval for plugin tools.",
        budgetLimit: null,
      };
    }

    const source =
      best.subjectType === "agent"
        ? "agent"
        : best.pluginKey && best.toolName
          ? "company_tool"
          : best.pluginKey
            ? "company_plugin"
            : "company_default";
    return {
      companyId,
      agentId,
      pluginKey,
      toolName,
      namespacedTool,
      effect: best.effect === "inherit" ? "approval_required" : best.effect,
      source,
      policyId: best.id,
      reason: `Matched ${source.replaceAll("_", " ")} policy.`,
      budgetLimit: best.budgetLimit,
    };
  }

  async function replacePolicies(
    companyId: string,
    policies: UpsertToolPermissionPolicyRequest[],
    actor: ActorInfo,
  ): Promise<ToolPermissionPolicy[]> {
    const now = new Date();
    await db.delete(toolPermissionPolicies).where(eq(toolPermissionPolicies.companyId, companyId));
    if (policies.length > 0) {
      await db.insert(toolPermissionPolicies).values(policies.map((policy) => ({
        companyId,
        subjectType: policy.subjectType,
        subjectId: policy.subjectType === "agent" ? policy.subjectId ?? null : null,
        pluginKey: policy.pluginKey ?? null,
        toolName: policy.toolName ?? null,
        effect: policy.effect,
        budgetLimit: policy.effect === "budget_limited" ? policy.budgetLimit ?? null : null,
        enabled: policy.enabled ?? true,
        createdByUserId: actor.actorType === "user" ? actor.actorId : null,
        updatedByUserId: actor.actorType === "user" ? actor.actorId : null,
        createdAt: now,
        updatedAt: now,
      })));
    }
    await logActivity(db, {
      companyId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      agentId: actor.agentId ?? null,
      action: "tool_permissions.updated",
      entityType: "company",
      entityId: companyId,
      details: { policyCount: policies.length },
    });
    return listPolicies(companyId);
  }

  async function replaceAgentPolicies(
    companyId: string,
    agentId: string,
    policies: UpsertAgentToolPermissionPolicyRequest[],
    actor: ActorInfo,
  ): Promise<ToolPermissionPolicy[]> {
    const now = new Date();
    await db.delete(toolPermissionPolicies).where(and(
      eq(toolPermissionPolicies.companyId, companyId),
      eq(toolPermissionPolicies.subjectType, "agent"),
      eq(toolPermissionPolicies.subjectId, agentId),
    ));
    if (policies.length > 0) {
      await db.insert(toolPermissionPolicies).values(policies.map((policy) => ({
        companyId,
        subjectType: "agent" as const,
        subjectId: agentId,
        pluginKey: policy.pluginKey ?? null,
        toolName: policy.toolName ?? null,
        effect: policy.effect,
        budgetLimit: policy.effect === "budget_limited" ? policy.budgetLimit ?? null : null,
        enabled: policy.enabled ?? true,
        createdByUserId: actor.actorType === "user" ? actor.actorId : null,
        updatedByUserId: actor.actorType === "user" ? actor.actorId : null,
        createdAt: now,
        updatedAt: now,
      })));
    }
    await logActivity(db, {
      companyId,
      actorType: actor.actorType,
      actorId: actor.actorId,
      agentId: actor.agentId ?? null,
      runId: actor.runId ?? null,
      action: "tool_permissions.agent_updated",
      entityType: "agent",
      entityId: agentId,
      details: { policyCount: policies.length },
    });
    return listPolicies(companyId);
  }

  async function recordDecision(input: EvaluationInput, effective: EffectiveToolPermission, data: {
    decision: ToolPermissionDecision;
    reason: string;
    approvalId?: string | null;
  }) {
    const hash = parameterHash(input.parameters);
    const [record] = await db.insert(toolPermissionDecisions).values({
      companyId: input.companyId,
      agentId: input.agentId,
      runId: input.runId,
      pluginKey: input.tool.pluginId,
      toolName: input.tool.name,
      namespacedTool: input.tool.namespacedName,
      invocationKind: input.invocationKind,
      decision: data.decision,
      policyId: effective.policyId,
      approvalId: data.approvalId ?? null,
      reason: data.reason,
      parameterHash: hash,
    }).returning();
    await logActivity(db, {
      companyId: input.companyId,
      actorType: input.actor.actorType,
      actorId: input.actor.actorId,
      agentId: input.agentId,
      runId: input.runId,
      action: `tool_permission.${data.decision}`,
      entityType: "plugin_tool",
      entityId: input.tool.namespacedName,
      details: {
        pluginKey: input.tool.pluginId,
        toolName: input.tool.name,
        decision: data.decision,
        policyId: effective.policyId,
        approvalId: data.approvalId ?? null,
        reason: data.reason,
        parameterHash: hash,
      },
    });
    return record;
  }

  async function countAllowedThisMonth(input: EvaluationInput): Promise<number> {
    const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
    const rows = await db
      .select()
      .from(toolPermissionDecisions)
      .where(and(
        eq(toolPermissionDecisions.companyId, input.companyId),
        input.agentId ? eq(toolPermissionDecisions.agentId, input.agentId) : isNull(toolPermissionDecisions.agentId),
        eq(toolPermissionDecisions.pluginKey, input.tool.pluginId),
        eq(toolPermissionDecisions.toolName, input.tool.name),
        eq(toolPermissionDecisions.decision, "allowed"),
        gte(toolPermissionDecisions.createdAt, start),
      ));
    return rows.length;
  }

  async function createToolApproval(input: EvaluationInput, effective: EffectiveToolPermission, hash: string) {
    const [agent] = input.agentId
      ? await db.select({ name: agents.name }).from(agents).where(eq(agents.id, input.agentId)).limit(1)
      : [null];
    return approvalsSvc.create(input.companyId, {
      type: "tool_execution",
      requestedByAgentId: input.agentId,
      requestedByUserId: input.actor.actorType === "user" ? input.actor.actorId : null,
      status: "pending",
      payload: {
        title: `Tool execution: ${input.tool.namespacedName}`,
        pluginKey: input.tool.pluginId,
        toolName: input.tool.name,
        namespacedTool: input.tool.namespacedName,
        agentId: input.agentId,
        agentName: agent?.name ?? null,
        runId: input.runId,
        policyId: effective.policyId,
        parameterHash: hash,
        parameterSummary: parameterSummary(input.parameters),
        summary: "A tool permission policy requires board approval before this plugin tool can run.",
        nextActionOnApproval: "The agent or operator can retry the tool call after approval.",
      },
      decisionNote: null,
      decidedByUserId: null,
      decidedAt: null,
      updatedAt: new Date(),
    });
  }

  async function findMatchingToolApproval(
    input: EvaluationInput,
    hash: string,
    statuses: string[],
  ): Promise<typeof approvals.$inferSelect | null> {
    const rows = await db
      .select()
      .from(approvals)
      .where(and(
        eq(approvals.companyId, input.companyId),
        eq(approvals.type, "tool_execution"),
        inArray(approvals.status, statuses),
        input.agentId
          ? eq(approvals.requestedByAgentId, input.agentId)
          : isNull(approvals.requestedByAgentId),
      ))
      .orderBy(desc(approvals.createdAt))
      .limit(50);

    return rows.find((approval) => {
      const payload = approval.payload as Record<string, unknown>;
      return (
        payload.pluginKey === input.tool.pluginId &&
        payload.toolName === input.tool.name &&
        payload.runId === input.runId &&
        payload.parameterHash === hash
      );
    }) ?? null;
  }

  async function enforce(input: EvaluationInput): Promise<EffectiveToolPermission> {
    const effective = await resolveEffective(input.companyId, input.agentId, input.tool.pluginId, input.tool.name);
    if (effective.effect === "allow") {
      await recordDecision(input, effective, { decision: "allowed", reason: effective.reason });
      return effective;
    }

    if (effective.effect === "deny") {
      await recordDecision(input, effective, { decision: "denied", reason: effective.reason });
      throw new ToolPermissionBlockedError("Tool execution denied by policy", {
        status: 403,
        decision: "denied",
      });
    }

    if (effective.effect === "budget_limited") {
      const limit = effective.budgetLimit?.amount ?? 0;
      const used = await countAllowedThisMonth(input);
      if (limit > 0 && used < limit) {
        await recordDecision(input, effective, {
          decision: "allowed",
          reason: `${effective.reason} ${used + 1}/${limit} executions used this month.`,
        });
        return effective;
      }
      await recordDecision(input, effective, {
        decision: "budget_blocked",
        reason: `Tool execution budget exhausted (${used}/${limit}).`,
      });
      throw new ToolPermissionBlockedError("Tool execution budget exhausted", {
        status: 409,
        decision: "budget_blocked",
      });
    }

    const hash = parameterHash(input.parameters);
    const approved = await findMatchingToolApproval(input, hash, ["approved"]);
    if (approved) {
      await recordDecision(input, effective, {
        decision: "allowed",
        reason: "Matched approved tool execution approval.",
        approvalId: approved.id,
      });
      return effective;
    }

    const existingPending = await findMatchingToolApproval(input, hash, ["pending", "revision_requested"]);
    const approval = existingPending ?? await createToolApproval(input, effective, hash);
    await recordDecision(input, effective, {
      decision: "approval_required",
      reason: effective.reason,
      approvalId: approval?.id ?? null,
    });
    throw new ToolPermissionBlockedError("Tool execution requires board approval", {
      status: 409,
      decision: "approval_required",
      approvalId: approval?.id ?? null,
    });
  }

  async function listDecisions(companyId: string, limit = 100) {
    return db
      .select()
      .from(toolPermissionDecisions)
      .where(eq(toolPermissionDecisions.companyId, companyId))
      .orderBy(desc(toolPermissionDecisions.createdAt))
      .limit(limit);
  }

  return {
    enforce,
    listDecisions,
    listPolicies,
    replaceAgentPolicies,
    replacePolicies,
    resolveEffective,
  };
}
