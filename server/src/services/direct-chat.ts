import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  companies,
  directChatMessages,
  directChatThreads,
  heartbeatRuns,
  issues,
  meetings,
  projects,
} from "@kesarcloud/db";
import {
  deriveAgentUrlKey,
  type Agent,
  type DirectChatDetail,
  type DirectChatMessage,
  type DirectChatMessageStatus,
  type DirectChatThread,
} from "@kesarcloud/shared";
import { conflict, forbidden, unprocessable } from "../errors.js";
import { publishLiveEvent } from "./live-events.js";

type DirectChatWakeup = (agentId: string, options: {
  source: "on_demand";
  triggerDetail: "manual";
  reason: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  requestedByActorType: "user" | "agent" | "system";
  requestedByActorId: string | null;
  contextSnapshot: Record<string, unknown>;
}) => Promise<{ id: string } | null | undefined>;

const ACTIVE_DIRECT_CHAT_MESSAGE_STATUSES = new Set(["queued", "running"]);

function toAgent(row: typeof agents.$inferSelect | null): Agent | null {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    urlKey: deriveAgentUrlKey(row.name, row.id),
    role: row.role as Agent["role"],
    title: row.title,
    icon: row.icon,
    status: row.status as Agent["status"],
    reportsTo: row.reportsTo,
    capabilities: row.capabilities,
    adapterType: row.adapterType,
    adapterConfig: row.adapterConfig,
    runtimeConfig: row.runtimeConfig,
    defaultEnvironmentId: row.defaultEnvironmentId,
    budgetMonthlyCents: row.budgetMonthlyCents,
    spentMonthlyCents: row.spentMonthlyCents,
    pauseReason: row.pauseReason as Agent["pauseReason"],
    pausedAt: row.pausedAt,
    permissions: row.permissions as unknown as Agent["permissions"],
    lastHeartbeatAt: row.lastHeartbeatAt,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function effectiveMessageStatus(input: {
  messageStatus: string;
  runStatus?: string | null;
}): DirectChatMessageStatus {
  if (input.messageStatus === "completed" || input.messageStatus === "failed") {
    return input.messageStatus;
  }
  if (input.runStatus === "running") return "running";
  if (input.runStatus === "failed" || input.runStatus === "cancelled" || input.runStatus === "timed_out") {
    return "failed";
  }
  if (input.runStatus === "succeeded") return "completed";
  return "queued";
}

function firstText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function parseJsonObject(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function readNestedText(record: Record<string, unknown>, keys: readonly string[]): string | null {
  let current: unknown = record;
  for (const key of keys) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return null;
    current = (current as Record<string, unknown>)[key];
  }
  return firstText(current);
}

function isStructuredRunEvent(record: Record<string, unknown>) {
  return (
    typeof record.type === "string" &&
    (
      "sessionID" in record ||
      "part" in record ||
      "messageID" in record ||
      "callID" in record ||
      record.type === "step_start" ||
      record.type === "step_finish" ||
      record.type === "tool_use" ||
      record.type === "tool_result" ||
      record.type === "text" ||
      record.type === "error"
    )
  );
}

function readStructuredRunEventText(record: Record<string, unknown>) {
  const type = firstText(record.type);
  if (type === "text") {
    return readNestedText(record, ["part", "text"]) ?? firstText(record.text);
  }
  if (type === "message" || type === "assistant_message") {
    return firstText(record.message) ?? firstText(record.content) ?? readNestedText(record, ["part", "text"]);
  }
  return null;
}

function sanitizeRunOutputText(value: unknown): string | null {
  const text = firstText(value);
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const extracted: string[] = [];
  let sawStructuredRunEvent = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    const event = parseJsonObject(line);
    if (!event || !isStructuredRunEvent(event)) continue;

    sawStructuredRunEvent = true;
    const eventText = readStructuredRunEventText(event);
    if (eventText) extracted.push(eventText);
  }

  if (!sawStructuredRunEvent) return text;
  const body = extracted.join("\n\n").trim();
  return body.length > 0 ? body : null;
}

function sanitizeAgentMessageBody(value: string) {
  return sanitizeRunOutputText(value) ?? "";
}

function readRunResponseBody(input: {
  body?: string | null;
  resultJson?: Record<string, unknown> | null;
  stdoutExcerpt?: string | null;
  error?: string | null;
}) {
  return (
    firstText(input.body) ??
    firstText(input.resultJson?.summary) ??
    firstText(input.resultJson?.result) ??
    firstText(input.resultJson?.message) ??
    sanitizeRunOutputText(input.stdoutExcerpt) ??
    firstText(input.error) ??
    ""
  );
}

function formatIsoDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buildTranscript(detail: DirectChatDetail, options: { maxChars?: number } = {}) {
  const lines: string[] = [];
  for (const message of detail.messages) {
    if (!message.body.trim()) continue;
    const label = message.authorType === "board"
      ? "Board"
      : message.authorType === "agent"
        ? message.authorAgent?.name ?? detail.ceoAgent?.name ?? "CEO"
        : "System";
    lines.push(`### ${label} (${formatIsoDate(message.createdAt)})`);
    lines.push(message.body.trim());
    lines.push("");
  }
  const transcript = lines.join("\n").trim();
  const maxChars = options.maxChars ?? 20_000;
  return transcript.length > maxChars
    ? `... earlier direct chat transcript truncated ...\n\n${transcript.slice(-maxChars)}`
    : transcript;
}

function summarizeText(value: string | null | undefined, maxChars = 220) {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (!text) return null;
  return text.length > maxChars ? `${text.slice(0, maxChars).trim()}...` : text;
}

function publishDirectChatMessageEvent(companyId: string, type: "direct_chat.message.created" | "direct_chat.message.updated", payload: {
  threadId: string;
  messageId: string;
  ceoAgentId: string;
}) {
  publishLiveEvent({
    companyId,
    type,
    payload,
  });
}

export function directChatService(db: Db) {
  async function resolveCeoAgent(companyId: string) {
    const rows = await db
      .select()
      .from(agents)
      .where(and(
        eq(agents.companyId, companyId),
        eq(agents.role, "ceo"),
        sql`${agents.status} not in ('terminated', 'pending_approval')`,
      ))
      .orderBy(sql`case when ${agents.reportsTo} is null then 0 else 1 end`, asc(agents.createdAt))
      .limit(1);

    const ceo = rows[0] ?? null;
    if (!ceo) {
      throw unprocessable("No active CEO agent found for this company");
    }
    return ceo;
  }

  async function getOrCreateThread(companyId: string, ceoAgentId: string) {
    const existing = await db
      .select()
      .from(directChatThreads)
      .where(and(
        eq(directChatThreads.companyId, companyId),
        eq(directChatThreads.kind, "board_ceo"),
        eq(directChatThreads.ceoAgentId, ceoAgentId),
      ))
      .then((rows) => rows[0] ?? null);
    if (existing) return existing;

    const [created] = await db
      .insert(directChatThreads)
      .values({
        companyId,
        kind: "board_ceo",
        ceoAgentId,
      })
      .onConflictDoNothing()
      .returning();

    if (created) return created;

    return db
      .select()
      .from(directChatThreads)
      .where(and(
        eq(directChatThreads.companyId, companyId),
        eq(directChatThreads.kind, "board_ceo"),
        eq(directChatThreads.ceoAgentId, ceoAgentId),
      ))
      .then((rows) => rows[0]!);
  }

  async function getDetailForThread(companyId: string, threadId: string): Promise<DirectChatDetail> {
    const threadRow = await db
      .select({ thread: directChatThreads, ceo: agents })
      .from(directChatThreads)
      .leftJoin(agents, eq(directChatThreads.ceoAgentId, agents.id))
      .where(and(eq(directChatThreads.companyId, companyId), eq(directChatThreads.id, threadId)))
      .then((rows) => rows[0] ?? null);
    if (!threadRow) throw unprocessable("Direct Chat thread not found");

    const latestMessage = await db
      .select({ createdAt: directChatMessages.createdAt })
      .from(directChatMessages)
      .where(eq(directChatMessages.threadId, threadId))
      .orderBy(desc(directChatMessages.createdAt))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    const messageRows = await db
      .select({ message: directChatMessages, agent: agents, runStatus: heartbeatRuns.status })
      .from(directChatMessages)
      .leftJoin(agents, eq(directChatMessages.authorAgentId, agents.id))
      .leftJoin(heartbeatRuns, eq(directChatMessages.runId, heartbeatRuns.id))
      .where(eq(directChatMessages.threadId, threadId))
      .orderBy(asc(directChatMessages.createdAt), asc(directChatMessages.id));

    const thread: DirectChatThread = {
      id: threadRow.thread.id,
      companyId: threadRow.thread.companyId,
      kind: threadRow.thread.kind as DirectChatThread["kind"],
      ceoAgentId: threadRow.thread.ceoAgentId,
      ceoAgent: toAgent(threadRow.ceo),
      latestMessageAt: latestMessage?.createdAt ?? null,
      createdAt: threadRow.thread.createdAt,
      updatedAt: threadRow.thread.updatedAt,
    };

    return {
      ...thread,
      messages: messageRows.map(({ message, agent, runStatus }): DirectChatMessage => ({
        id: message.id,
        companyId: message.companyId,
        threadId: message.threadId,
        authorType: message.authorType as DirectChatMessage["authorType"],
        authorUserId: message.authorUserId,
        authorAgentId: message.authorAgentId,
        authorAgent: toAgent(agent),
        body: message.authorType === "agent" ? sanitizeAgentMessageBody(message.body) : message.body,
        status: effectiveMessageStatus({ messageStatus: message.status, runStatus }),
        error: message.error,
        runId: message.runId,
        inReplyToMessageId: message.inReplyToMessageId,
        metadata: message.metadata,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })),
    };
  }

  async function getCompanyDirectChat(companyId: string) {
    const ceo = await resolveCeoAgent(companyId);
    const thread = await getOrCreateThread(companyId, ceo.id);
    return getDetailForThread(companyId, thread.id);
  }

  async function buildCompanySnapshot(companyId: string, currentAgentId: string) {
    const [
      company,
      roster,
      activeProjects,
      recentOpenIssues,
      recentMeetings,
      counts,
    ] = await Promise.all([
      db
        .select({
          id: companies.id,
          name: companies.name,
          description: companies.description,
          status: companies.status,
        })
        .from(companies)
        .where(eq(companies.id, companyId))
        .then((rows) => rows[0] ?? null),
      db
        .select({
          id: agents.id,
          name: agents.name,
          title: agents.title,
          role: agents.role,
          status: agents.status,
          reportsTo: agents.reportsTo,
          updatedAt: agents.updatedAt,
        })
        .from(agents)
        .where(eq(agents.companyId, companyId))
        .orderBy(sql`case when ${agents.id} = ${currentAgentId} then 0 else 1 end`, asc(agents.name))
        .limit(20),
      db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
          description: projects.description,
          updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(and(
          eq(projects.companyId, companyId),
          sql`${projects.archivedAt} is null`,
          sql`${projects.status} not in ('done', 'cancelled')`,
        ))
        .orderBy(desc(projects.updatedAt))
        .limit(8),
      db
        .select({
          id: issues.id,
          identifier: issues.identifier,
          title: issues.title,
          status: issues.status,
          priority: issues.priority,
          assigneeAgentId: issues.assigneeAgentId,
          updatedAt: issues.updatedAt,
        })
        .from(issues)
        .where(and(
          eq(issues.companyId, companyId),
          sql`${issues.hiddenAt} is null`,
          sql`${issues.status} not in ('done', 'cancelled')`,
        ))
        .orderBy(desc(issues.updatedAt))
        .limit(10),
      db
        .select({
          id: meetings.id,
          title: meetings.title,
          status: meetings.status,
          topic: meetings.topic,
          updatedAt: meetings.updatedAt,
        })
        .from(meetings)
        .where(eq(meetings.companyId, companyId))
        .orderBy(desc(meetings.updatedAt))
        .limit(5),
      Promise.all([
        db.select({ count: sql<number>`count(*)::int` }).from(agents).where(eq(agents.companyId, companyId)).then((rows) => Number(rows[0]?.count ?? 0)),
        db.select({ count: sql<number>`count(*)::int` }).from(agents).where(and(eq(agents.companyId, companyId), eq(agents.status, "active"))).then((rows) => Number(rows[0]?.count ?? 0)),
        db.select({ count: sql<number>`count(*)::int` }).from(issues).where(and(eq(issues.companyId, companyId), sql`${issues.hiddenAt} is null`, sql`${issues.status} not in ('done', 'cancelled')`)).then((rows) => Number(rows[0]?.count ?? 0)),
        db.select({ count: sql<number>`count(*)::int` }).from(projects).where(and(eq(projects.companyId, companyId), sql`${projects.archivedAt} is null`, sql`${projects.status} not in ('done', 'cancelled')`)).then((rows) => Number(rows[0]?.count ?? 0)),
        db.select({ count: sql<number>`count(*)::int` }).from(meetings).where(and(eq(meetings.companyId, companyId), eq(meetings.status, "open"))).then((rows) => Number(rows[0]?.count ?? 0)),
      ]),
    ]);

    return {
      companyName: company?.name ?? null,
      companyStatus: company?.status ?? null,
      companyDescription: summarizeText(company?.description),
      counts: {
        agents: counts[0],
        activeAgents: counts[1],
        openIssues: counts[2],
        activeProjects: counts[3],
        openMeetings: counts[4],
      },
      agentRoster: roster.map((agent) => ({
        id: agent.id,
        name: agent.name,
        title: agent.title,
        role: agent.role,
        status: agent.status,
        reportsTo: agent.reportsTo,
        isYou: agent.id === currentAgentId,
      })),
      activeProjects: activeProjects.map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        summary: summarizeText(project.description),
        updatedAt: project.updatedAt.toISOString(),
      })),
      recentOpenIssues: recentOpenIssues.map((issue) => ({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        status: issue.status,
        priority: issue.priority,
        assigneeAgentId: issue.assigneeAgentId,
        updatedAt: issue.updatedAt.toISOString(),
      })),
      recentMeetings: recentMeetings.map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        status: meeting.status,
        summary: summarizeText(meeting.topic),
        updatedAt: meeting.updatedAt.toISOString(),
      })),
    };
  }

  return {
    resolveCeoAgent,
    get: getCompanyDirectChat,

    addBoardMessage: async (input: {
      companyId: string;
      body: string;
      actor: { type: "user" | "agent" | "system"; id: string | null };
      wakeup: DirectChatWakeup;
    }) => {
      const ceo = await resolveCeoAgent(input.companyId);
      if (ceo.status === "paused") {
        throw conflict("CEO agent is paused", { agentId: ceo.id, status: ceo.status });
      }
      const thread = await getOrCreateThread(input.companyId, ceo.id);
      const now = new Date();
      const [boardMessage] = await db.insert(directChatMessages).values({
        companyId: input.companyId,
        threadId: thread.id,
        authorType: "board",
        authorUserId: input.actor.type === "user" ? input.actor.id : null,
        body: input.body,
        status: "completed",
        createdAt: now,
        updatedAt: now,
      }).returning();
      await db.update(directChatThreads).set({ updatedAt: now }).where(eq(directChatThreads.id, thread.id));
      publishDirectChatMessageEvent(input.companyId, "direct_chat.message.created", {
        threadId: thread.id,
        messageId: boardMessage.id,
        ceoAgentId: ceo.id,
      });

      const [responseMessage] = await db.insert(directChatMessages).values({
        companyId: input.companyId,
        threadId: thread.id,
        authorType: "agent",
        authorAgentId: ceo.id,
        body: "",
        status: "queued",
        inReplyToMessageId: boardMessage.id,
        metadata: {
          targetQuestion: input.body,
          targetQuestionMessageId: boardMessage.id,
        },
      }).returning();
      publishDirectChatMessageEvent(input.companyId, "direct_chat.message.created", {
        threadId: thread.id,
        messageId: responseMessage.id,
        ceoAgentId: ceo.id,
      });

      try {
        const detail = await getDetailForThread(input.companyId, thread.id);
        const companySnapshot = await buildCompanySnapshot(input.companyId, ceo.id);
        const run = await input.wakeup(ceo.id, {
          source: "on_demand",
          triggerDetail: "manual",
          reason: "direct_chat_message",
          payload: {
            directChatThreadId: thread.id,
            directChatMessageId: responseMessage.id,
          },
          idempotencyKey: `direct-chat:${thread.id}:message:${responseMessage.id}:agent:${ceo.id}`,
          requestedByActorType: input.actor.type,
          requestedByActorId: input.actor.id,
          contextSnapshot: {
            wakeReason: "direct_chat_message",
            taskKey: `direct-chat:${thread.id}:message:${responseMessage.id}`,
            directChatThreadId: thread.id,
            directChatMessageId: responseMessage.id,
            paperclawDirectChat: {
              id: thread.id,
              responseMessageId: responseMessage.id,
              company: {
                id: input.companyId,
                name: companySnapshot.companyName,
                status: companySnapshot.companyStatus,
                description: companySnapshot.companyDescription,
              },
              currentAgentId: ceo.id,
              currentAgentName: ceo.name,
              targetQuestion: input.body,
              requestedBy: "Board",
              companySnapshot,
              transcript: buildTranscript(detail),
            },
          },
        });

        if (!run?.id) {
          await db.update(directChatMessages).set({
            status: "failed",
            error: "CEO wakeup was skipped",
            updatedAt: new Date(),
          }).where(eq(directChatMessages.id, responseMessage.id));
        } else {
          await db.update(directChatMessages).set({
            runId: run.id,
            updatedAt: new Date(),
          }).where(eq(directChatMessages.id, responseMessage.id));
        }
      } catch (error) {
        await db.update(directChatMessages).set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          updatedAt: new Date(),
        }).where(eq(directChatMessages.id, responseMessage.id));
      }

      publishDirectChatMessageEvent(input.companyId, "direct_chat.message.updated", {
        threadId: thread.id,
        messageId: responseMessage.id,
        ceoAgentId: ceo.id,
      });
      return getDetailForThread(input.companyId, thread.id);
    },

    addAgentMessage: async (input: {
      companyId: string;
      agentId: string;
      body: string;
    }) => {
      const ceo = await resolveCeoAgent(input.companyId);
      if (ceo.id !== input.agentId) {
        throw forbidden("Only the company CEO can post to Direct Chat");
      }
      const thread = await getOrCreateThread(input.companyId, ceo.id);
      const now = new Date();
      const [message] = await db.insert(directChatMessages).values({
        companyId: input.companyId,
        threadId: thread.id,
        authorType: "agent",
        authorAgentId: ceo.id,
        body: input.body,
        status: "completed",
        createdAt: now,
        updatedAt: now,
      }).returning();
      await db.update(directChatThreads).set({ updatedAt: now }).where(eq(directChatThreads.id, thread.id));
      publishDirectChatMessageEvent(input.companyId, "direct_chat.message.created", {
        threadId: thread.id,
        messageId: message.id,
        ceoAgentId: ceo.id,
      });
      return getDetailForThread(input.companyId, thread.id);
    },

    completeAgentMessageFromRun: async (input: {
      companyId: string;
      threadId: string;
      messageId: string;
      runId: string;
      agentId: string;
      status: "succeeded" | "failed" | "cancelled" | "timed_out";
      body?: string | null;
      resultJson?: Record<string, unknown> | null;
      stdoutExcerpt?: string | null;
      error?: string | null;
    }) => {
      const body = readRunResponseBody(input);
      const updated = await db.update(directChatMessages).set({
        body,
        status: input.status === "succeeded" ? "completed" : "failed",
        error: input.status === "succeeded" ? null : input.error ?? input.status,
        runId: input.runId,
        updatedAt: new Date(),
      }).where(and(
        eq(directChatMessages.companyId, input.companyId),
        eq(directChatMessages.threadId, input.threadId),
        eq(directChatMessages.id, input.messageId),
        eq(directChatMessages.authorAgentId, input.agentId),
      )).returning().then((rows) => rows[0] ?? null);

      if (updated) {
        await db.update(directChatThreads).set({ updatedAt: new Date() }).where(eq(directChatThreads.id, input.threadId));
        publishDirectChatMessageEvent(input.companyId, "direct_chat.message.updated", {
          threadId: input.threadId,
          messageId: input.messageId,
          ceoAgentId: input.agentId,
        });
      }
    },

    hasActiveResponse: async (companyId: string) => {
      const ceo = await resolveCeoAgent(companyId);
      const thread = await getOrCreateThread(companyId, ceo.id);
      const rows = await db
        .select({ id: directChatMessages.id, status: directChatMessages.status, runStatus: heartbeatRuns.status })
        .from(directChatMessages)
        .leftJoin(heartbeatRuns, eq(directChatMessages.runId, heartbeatRuns.id))
        .where(and(
          eq(directChatMessages.companyId, companyId),
          eq(directChatMessages.threadId, thread.id),
          eq(directChatMessages.authorAgentId, ceo.id),
        ));

      return rows.some(({ status, runStatus }) =>
        ACTIVE_DIRECT_CHAT_MESSAGE_STATUSES.has(status) ||
        runStatus === "queued" ||
        runStatus === "running" ||
        runStatus === "scheduled_retry"
      );
    },
  };
}
