import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  agents,
  companies,
  createDb,
  directChatMessages,
  directChatThreads,
  heartbeatRuns,
  issues,
  meetings,
  projects,
} from "@kesarcloud/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { directChatService } from "../services/direct-chat.js";
import { HttpError } from "../errors.js";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres direct chat tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres("directChatService", () => {
  let db!: ReturnType<typeof createDb>;
  let svc!: ReturnType<typeof directChatService>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-direct-chat-");
    db = createDb(tempDb.connectionString);
    svc = directChatService(db);
  }, 20_000);

  afterEach(async () => {
    await db.delete(directChatMessages);
    await db.delete(directChatThreads);
    await db.delete(heartbeatRuns);
    await db.delete(meetings);
    await db.delete(issues);
    await db.delete(projects);
    await db.delete(agents);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  async function createCompany() {
    const companyId = randomUUID();
    await db.insert(companies).values({
      id: companyId,
      name: "Direct Chat Co",
      issuePrefix: `D${companyId.replace(/-/g, "").slice(0, 5).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    return companyId;
  }

  async function createAgent(companyId: string, values: Partial<typeof agents.$inferInsert> = {}) {
    const id = values.id ?? randomUUID();
    await db.insert(agents).values({
      id,
      companyId,
      name: values.name ?? "CEO",
      role: values.role ?? "ceo",
      status: values.status ?? "active",
      reportsTo: values.reportsTo ?? null,
      createdAt: values.createdAt ?? new Date(),
      ...values,
    });
    return id;
  }

  const noisyRunTranscript = [
    "21312}}",
    JSON.stringify({
      type: "step_start",
      timestamp: 1778778060297,
      sessionID: "ses_direct_chat",
      part: { type: "step-start" },
    }),
    JSON.stringify({
      type: "tool_use",
      timestamp: 1778778065880,
      sessionID: "ses_direct_chat",
      part: {
        type: "tool",
        tool: "bash",
        callID: "call_direct_chat",
        state: {
          status: "completed",
          input: { command: "curl -sS http://127.0.0.1:3100/api/companies/test/agent-hires" },
          output: "created\n",
        },
      },
    }),
    JSON.stringify({
      type: "step_finish",
      timestamp: 1778778079227,
      sessionID: "ses_direct_chat",
      part: { type: "step-finish", tokens: { total: 100 } },
    }),
  ].join("\n");

  it("resolves the root CEO before other CEO-role agents", async () => {
    const companyId = await createCompany();
    const parentId = await createAgent(companyId, {
      name: "Board Delegate",
      role: "general",
      reportsTo: null,
    });
    const managerId = await createAgent(companyId, {
      name: "Department CEO",
      reportsTo: parentId,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const rootCeoId = await createAgent(companyId, {
      name: "Root CEO",
      reportsTo: null,
      createdAt: new Date("2026-02-01T00:00:00.000Z"),
    });

    const detail = await svc.get(companyId);

    expect(detail.ceoAgentId).toBe(rootCeoId);
    expect(detail.ceoAgentId).not.toBe(managerId);
    expect(detail.kind).toBe("board_ceo");
  });

  it("creates a board message, queued CEO placeholder, and wakeup context", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const [project] = await db.insert(projects).values({
      companyId,
      name: "Direct Chat rollout",
      status: "in_progress",
      description: "Ship CEO to Board chat with strong context.",
    }).returning();
    await db.insert(issues).values({
      companyId,
      projectId: project.id,
      title: "Make CEO replies useful",
      identifier: "DCT-1",
      status: "todo",
      priority: "high",
      assigneeAgentId: ceoId,
    });
    await db.insert(meetings).values({
      companyId,
      title: "Roadmap review",
      topic: "Review Direct Chat quality and rollout risks.",
      status: "open",
      markdownPath: "data/meetings/test.md",
    });
    const wakeup = vi.fn(async () => {
      const [run] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: ceoId,
        invocationSource: "on_demand",
        status: "queued",
      }).returning();
      return { id: run.id };
    });

    const detail = await svc.addBoardMessage({
      companyId,
      body: "What should we do today?",
      actor: { type: "user", id: "local-board" },
      wakeup,
    });

    expect(detail.messages).toHaveLength(2);
    expect(detail.messages[0]?.authorType).toBe("board");
    expect(detail.messages[1]?.authorType).toBe("agent");
    expect(detail.messages[1]?.status).toBe("queued");
    expect(detail.messages[1]?.runId).toBeTruthy();
    expect(wakeup).toHaveBeenCalledWith(
      ceoId,
      expect.objectContaining({
        reason: "direct_chat_message",
        contextSnapshot: expect.objectContaining({
          directChatThreadId: detail.id,
          directChatMessageId: detail.messages[1]?.id,
          paperclawDirectChat: expect.objectContaining({
            targetQuestion: "What should we do today?",
            company: expect.objectContaining({ name: "Direct Chat Co" }),
            companySnapshot: expect.objectContaining({
              counts: expect.objectContaining({
                activeProjects: 1,
                openIssues: 1,
                openMeetings: 1,
              }),
            }),
          }),
        }),
      }),
    );
  });

  it("allows only the resolved CEO agent to post proactive messages", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const engineerId = await createAgent(companyId, { name: "Engineer", role: "engineer" });

    const detail = await svc.addAgentMessage({
      companyId,
      agentId: ceoId,
      body: "Board, I have an update.",
    });
    expect(detail.messages[0]?.authorAgentId).toBe(ceoId);

    await expect(svc.addAgentMessage({
      companyId,
      agentId: engineerId,
      body: "I should not be here.",
    })).rejects.toMatchObject({ status: 403 } satisfies Partial<HttpError>);
  });

  it("updates queued CEO responses from heartbeat completion", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const wakeup = vi.fn(async () => {
      const [run] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: ceoId,
        invocationSource: "on_demand",
        status: "queued",
      }).returning();
      return { id: run.id };
    });

    const detail = await svc.addBoardMessage({
      companyId,
      body: "Give me a status update.",
      actor: { type: "user", id: "local-board" },
      wakeup,
    });
    const response = detail.messages[1]!;

    await svc.completeAgentMessageFromRun({
      companyId,
      threadId: detail.id,
      messageId: response.id,
      runId: response.runId!,
      agentId: ceoId,
      status: "succeeded",
      body: "We are on track.",
      stdoutExcerpt: noisyRunTranscript,
    });

    const updated = await svc.get(companyId);
    expect(updated.messages[1]?.status).toBe("completed");
    expect(updated.messages[1]?.body).toBe("We are on track.");
  });

  it("does not expose raw run transcript output as a Direct Chat reply", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const wakeup = vi.fn(async () => {
      const [run] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: ceoId,
        invocationSource: "on_demand",
        status: "queued",
      }).returning();
      return { id: run.id };
    });

    const detail = await svc.addBoardMessage({
      companyId,
      body: "Hire the team.",
      actor: { type: "user", id: "local-board" },
      wakeup,
    });
    const response = detail.messages[1]!;

    await svc.completeAgentMessageFromRun({
      companyId,
      threadId: detail.id,
      messageId: response.id,
      runId: response.runId!,
      agentId: ceoId,
      status: "succeeded",
      stdoutExcerpt: noisyRunTranscript,
    });

    const updated = await svc.get(companyId);
    expect(updated.messages[1]?.status).toBe("completed");
    expect(updated.messages[1]?.body).toBe("");
    expect(updated.messages[1]?.body).not.toContain("tool_use");
    expect(updated.messages[1]?.body).not.toContain("sessionID");
    expect(updated.messages[1]?.body).not.toContain("curl -sS");
  });

  it("extracts text events from structured stdout when no adapter summary is available", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const wakeup = vi.fn(async () => {
      const [run] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: ceoId,
        invocationSource: "on_demand",
        status: "queued",
      }).returning();
      return { id: run.id };
    });

    const detail = await svc.addBoardMessage({
      companyId,
      body: "What changed?",
      actor: { type: "user", id: "local-board" },
      wakeup,
    });
    const response = detail.messages[1]!;

    await svc.completeAgentMessageFromRun({
      companyId,
      threadId: detail.id,
      messageId: response.id,
      runId: response.runId!,
      agentId: ceoId,
      status: "succeeded",
      stdoutExcerpt: [
        JSON.stringify({ type: "step_start", sessionID: "ses_direct_chat", part: { type: "step-start" } }),
        JSON.stringify({ type: "text", sessionID: "ses_direct_chat", part: { text: "The hiring issue is done." } }),
        JSON.stringify({ type: "tool_use", sessionID: "ses_direct_chat", part: { tool: "bash" } }),
      ].join("\n"),
    });

    const updated = await svc.get(companyId);
    expect(updated.messages[1]?.body).toBe("The hiring issue is done.");
  });

  it("hides previously stored raw agent transcript output and keeps it out of future prompts", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);

    const initial = await svc.addAgentMessage({
      companyId,
      agentId: ceoId,
      body: noisyRunTranscript,
    });
    expect(initial.messages[0]?.body).toBe("");

    const wakeup = vi.fn(async () => {
      const [run] = await db.insert(heartbeatRuns).values({
        companyId,
        agentId: ceoId,
        invocationSource: "on_demand",
        status: "queued",
      }).returning();
      return { id: run.id };
    });

    await svc.addBoardMessage({
      companyId,
      body: "Continue.",
      actor: { type: "user", id: "local-board" },
      wakeup,
    });

    const directChatContext = wakeup.mock.calls[0]?.[1].contextSnapshot.paperclawDirectChat as
      | { transcript?: string }
      | undefined;
    expect(directChatContext?.transcript).not.toContain("tool_use");
    expect(directChatContext?.transcript).not.toContain("sessionID");
    expect(directChatContext?.transcript).not.toContain("curl -sS");
  });
});
