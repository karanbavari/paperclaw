import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { agents, companies, createDb, heartbeatRuns, projectWorkspaces, projects } from "@kesarcloud/db";
import { getEmbeddedPostgresTestSupport, startEmbeddedPostgresTestDatabase } from "./helpers/embedded-postgres.js";
import { abTestService } from "../services/ab-tests.js";

const support = await getEmbeddedPostgresTestSupport();
const describePostgres = support.supported ? describe : describe.skip;
if (!support.supported) console.warn(`Skipping A/B database integration test: ${support.reason ?? "embedded Postgres unavailable"}`);

describePostgres("A/B study service", () => {
  let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;
  let service: ReturnType<typeof abTestService>;
  let db: ReturnType<typeof createDb>;

  beforeAll(async () => {
    database = await startEmbeddedPostgresTestDatabase("paperclaw-ab-tests-");
    db = createDb(database.connectionString);
    service = abTestService(db);
  }, 60_000);

  afterAll(async () => { await database?.cleanup(); });

  it("creates a company-scoped study from a registered workspace and updates an unapproved run", async () => {
    const companyId = randomUUID();
    const otherCompanyId = randomUUID();
    await db.insert(companies).values([
      { id: companyId, name: "AB Company", issuePrefix: `AB${companyId.slice(0, 5).toUpperCase()}` },
      { id: otherCompanyId, name: "Other Company", issuePrefix: `OT${otherCompanyId.slice(0, 5).toUpperCase()}` },
    ]);
    const [project] = await db.insert(projects).values({ companyId, name: "Product" }).returning();
    const [workspace] = await db.insert(projectWorkspaces).values({ companyId, projectId: project!.id,
      name: "Local project", sourceType: "local_path", cwd: process.cwd() }).returning();
    const study = await service.create(companyId, { projectId: project!.id, workspaceId: workspace!.id,
      title: "Positioning", description: "A workflow product for small teams that need reliable coordination" });
    expect(study.status).toBe("draft");
    expect(study.audience.reduce((sum, segment) => sum + segment.share, 0)).toBe(100);
    expect((await service.getDetail(companyId, study.id)).study.id).toBe(study.id);
    await expect(service.getDetail(otherCompanyId, study.id)).rejects.toThrow();
    await expect(service.create(otherCompanyId, { projectId: project!.id, workspaceId: workspace!.id,
      title: "Cross-company", description: "A workflow product for small teams that need reliable coordination" })).rejects.toThrow();

    await service.update(companyId, study.id, { marketContext: { productPrice: 120, currency: "USD", pricePeriod: "month" } });
    const run = await service.requestRun(companyId, study.id, "operator");
    expect(run.status).toBe("pending_approval");
    expect(run.targetCount).toBe(30);
    const updated = await service.update(companyId, study.id, { variantB: "A simpler alternative for risk-conscious operators" });
    const detail = await service.getDetail(companyId, study.id);
    expect(detail.runs[0]?.run.variantB).toBe(updated.variantB);
    expect(detail.runs[0]?.run.sourceHash).toBe(updated.sourceHash);

    const [agent] = await db.insert(agents).values({ companyId, name: "Marketing agent", role: "cmo",
      adapterType: "codex_local", status: "idle" }).returning();
    const simulation = abTestService(db, async (agentId, options) => {
      const task = options.contextSnapshot.paperclawAbTest as { personas: Array<{ ordinal: number; segment: string }> };
      const responses = task.personas.map((persona) => ({ ordinal: persona.ordinal,
        profile: { name: `Person ${persona.ordinal}`, industry: "Software", role: persona.segment,
          city: "Austin", state: "Texas", country: "United States", annualIncome: null,
          annualSalary: null, spendingLimit: [100, 50, 150][persona.ordinal] ?? null,
          spendingLimitPeriod: persona.ordinal < 3 ? "month" : null, currency: "USD", dailyRoutine: ["Start work", "Review tools"],
          assumptions: ["Income not evidenced"], context: `Team member ${persona.ordinal}`, concern: "Adoption effort" },
        rating: persona.ordinal % 5 + 1, budgetFit: "unknown", workflowFit: "partial",
        rationale: "Useful concept but depends on current workflow", objection: "Setup time" }));
      const [heartbeat] = await db.insert(heartbeatRuns).values({ companyId, agentId, status: "succeeded",
        resultJson: { summary: JSON.stringify({ responses }) } }).returning();
      return heartbeat!;
    });
    await simulation.approveRun(companyId, study.id, run.id, agent!.id, "operator");
    await simulation.tick();
    await simulation.tick();
    const afterBatch = await simulation.getDetail(companyId, study.id);
    expect(afterBatch.personaCount).toBe(30);
    expect(afterBatch.runs[0]?.run.completedCount).toBe(20);
    expect(Object.values(afterBatch.runs[0]!.counts.A).reduce((sum, count) => sum + count, 0)
      + Object.values(afterBatch.runs[0]!.counts.B).reduce((sum, count) => sum + count, 0)).toBe(20);
    const feedback = await simulation.getFeedback(companyId, study.id, { runId: run.id, limit: 30 });
    expect(feedback.items).toHaveLength(20);
    expect(feedback.items.slice(0, 4).map((item) => item.budgetFit)).toEqual(["stretch", "not_fit", "fit", "unknown"]);
    const personas = await simulation.listPersonas(companyId, study.id, -1, 30);
    expect(personas.items).toHaveLength(20);
    expect(personas.items[0]?.profile.city).toBe("Austin");
  });
});
