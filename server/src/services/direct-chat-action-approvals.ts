import { and, eq, inArray } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  approvals,
  directChatMessages,
  directChatThreads,
  goals,
  issues,
  projects,
} from "@kesarcloud/db";
import {
  directChatActionApprovalPayloadSchema,
  type DirectChatActionApprovalPayload,
} from "@kesarcloud/shared";
import { unprocessable } from "../errors.js";
import { directChatService } from "./direct-chat.js";
import { goalService } from "./goals.js";
import { issueReferenceService } from "./issue-references.js";
import { issueService } from "./issues.js";
import { meetingService } from "./meetings.js";
import { researchLabService } from "./research-labs.js";

type ApprovalRow = typeof approvals.$inferSelect;

type AppliedAction = NonNullable<DirectChatActionApprovalPayload["appliedAction"]>;

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function readPayload(approval: ApprovalRow): DirectChatActionApprovalPayload {
  const parsed = directChatActionApprovalPayloadSchema.safeParse(approval.payload);
  if (!parsed.success) {
    throw unprocessable("Invalid Direct Chat action approval payload", {
      issues: parsed.error.issues,
    });
  }
  return parsed.data;
}

function approvalActor(approval: ApprovalRow) {
  if (approval.requestedByAgentId) {
    return {
      actorType: "agent" as const,
      actorId: approval.requestedByAgentId,
      agentId: approval.requestedByAgentId,
    };
  }
  return {
    actorType: "user" as const,
    actorId: approval.requestedByUserId ?? "board",
    agentId: null,
  };
}

function actionLabel(kind: DirectChatActionApprovalPayload["action"]["kind"]) {
  if (kind === "create_meeting") return "meeting";
  if (kind === "create_issue") return "issue";
  if (kind === "create_goal") return "goal";
  return "research lab";
}

export function directChatActionApprovalService(db: Db) {
  const directChat = directChatService(db);

  async function validateDirectChatSource(companyId: string, payload: DirectChatActionApprovalPayload) {
    const thread = await db
      .select({ id: directChatThreads.id })
      .from(directChatThreads)
      .where(and(
        eq(directChatThreads.companyId, companyId),
        eq(directChatThreads.id, payload.source.directChatThreadId),
      ))
      .then((rows) => rows[0] ?? null);
    if (!thread) throw unprocessable("Direct Chat thread does not belong to this company");

    if (payload.source.directChatMessageId) {
      const message = await db
        .select({ id: directChatMessages.id })
        .from(directChatMessages)
        .where(and(
          eq(directChatMessages.companyId, companyId),
          eq(directChatMessages.threadId, payload.source.directChatThreadId),
          eq(directChatMessages.id, payload.source.directChatMessageId),
        ))
        .then((rows) => rows[0] ?? null);
      if (!message) throw unprocessable("Direct Chat source message does not belong to this thread");
    }
  }

  async function assertCompanyIds(tableName: string, ids: string[], selectIds: () => Promise<Array<{ id: string }>>) {
    const uniqueIds = unique(ids);
    if (uniqueIds.length === 0) return;
    const rows = await selectIds();
    const found = new Set(rows.map((row) => row.id));
    const missing = uniqueIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
      throw unprocessable(`${tableName} do not belong to this company`, { ids: missing });
    }
  }

  async function validateAction(companyId: string, payload: DirectChatActionApprovalPayload) {
    await validateDirectChatSource(companyId, payload);
    const { action } = payload;
    if (action.kind === "create_meeting") {
      const ids = action.input.agentIds;
      await assertCompanyIds("Selected agents", ids, () =>
        db.select({ id: agents.id }).from(agents).where(and(eq(agents.companyId, companyId), inArray(agents.id, ids))),
      );
      return;
    }
    if (action.kind === "create_issue") {
      const projectIds = unique([action.input.projectId]);
      const goalIds = unique([action.input.goalId]);
      const parentIssueIds = unique([action.input.parentId, ...(action.input.blockedByIssueIds ?? [])]);
      const assigneeIds = unique([action.input.assigneeAgentId]);
      await assertCompanyIds("Referenced projects", projectIds, () =>
        db.select({ id: projects.id }).from(projects).where(and(eq(projects.companyId, companyId), inArray(projects.id, projectIds))),
      );
      await assertCompanyIds("Referenced goals", goalIds, () =>
        db.select({ id: goals.id }).from(goals).where(and(eq(goals.companyId, companyId), inArray(goals.id, goalIds))),
      );
      await assertCompanyIds("Referenced issues", parentIssueIds, () =>
        db.select({ id: issues.id }).from(issues).where(and(eq(issues.companyId, companyId), inArray(issues.id, parentIssueIds))),
      );
      await assertCompanyIds("Referenced agents", assigneeIds, () =>
        db.select({ id: agents.id }).from(agents).where(and(eq(agents.companyId, companyId), inArray(agents.id, assigneeIds))),
      );
      return;
    }
    if (action.kind === "create_goal") {
      const goalIds = unique([action.input.parentId]);
      const ownerIds = unique([action.input.ownerAgentId]);
      await assertCompanyIds("Referenced goals", goalIds, () =>
        db.select({ id: goals.id }).from(goals).where(and(eq(goals.companyId, companyId), inArray(goals.id, goalIds))),
      );
      await assertCompanyIds("Referenced agents", ownerIds, () =>
        db.select({ id: agents.id }).from(agents).where(and(eq(agents.companyId, companyId), inArray(agents.id, ownerIds))),
      );
      return;
    }
    const projectIds = unique([action.input.projectId]);
    const agentIds = unique([action.input.ownerAgentId, ...(action.input.allowedAgentIds ?? [])]);
    await assertCompanyIds("Referenced projects", projectIds, () =>
      db.select({ id: projects.id }).from(projects).where(and(eq(projects.companyId, companyId), inArray(projects.id, projectIds))),
    );
    await assertCompanyIds("Referenced agents", agentIds, () =>
      db.select({ id: agents.id }).from(agents).where(and(eq(agents.companyId, companyId), inArray(agents.id, agentIds))),
    );
  }

  async function addStatusMessage(
    approval: ApprovalRow,
    payload: DirectChatActionApprovalPayload,
    status: "pending" | "approved" | "rejected",
    appliedAction?: AppliedAction,
  ) {
    const actionKind = payload.action.kind;
    const metadata = {
      kind: "direct_chat_action_approval",
      approvalId: approval.id,
      approvalStatus: status,
      actionKind,
      title: payload.title,
      createdEntity: appliedAction ?? null,
    };
    const label = actionLabel(actionKind);
    const body = status === "pending"
      ? `Approval request sent to Board Inbox: ${payload.title}`
      : status === "approved"
        ? `Approved. The ${label} has been created. Please check your Inbox or approval details for the full context.`
        : `Board rejected this request: ${payload.title}. Please check your Inbox or approval details for the decision.`;

    await directChat.addSystemMessage({
      companyId: approval.companyId,
      threadId: payload.source.directChatThreadId,
      body,
      metadata,
    });
  }

  async function applyAction(approval: ApprovalRow, payload: DirectChatActionApprovalPayload): Promise<AppliedAction> {
    const { action } = payload;
    if (payload.appliedAction) return payload.appliedAction;

    if (action.kind === "create_meeting") {
      const meeting = await meetingService(db).create({
        companyId: approval.companyId,
        title: action.input.title,
        topic: action.input.topic,
        agentIds: action.input.agentIds,
        actor: approval.requestedByAgentId
          ? { type: "agent", id: approval.requestedByAgentId, agentId: approval.requestedByAgentId }
          : { type: "user", id: approval.requestedByUserId ?? "board" },
      });
      return {
        entityType: "meeting",
        entityId: meeting.id,
        label: meeting.title,
        href: `/meetings/${meeting.id}`,
        appliedAt: new Date().toISOString(),
      };
    }

    if (action.kind === "create_issue") {
      const issue = await issueService(db).create(approval.companyId, {
        ...action.input,
        createdByAgentId: approval.requestedByAgentId,
        createdByUserId: approval.requestedByUserId,
      });
      await issueReferenceService(db).syncIssue(issue.id);
      return {
        entityType: "issue",
        entityId: issue.id,
        label: issue.identifier ? `${issue.identifier} ${issue.title}` : issue.title,
        href: `/issues/${issue.identifier ?? issue.id}`,
        appliedAt: new Date().toISOString(),
      };
    }

    if (action.kind === "create_goal") {
      const goal = await goalService(db).create(approval.companyId, action.input);
      return {
        entityType: "goal",
        entityId: goal.id,
        label: goal.title,
        href: `/goals/${goal.id}`,
        appliedAt: new Date().toISOString(),
      };
    }

    const lab = await researchLabService(db).create(approval.companyId, action.input, approvalActor(approval));
    return {
      entityType: "research_lab",
      entityId: lab.id,
      label: lab.title,
      href: `/research-labs/${lab.id}`,
      appliedAt: new Date().toISOString(),
    };
  }

  return {
    validatePayload: async (companyId: string, payload: Record<string, unknown>) => {
      const parsed = directChatActionApprovalPayloadSchema.parse(payload);
      await validateAction(companyId, parsed);
      return parsed;
    },

    recordApprovalRequested: async (approval: ApprovalRow) => {
      if (approval.type !== "direct_chat_action") return;
      const payload = readPayload(approval);
      await addStatusMessage(approval, payload, "pending");
    },

    applyApproved: async (approval: ApprovalRow) => {
      if (approval.type !== "direct_chat_action") return approval;
      const payload = readPayload(approval);
      await validateAction(approval.companyId, payload);
      const appliedAction = await applyAction(approval, payload);
      const [updated] = await db
        .update(approvals)
        .set({
          payload: { ...payload, appliedAction },
          updatedAt: new Date(),
        })
        .where(eq(approvals.id, approval.id))
        .returning();
      await addStatusMessage(updated ?? approval, { ...payload, appliedAction }, "approved", appliedAction);
      return updated ?? approval;
    },

    recordRejected: async (approval: ApprovalRow) => {
      if (approval.type !== "direct_chat_action") return;
      const payload = readPayload(approval);
      await addStatusMessage(approval, payload, "rejected");
    },
  };
}
