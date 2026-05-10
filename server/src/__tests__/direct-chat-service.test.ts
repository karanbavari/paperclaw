import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  agents,
  approvals,
  companies,
  createDb,
  directChatMessages,
  directChatThreads,
  goals,
  heartbeatRuns,
  issues,
  meetings,
  projects,
  researchLabs,
} from "@kesarcloud/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { directChatService } from "../services/direct-chat.js";
import { approvalService } from "../services/approvals.js";
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
    await db.delete(researchLabs);
    await db.delete(approvals);
    await db.delete(meetings);
    await db.delete(issues);
    await db.delete(projects);
    await db.delete(goals);
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

  async function createDirectChatActionApproval(
    companyId: string,
    ceoId: string,
    payload: Record<string, unknown>,
  ) {
    const thread = await svc.get(companyId);
    const [approval] = await db.insert(approvals).values({
      companyId,
      type: "direct_chat_action",
      requestedByAgentId: ceoId,
      status: "pending",
      payload: {
        title: "Direct Chat next step",
        summary: "CEO wants Board approval for a follow-up action from Direct Chat.",
        recommendedAction: "Approve the proposed action.",
        nextActionOnApproval: "Create the requested work item and notify Direct Chat.",
        source: { directChatThreadId: thread.id },
        ...payload,
      },
    }).returning();
    return approval;
  }

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
            company: expect.objectContaining({
              name: "Direct Chat Co",
            }),
            companySnapshot: expect.objectContaining({
              counts: expect.objectContaining({
                activeProjects: 1,
                openIssues: 1,
                openMeetings: 1,
              }),
              activeProjects: expect.arrayContaining([
                expect.objectContaining({ name: "Direct Chat rollout" }),
              ]),
              recentOpenIssues: expect.arrayContaining([
                expect.objectContaining({ identifier: "DCT-1", title: "Make CEO replies useful" }),
              ]),
              recentMeetings: expect.arrayContaining([
                expect.objectContaining({ title: "Roadmap review" }),
              ]),
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
    const detail = await svc.addBoardMessage({
      companyId,
      body: "Summarize the plan.",
      actor: { type: "user", id: "local-board" },
      wakeup: vi.fn(async () => {
        const [run] = await db.insert(heartbeatRuns).values({
          companyId,
          agentId: ceoId,
          invocationSource: "on_demand",
          status: "queued",
        }).returning();
        return { id: run.id };
      }),
    });
    const response = detail.messages[1]!;

    await svc.completeAgentMessageFromRun({
      companyId,
      threadId: detail.id,
      messageId: response.id,
      runId: response.runId!,
      agentId: ceoId,
      status: "succeeded",
      resultJson: { summary: "We should ship Direct Chat." },
    });

    const updated = await svc.get(companyId);
    expect(updated.messages[1]?.status).toBe("completed");
    expect(updated.messages[1]?.body).toBe("We should ship Direct Chat.");
  });

  it.each([
    {
      kind: "create_goal",
      entityType: "goal",
      input: { title: "Clarify Q3 expansion", level: "company" },
      table: goals,
    },
    {
      kind: "create_issue",
      entityType: "issue",
      input: { title: "Draft expansion risks", description: "Summarize the Board chat follow-up.", priority: "high" },
      table: issues,
    },
    {
      kind: "create_research_lab",
      entityType: "research_lab",
      input: { title: "Market scan lab", objective: "Research the Board's proposed expansion path." },
      table: researchLabs,
    },
    {
      kind: "create_meeting",
      entityType: "meeting",
      input: null,
      table: meetings,
    },
  ])("applies approved Direct Chat $kind requests and posts chat status", async ({ kind, entityType, input, table }) => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const actionInput = kind === "create_meeting"
      ? { title: "Expansion alignment", topic: "Align on Board chat follow-up.", agentIds: [ceoId] }
      : input;
    const approval = await createDirectChatActionApproval(companyId, ceoId, {
      title: `Approve ${entityType}`,
      action: { kind, input: actionInput },
    });

    const result = await approvalService(db).approve(approval.id, "board");
    const appliedAction = result.approval.payload.appliedAction as Record<string, unknown> | undefined;

    expect(result.applied).toBe(true);
    expect(appliedAction).toMatchObject({ entityType });
    expect(typeof appliedAction?.entityId).toBe("string");

    const rows = await db.select().from(table).where(eq(table.id, String(appliedAction?.entityId)));
    expect(rows).toHaveLength(1);

    const chat = await svc.get(companyId);
    const statusMessage = chat.messages.find((message) =>
      message.authorType === "system" &&
      message.metadata?.kind === "direct_chat_action_approval" &&
      message.metadata.approvalStatus === "approved"
    );
    expect(statusMessage?.metadata).toMatchObject({
      approvalId: approval.id,
      actionKind: kind,
      createdEntity: expect.objectContaining({ entityType }),
    });
  });

  it("posts a rejected Direct Chat action status without creating the action", async () => {
    const companyId = await createCompany();
    const ceoId = await createAgent(companyId);
    const approval = await createDirectChatActionApproval(companyId, ceoId, {
      title: "Approve rejected goal",
      action: {
        kind: "create_goal",
        input: { title: "Do not create this", level: "company" },
      },
    });

    const result = await approvalService(db).reject(approval.id, "board", "Not now.");

    expect(result.applied).toBe(true);
    expect(await db.select().from(goals).where(eq(goals.title, "Do not create this"))).toHaveLength(0);
    const chat = await svc.get(companyId);
    expect(chat.messages.some((message) =>
      message.authorType === "system" &&
      message.metadata?.kind === "direct_chat_action_approval" &&
      message.metadata.approvalStatus === "rejected"
    )).toBe(true);
  });

  it("returns 422 when no CEO agent exists", async () => {
    const companyId = await createCompany();

    await expect(svc.get(companyId)).rejects.toMatchObject({ status: 422 } satisfies Partial<HttpError>);
  });
});
