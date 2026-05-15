import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { agents, companies, companyMemoryItems, companyProfiles, createDb } from "@kesarcloud/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { companyMemoryService, defaultStatusFor } from "../services/company-memory.js";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres company memory service tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

const baseMemory = {
  memoryType: "long_term" as const,
  kind: "note" as const,
  scopeType: "agent" as const,
  scopeId: "agent-1",
  title: "Remember review habit",
  body: "Run targeted verification before marking UI work done.",
  summary: null,
  tags: [],
  sourceType: "agent_proposal" as const,
  sourceId: null,
  confidence: 80,
  importance: 60,
  expiresAt: null,
  metadata: null,
};

describe("defaultStatusFor", () => {
  it("auto-activates routine agent/project/issue scoped memories from agents", () => {
    expect(defaultStatusFor(baseMemory, false)).toBe("active");
    expect(defaultStatusFor({ ...baseMemory, scopeType: "project", kind: "procedure" }, false)).toBe("active");
    expect(defaultStatusFor({ ...baseMemory, scopeType: "issue", kind: "fact" }, false)).toBe("active");
  });

  it("keeps high-impact company memory proposed unless the actor can approve", () => {
    expect(defaultStatusFor({ ...baseMemory, scopeType: "company", kind: "policy" }, false)).toBe("proposed");
    expect(defaultStatusFor({ ...baseMemory, scopeType: "company", kind: "policy" }, true)).toBe("approved");
  });
});

describeEmbeddedPostgres("companyMemoryService", () => {
  let db!: ReturnType<typeof createDb>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-company-memory-service-");
    db = createDb(tempDb.connectionString);
  }, 20_000);

  afterEach(async () => {
    await db.delete(companyMemoryItems);
    await db.delete(companyProfiles);
    await db.delete(agents);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  it("lets agents save scoped memory and recall relevant context", async () => {
    const companyId = randomUUID();
    const agentId = randomUUID();
    await db.insert(companies).values({
      id: companyId,
      name: "KesarCloud",
      issuePrefix: `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    await db.insert(agents).values({
      id: agentId,
      companyId,
      name: "Developer-1",
      role: "engineer",
      status: "idle",
      adapterType: "codex_local",
      adapterConfig: {},
      runtimeConfig: {},
      permissions: {},
    });

    const memory = companyMemoryService(db);
    await memory.upsertProfile(companyId, {
      businessCategory: "SaaS",
      businessSubcategory: "AI operations",
      businessSummary: "Builds agent-company control-plane tooling.",
      targetCustomers: null,
      brandVoice: null,
      operatingNotes: null,
      registeredSince: null,
      defaultLanguage: null,
      defaultCurrency: null,
      website: null,
      contactEmail: null,
      contactPhone: null,
      contactAddress: null,
      timezone: null,
    });
    const saved = await memory.createMemory(companyId, {
      ...baseMemory,
      scopeId: agentId,
      title: "Verification habit",
      body: "Always run targeted verification before marking implementation work done.",
      tags: ["testing"],
    }, { agentId, canApprove: false });
    await memory.createMemory(companyId, {
      ...baseMemory,
      scopeType: "company",
      scopeId: null,
      kind: "policy",
      title: "Unapproved pricing policy",
      body: "This company-wide policy still needs Board approval.",
      tags: ["policy"],
    }, { agentId, canApprove: false });

    expect(saved.status).toBe("active");
    const recalled = await memory.recall(companyId, {
      query: "verification",
      agentId,
      agentRole: "engineer",
      issueId: null,
      projectId: null,
      limit: 10,
    });
    const titles = recalled.items.map((item) => item.title);
    expect(recalled.profile?.businessCategory).toBe("SaaS");
    expect(titles).toContain("Verification habit");
    expect(titles).not.toContain("Unapproved pricing policy");

    const markdown = await memory.buildAgentMemoryMarkdown(companyId, agentId);
    expect(markdown).toContain("Business category: SaaS");
    expect(markdown).toContain("Verification habit");
    expect(markdown).not.toContain("Unapproved pricing policy");
  });
});
