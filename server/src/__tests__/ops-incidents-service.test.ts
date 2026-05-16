import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { agents, companies, createDb, heartbeatRuns, issues } from "@kesarcloud/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { opsIncidentService } from "../services/ops-incidents.ts";
import { RECOVERY_ORIGIN_KINDS } from "../services/recovery/origins.ts";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres ops incident service tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres("opsIncidentService", () => {
  let db!: ReturnType<typeof createDb>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-ops-incident-service-");
    db = createDb(tempDb.connectionString);
  }, 20_000);

  afterEach(async () => {
    await db.delete(issues);
    await db.delete(heartbeatRuns);
    await db.delete(agents);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  it("aggregates failed runs, recovery issues, and agent errors", async () => {
    const companyId = randomUUID();
    const otherCompanyId = randomUUID();
    const ceoId = randomUUID();
    const issueId = randomUUID();
    const runId = randomUUID();

    await db.insert(companies).values([
      {
        id: companyId,
        name: "PaperClaw",
        issuePrefix: `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
        requireBoardApprovalForNewAgents: false,
      },
      {
        id: otherCompanyId,
        name: "Other",
        issuePrefix: `T${otherCompanyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
        requireBoardApprovalForNewAgents: false,
      },
    ]);

    await db.insert(agents).values([
      {
        id: ceoId,
        companyId,
        name: "CEO",
        role: "ceo",
        status: "error",
        title: "Chief Executive Officer",
      },
      {
        companyId: otherCompanyId,
        name: "Other CEO",
        role: "ceo",
        status: "error",
      },
    ]);

    await db.insert(issues).values({
      id: issueId,
      companyId,
      title: "Recover missing next step",
      identifier: "PAP-7",
      status: "todo",
      priority: "high",
      assigneeAgentId: ceoId,
      originKind: RECOVERY_ORIGIN_KINDS.staleActiveRunEvaluation,
      originId: runId,
    });

    await db.insert(heartbeatRuns).values([
      {
        id: runId,
        companyId,
        agentId: ceoId,
        status: "failed",
        error: "Adapter exited",
        contextSnapshot: { issueId },
      },
      {
        companyId: otherCompanyId,
        agentId: ceoId,
        status: "failed",
        error: "Other failure",
      },
    ]);

    const summary = await opsIncidentService(db).summary(companyId);

    expect(summary.total).toBe(3);
    expect(summary.needsAction).toBe(3);
    expect(summary.byKind).toEqual([
      { key: "agent_error", count: 1 },
      { key: "failed_run", count: 1 },
      { key: "stuck_or_silent_run", count: 1 },
    ]);
    expect(summary.items.map((item) => item.kind).sort()).toEqual([
      "agent_error",
      "failed_run",
      "stuck_or_silent_run",
    ]);

    const pageTwo = await opsIncidentService(db).summary(companyId, { limit: 2, offset: 1 });
    expect(pageTwo.total).toBe(3);
    expect(pageTwo.items).toHaveLength(2);

    const filtered = await opsIncidentService(db).summary(companyId, { agentId: ceoId, q: "exited" });
    expect(filtered.total).toBe(1);
    expect(filtered.items[0]).toMatchObject({ kind: "failed_run", sourceId: runId });
  });
});
