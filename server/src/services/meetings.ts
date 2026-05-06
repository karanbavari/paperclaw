import { promises as fs } from "node:fs";
import path from "node:path";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  heartbeatRuns,
  meetingMessages,
  meetingParticipants,
  meetings,
} from "@kesarcloud/db";
import {
  deriveAgentUrlKey,
  type Agent,
  type MeetingDetail,
  type MeetingMessage,
  type MeetingMessageStatus,
  type MeetingParticipant,
  type MeetingSummary,
} from "@kesarcloud/shared";
import { conflict, notFound, unprocessable } from "../errors.js";
import { resolvePaperClawInstanceRoot } from "../home-paths.js";

const RUNNING_MEETING_MESSAGE_STATUSES = new Set(["queued", "running"]);
const MAX_MEETING_DELEGATION_DEPTH = 3;

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

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
}): MeetingMessageStatus {
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
    firstText(input.stdoutExcerpt) ??
    firstText(input.error) ??
    ""
  );
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readMetadata(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stripDelegationBlock(body: string, block: string | null) {
  if (!block) return body.trim();
  return body.replace(block, "").trim();
}

function parseDelegation(body: string): {
  targetAgentId: string;
  reason: string | null;
  cleanedBody: string;
} | null {
  const blockRegex = /```paperclaw-delegate\s*([\s\S]*?)```/i;
  const match = blockRegex.exec(body);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]!.trim()) as Record<string, unknown>;
    const targetAgentId = readString(parsed.targetAgentId);
    if (!targetAgentId) return null;
    return {
      targetAgentId,
      reason: readString(parsed.reason),
      cleanedBody: stripDelegationBlock(body, match[0]),
    };
  } catch {
    return null;
  }
}

function formatIsoDate(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buildTranscript(detail: MeetingDetail, options: { maxChars?: number } = {}) {
  const lines: string[] = [];
  for (const message of detail.messages) {
    if (!message.body.trim()) continue;
    const label = message.authorType === "board"
      ? "Board"
      : message.authorType === "agent"
        ? message.authorAgent?.name ?? "Agent"
        : "System";
    lines.push(`### ${label} (${formatIsoDate(message.createdAt)})`);
    lines.push(message.body.trim());
    lines.push("");
  }
  const transcript = lines.join("\n").trim();
  const maxChars = options.maxChars ?? 20_000;
  return transcript.length > maxChars
    ? `... earlier meeting transcript truncated ...\n\n${transcript.slice(-maxChars)}`
    : transcript;
}

function renderMarkdown(detail: MeetingDetail) {
  const lines = [
    `# ${detail.title}`,
    "",
    `- Meeting ID: ${detail.id}`,
    `- Company ID: ${detail.companyId}`,
    `- Status: ${detail.status}`,
    `- Created: ${formatIsoDate(detail.createdAt)}`,
    `- Updated: ${formatIsoDate(detail.updatedAt)}`,
    "",
    "## Topic",
    "",
    detail.topic,
    "",
    "## Participants",
    "",
    ...detail.participants.map((participant) => {
      const agent = participant.agent;
      return `- ${agent?.name ?? participant.agentId}${agent?.title ? ` (${agent.title})` : ""}`;
    }),
    "",
    "## Transcript",
    "",
  ];

  for (const message of detail.messages) {
    const author = message.authorType === "board"
      ? "Board"
      : message.authorType === "agent"
        ? message.authorAgent?.name ?? "Agent"
        : "System";
    const status = message.status === "completed" ? "" : ` [${message.status}]`;
    lines.push(`### ${author}${status} - ${formatIsoDate(message.createdAt)}`);
    if (message.runId) lines.push(`Run: ${message.runId}`);
    if (message.error) lines.push(`Error: ${message.error}`);
    lines.push("", message.body.trim() || "_No response yet._", "");
  }

  return `${lines.join("\n").trim()}\n`;
}

function resolveMeetingMarkdownPath(companyId: string, meetingId: string) {
  const relativePath = path.join("meetings", safeSegment(companyId), `${safeSegment(meetingId)}.md`);
  const absolutePath = path.resolve(resolvePaperClawInstanceRoot(), "data", relativePath);
  return { relativePath: path.join("data", relativePath), absolutePath };
}

export type MeetingWakeup = (agentId: string, options: {
  source: "on_demand";
  triggerDetail: "manual";
  reason: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  requestedByActorType: "user" | "agent" | "system";
  requestedByActorId: string | null;
  contextSnapshot: Record<string, unknown>;
}) => Promise<{ id: string } | null | undefined>;

export function meetingService(db: Db) {
  async function mapSummary(row: typeof meetings.$inferSelect): Promise<MeetingSummary> {
    const [participantCountRow, latestMessageRow] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(meetingParticipants)
        .where(and(eq(meetingParticipants.meetingId, row.id), eq(meetingParticipants.status, "active")))
        .then((rows) => rows[0] ?? { count: 0 }),
      db
        .select({ createdAt: meetingMessages.createdAt })
        .from(meetingMessages)
        .where(eq(meetingMessages.meetingId, row.id))
        .orderBy(desc(meetingMessages.createdAt))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);
    return {
      id: row.id,
      companyId: row.companyId,
      title: row.title,
      topic: row.topic,
      status: row.status as MeetingSummary["status"],
      markdownPath: row.markdownPath,
      participantCount: Number(participantCountRow.count ?? 0),
      latestMessageAt: latestMessageRow?.createdAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async function getDetail(companyId: string, meetingId: string): Promise<MeetingDetail> {
    const meeting = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.companyId, companyId), eq(meetings.id, meetingId)))
      .then((rows) => rows[0] ?? null);
    if (!meeting) throw notFound("Meeting not found");

    const participantRows = await db
      .select({ participant: meetingParticipants, agent: agents })
      .from(meetingParticipants)
      .leftJoin(agents, eq(meetingParticipants.agentId, agents.id))
      .where(eq(meetingParticipants.meetingId, meetingId))
      .orderBy(asc(meetingParticipants.position), asc(meetingParticipants.createdAt));

    const messageRows = await db
      .select({ message: meetingMessages, agent: agents, runStatus: heartbeatRuns.status })
      .from(meetingMessages)
      .leftJoin(agents, eq(meetingMessages.authorAgentId, agents.id))
      .leftJoin(heartbeatRuns, eq(meetingMessages.runId, heartbeatRuns.id))
      .where(eq(meetingMessages.meetingId, meetingId))
      .orderBy(asc(meetingMessages.createdAt));

    const summary = await mapSummary(meeting);
    return {
      ...summary,
      participants: participantRows.map(({ participant, agent }): MeetingParticipant => ({
        id: participant.id,
        companyId: participant.companyId,
        meetingId: participant.meetingId,
        agentId: participant.agentId,
        position: participant.position,
        status: participant.status as MeetingParticipant["status"],
        agent: toAgent(agent),
        createdAt: participant.createdAt,
      })),
      messages: messageRows.map(({ message, agent, runStatus }): MeetingMessage => ({
        id: message.id,
        companyId: message.companyId,
        meetingId: message.meetingId,
        roundNumber: message.roundNumber,
        authorType: message.authorType as MeetingMessage["authorType"],
        authorUserId: message.authorUserId,
        authorAgentId: message.authorAgentId,
        authorAgent: toAgent(agent),
        body: message.body,
        status: effectiveMessageStatus({ messageStatus: message.status, runStatus }),
        error: message.error,
        runId: message.runId,
        metadata: message.metadata,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      })),
    };
  }

  async function syncMarkdown(companyId: string, meetingId: string) {
    const detail = await getDetail(companyId, meetingId);
    const { absolutePath } = resolveMeetingMarkdownPath(companyId, meetingId);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, renderMarkdown(detail), "utf8");
  }

  async function requireUsableAgents(companyId: string, agentIds: string[]) {
    const uniqueIds = Array.from(new Set(agentIds));
    if (uniqueIds.length === 0) throw unprocessable("Select at least one agent");
    const rows = await db.select().from(agents).where(and(eq(agents.companyId, companyId), inArray(agents.id, uniqueIds)));
    const found = new Set(rows.map((row) => row.id));
    const missing = uniqueIds.filter((id) => !found.has(id));
    if (missing.length > 0) throw unprocessable("Some selected agents do not belong to this company", { agentIds: missing });
    const unavailable = rows.filter((row) =>
      row.status === "paused" || row.status === "terminated" || row.status === "pending_approval"
    );
    if (unavailable.length > 0) {
      throw conflict("Some selected agents are not available for meetings", {
        agents: unavailable.map((agent) => ({ id: agent.id, name: agent.name, status: agent.status })),
      });
    }
    return uniqueIds;
  }

  async function requireInvokableAgent(companyId: string, agentId: string) {
    const row = await db
      .select()
      .from(agents)
      .where(and(eq(agents.companyId, companyId), eq(agents.id, agentId)))
      .then((rows) => rows[0] ?? null);
    if (!row) throw unprocessable("Selected agent does not belong to this company", { agentId });
    if (row.status === "paused" || row.status === "terminated" || row.status === "pending_approval") {
      throw conflict("Selected agent is not available for meetings", {
        agent: { id: row.id, name: row.name, status: row.status },
      });
    }
    return row;
  }

  async function listCompanyAgentRoster(companyId: string) {
    return db
      .select()
      .from(agents)
      .where(eq(agents.companyId, companyId))
      .orderBy(asc(agents.name));
  }

  async function ensureParticipant(companyId: string, meetingId: string, agentId: string) {
    const existing = await db
      .select({ id: meetingParticipants.id })
      .from(meetingParticipants)
      .where(and(eq(meetingParticipants.meetingId, meetingId), eq(meetingParticipants.agentId, agentId)))
      .then((rows) => rows[0] ?? null);
    if (existing) return;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(meetingParticipants)
      .where(eq(meetingParticipants.meetingId, meetingId));

    await db.insert(meetingParticipants).values({
      companyId,
      meetingId,
      agentId,
      position: Number(count ?? 0),
      status: "active",
    }).onConflictDoNothing();
  }

  async function hasActiveResponse(meetingId: string, agentId: string) {
    const rows = await db
      .select({ id: meetingMessages.id, runStatus: heartbeatRuns.status, messageStatus: meetingMessages.status })
      .from(meetingMessages)
      .leftJoin(heartbeatRuns, eq(meetingMessages.runId, heartbeatRuns.id))
      .where(and(eq(meetingMessages.meetingId, meetingId), eq(meetingMessages.authorAgentId, agentId)));

    return rows.some(({ messageStatus, runStatus }) => {
      if (RUNNING_MEETING_MESSAGE_STATUSES.has(messageStatus)) return true;
      return runStatus === "queued" || runStatus === "running" || runStatus === "scheduled_retry";
    });
  }

  function buildRosterPayload(roster: Array<typeof agents.$inferSelect>, currentAgentId: string) {
    return roster.map((agent) => ({
      id: agent.id,
      name: agent.name,
      title: agent.title,
      role: agent.role,
      status: agent.status,
      reportsTo: agent.reportsTo,
      isDirectReport: agent.reportsTo === currentAgentId,
    }));
  }

  return {
    list: async (companyId: string) => {
      const rows = await db
        .select()
        .from(meetings)
        .where(eq(meetings.companyId, companyId))
        .orderBy(desc(meetings.updatedAt));
      return Promise.all(rows.map(mapSummary));
    },

    get: getDetail,

    create: async (input: {
      companyId: string;
      title: string;
      topic: string;
      agentIds: string[];
      actor: { type: "user" | "agent" | "system"; id: string | null; agentId?: string | null };
    }) => {
      const agentIds = await requireUsableAgents(input.companyId, input.agentIds);
      const now = new Date();
      const [meeting] = await db.insert(meetings).values({
        companyId: input.companyId,
        title: input.title,
        topic: input.topic,
        markdownPath: "pending",
        createdByUserId: input.actor.type === "user" ? input.actor.id : null,
        createdByAgentId: input.actor.agentId ?? null,
        createdAt: now,
        updatedAt: now,
      }).returning();
      const { relativePath } = resolveMeetingMarkdownPath(input.companyId, meeting.id);
      await db.update(meetings).set({ markdownPath: relativePath }).where(eq(meetings.id, meeting.id));
      await db.insert(meetingParticipants).values(agentIds.map((agentId, index) => ({
        companyId: input.companyId,
        meetingId: meeting.id,
        agentId,
        position: index,
        status: "active",
      })));
      await db.insert(meetingMessages).values({
        companyId: input.companyId,
        meetingId: meeting.id,
        roundNumber: 0,
        authorType: "board",
        authorUserId: input.actor.type === "user" ? input.actor.id : null,
        body: input.topic,
        status: "completed",
        createdAt: now,
        updatedAt: now,
      });
      await syncMarkdown(input.companyId, meeting.id);
      return getDetail(input.companyId, meeting.id);
    },

    addBoardMessage: async (input: {
      companyId: string;
      meetingId: string;
      body: string;
      targetAgentId?: string | null;
      actor: { type: "user" | "agent" | "system"; id: string | null };
      wakeup: MeetingWakeup;
    }) => {
      const targetAgent = input.targetAgentId
        ? await requireInvokableAgent(input.companyId, input.targetAgentId)
        : null;
      if (targetAgent && await hasActiveResponse(input.meetingId, targetAgent.id)) {
        throw conflict("This agent already has a pending meeting question", {
          agent: { id: targetAgent.id, name: targetAgent.name },
        });
      }

      await getDetail(input.companyId, input.meetingId);
      const [message] = await db.insert(meetingMessages).values({
        companyId: input.companyId,
        meetingId: input.meetingId,
        roundNumber: 0,
        authorType: "board",
        authorUserId: input.actor.type === "user" ? input.actor.id : null,
        body: input.body,
        status: "completed",
        metadata: targetAgent ? { targetAgentId: targetAgent.id } : null,
      }).returning();

      if (targetAgent) {
        await ensureParticipant(input.companyId, input.meetingId, targetAgent.id);
        const detail = await getDetail(input.companyId, input.meetingId);
        const roster = await listCompanyAgentRoster(input.companyId);
        const transcript = buildTranscript(detail);
        const [responseMessage] = await db.insert(meetingMessages).values({
          companyId: input.companyId,
          meetingId: input.meetingId,
          roundNumber: 0,
          authorType: "agent",
          authorAgentId: targetAgent.id,
          body: "",
          status: "queued",
          metadata: {
            targetQuestion: input.body,
            targetQuestionMessageId: message.id,
            delegationDepth: 0,
          },
        }).returning();

        try {
          const run = await input.wakeup(targetAgent.id, {
            source: "on_demand",
            triggerDetail: "manual",
            reason: "meeting_question",
            payload: { meetingId: input.meetingId, meetingMessageId: responseMessage.id },
            idempotencyKey: `meeting:${input.meetingId}:message:${responseMessage.id}:agent:${targetAgent.id}`,
            requestedByActorType: input.actor.type,
            requestedByActorId: input.actor.id,
            contextSnapshot: {
              wakeReason: "meeting_question",
              taskKey: `meeting:${input.meetingId}:agent:${targetAgent.id}`,
              meetingId: input.meetingId,
              meetingMessageId: responseMessage.id,
              meetingDelegationDepth: 0,
              paperclawMeeting: {
                id: input.meetingId,
                title: detail.title,
                topic: detail.topic,
                currentAgentId: targetAgent.id,
                currentAgentName: targetAgent.name,
                targetQuestion: input.body,
                requestedBy: "Board",
                agentRoster: buildRosterPayload(roster, targetAgent.id),
                transcript,
              },
            },
          });
          await db.update(meetingMessages).set({ runId: run?.id ?? null, updatedAt: new Date() }).where(eq(meetingMessages.id, responseMessage.id));
        } catch (error) {
          await db.update(meetingMessages).set({
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            updatedAt: new Date(),
          }).where(eq(meetingMessages.id, responseMessage.id));
        }
      }

      await db.update(meetings).set({ updatedAt: new Date() }).where(eq(meetings.id, input.meetingId));
      await syncMarkdown(input.companyId, input.meetingId);
      return getDetail(input.companyId, input.meetingId);
    },

    completeAgentMessageFromRun: async (input: {
      companyId: string;
      meetingId: string;
      messageId: string;
      runId: string;
      agentId: string;
      status: "succeeded" | "failed" | "cancelled" | "timed_out";
      delegationDepth?: number | null;
      body?: string | null;
      resultJson?: Record<string, unknown> | null;
      stdoutExcerpt?: string | null;
      error?: string | null;
      wakeup?: MeetingWakeup;
    }) => {
      const rawBody = readRunResponseBody(input);
      const delegation = input.status === "succeeded" ? parseDelegation(rawBody) : null;
      const body = delegation?.cleanedBody || rawBody;
      const currentMessage = await db
        .select()
        .from(meetingMessages)
        .where(and(
          eq(meetingMessages.companyId, input.companyId),
          eq(meetingMessages.meetingId, input.meetingId),
          eq(meetingMessages.id, input.messageId),
          eq(meetingMessages.authorAgentId, input.agentId),
        ))
        .then((rows) => rows[0] ?? null);
      const currentMetadata = readMetadata(currentMessage?.metadata);
      await db.update(meetingMessages).set({
        body,
        status: input.status === "succeeded" ? "completed" : "failed",
        error: input.status === "succeeded" ? null : input.error ?? input.status,
        runId: input.runId,
        metadata: delegation
          ? { ...currentMetadata, delegatedToAgentId: delegation.targetAgentId, delegationReason: delegation.reason }
          : currentMessage?.metadata ?? null,
        updatedAt: new Date(),
      }).where(and(
        eq(meetingMessages.companyId, input.companyId),
        eq(meetingMessages.meetingId, input.meetingId),
        eq(meetingMessages.id, input.messageId),
        eq(meetingMessages.authorAgentId, input.agentId),
      ));

      if (delegation && input.wakeup) {
        const sourceAgent = await db
          .select()
          .from(agents)
          .where(and(eq(agents.companyId, input.companyId), eq(agents.id, input.agentId)))
          .then((rows) => rows[0] ?? null);
        const sourceAgentId = sourceAgent?.id ?? input.agentId;
        const sourceAgentName = sourceAgent?.name ?? "Agent";
        const depth = input.delegationDepth ?? readNumber(currentMetadata.delegationDepth) ?? 0;
        const targetQuestion = readString(currentMetadata.targetQuestion) ?? body;
        const targetQuestionMessageId = readString(currentMetadata.targetQuestionMessageId);
        if (depth >= MAX_MEETING_DELEGATION_DEPTH) {
          await db.insert(meetingMessages).values({
            companyId: input.companyId,
            meetingId: input.meetingId,
            roundNumber: 0,
            authorType: "system",
            body: `${sourceAgentName} suggested another handoff, but the meeting delegation limit was reached.`,
            status: "completed",
          });
        } else {
          try {
            const targetAgent = await requireInvokableAgent(input.companyId, delegation.targetAgentId);
            if (await hasActiveResponse(input.meetingId, targetAgent.id)) {
              await db.insert(meetingMessages).values({
                companyId: input.companyId,
                meetingId: input.meetingId,
                roundNumber: 0,
                authorType: "system",
                body: `${sourceAgentName} suggested ${targetAgent.name}, but that agent already has a pending meeting question.`,
                status: "completed",
              });
            } else {
              await ensureParticipant(input.companyId, input.meetingId, targetAgent.id);
              const detail = await getDetail(input.companyId, input.meetingId);
              const roster = await listCompanyAgentRoster(input.companyId);
              const handoffText = `${sourceAgentName} delegated this question to ${targetAgent.name}${delegation.reason ? `: ${delegation.reason}` : "."}`;
              await db.insert(meetingMessages).values({
                companyId: input.companyId,
                meetingId: input.meetingId,
                roundNumber: 0,
                authorType: "system",
                body: handoffText,
                status: "completed",
                metadata: {
                  delegatedFromAgentId: sourceAgentId,
                  delegatedToAgentId: targetAgent.id,
                  delegationReason: delegation.reason,
                },
              });
              const [delegatedMessage] = await db.insert(meetingMessages).values({
                companyId: input.companyId,
                meetingId: input.meetingId,
                roundNumber: 0,
                authorType: "agent",
                authorAgentId: targetAgent.id,
                body: "",
                status: "queued",
                metadata: {
                  targetQuestion,
                  targetQuestionMessageId,
                  delegatedFromAgentId: sourceAgentId,
                  delegationReason: delegation.reason,
                  delegationDepth: depth + 1,
                },
              }).returning();
              const run = await input.wakeup(targetAgent.id, {
                source: "on_demand",
                triggerDetail: "manual",
                reason: "meeting_delegation",
                payload: { meetingId: input.meetingId, meetingMessageId: delegatedMessage.id },
                idempotencyKey: `meeting:${input.meetingId}:message:${delegatedMessage.id}:agent:${targetAgent.id}`,
                requestedByActorType: "agent",
                requestedByActorId: sourceAgentId,
                contextSnapshot: {
                  wakeReason: "meeting_delegation",
                  taskKey: `meeting:${input.meetingId}:agent:${targetAgent.id}`,
                  meetingId: input.meetingId,
                  meetingMessageId: delegatedMessage.id,
                  meetingDelegationDepth: depth + 1,
                  paperclawMeeting: {
                    id: input.meetingId,
                    title: detail.title,
                    topic: detail.topic,
                    currentAgentId: targetAgent.id,
                    currentAgentName: targetAgent.name,
                    targetQuestion,
                    requestedBy: sourceAgentName,
                    delegationReason: delegation.reason,
                    agentRoster: buildRosterPayload(roster, targetAgent.id),
                    transcript: buildTranscript(detail),
                  },
                },
              });
              await db.update(meetingMessages).set({
                runId: run?.id ?? null,
                updatedAt: new Date(),
              }).where(eq(meetingMessages.id, delegatedMessage.id));
            }
          } catch (error) {
            await db.insert(meetingMessages).values({
              companyId: input.companyId,
              meetingId: input.meetingId,
              roundNumber: 0,
              authorType: "system",
              body: `${sourceAgentName} suggested another agent, but the handoff could not be started: ${error instanceof Error ? error.message : String(error)}`,
              status: "completed",
            });
          }
        }
      }
      await db.update(meetings).set({ updatedAt: new Date() }).where(eq(meetings.id, input.meetingId));
      await syncMarkdown(input.companyId, input.meetingId);
    },
  };
}
