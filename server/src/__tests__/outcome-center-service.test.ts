import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { companies, createDb, issueWorkProducts, issues, projects } from "@kesarcloud/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { outcomeCenterService } from "../services/outcome-center.ts";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping embedded Postgres outcome center service tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres("outcomeCenterService", () => {
  let db!: ReturnType<typeof createDb>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclaw-outcome-center-service-");
    db = createDb(tempDb.connectionString);
  }, 20_000);

  afterEach(async () => {
    await db.delete(issueWorkProducts);
    await db.delete(issues);
    await db.delete(projects);
    await db.delete(companies);
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  it("aggregates company work products with issue and project context", async () => {
    const companyId = randomUUID();
    const otherCompanyId = randomUUID();
    const projectId = randomUUID();
    const issueId = randomUUID();
    const hiddenIssueId = randomUUID();
    const otherIssueId = randomUUID();

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

    await db.insert(projects).values({
      id: projectId,
      companyId,
      name: "Website",
      status: "in_progress",
      color: "#2563eb",
    });

    await db.insert(issues).values([
      {
        id: issueId,
        companyId,
        projectId,
        title: "Ship landing page",
        identifier: "PAP-1",
        status: "done",
        priority: "high",
      },
      {
        id: hiddenIssueId,
        companyId,
        title: "Hidden work",
        identifier: "PAP-2",
        hiddenAt: new Date("2026-03-18T00:00:00.000Z"),
      },
      {
        id: otherIssueId,
        companyId: otherCompanyId,
        title: "Other company work",
        identifier: "OTH-1",
      },
    ]);

    await db.insert(issueWorkProducts).values([
      {
        companyId,
        projectId,
        issueId,
        type: "pull_request",
        provider: "github",
        title: "Landing page PR",
        url: "https://example.com/pr/1",
        status: "ready_for_review",
        reviewState: "needs_board_review",
        healthStatus: "healthy",
        summary: "Ready for board review.",
        updatedAt: new Date("2026-03-18T12:00:00.000Z"),
      },
      {
        companyId,
        issueId,
        type: "preview_url",
        provider: "paperclaw",
        title: "Preview",
        url: "https://preview.example.com",
        status: "active",
        reviewState: "none",
        healthStatus: "healthy",
        updatedAt: new Date("2026-03-18T13:00:00.000Z"),
      },
      {
        companyId,
        issueId: hiddenIssueId,
        type: "artifact",
        provider: "paperclaw",
        title: "Hidden artifact",
        status: "active",
      },
      {
        companyId: otherCompanyId,
        issueId: otherIssueId,
        type: "pull_request",
        provider: "github",
        title: "Other PR",
        status: "failed",
        healthStatus: "unhealthy",
      },
    ]);

    const summary = await outcomeCenterService(db).summary(companyId);

    expect(summary.total).toBe(2);
    expect(summary.needsReview).toBe(1);
    expect(summary.healthy).toBe(2);
    expect(summary.failedOrUnhealthy).toBe(0);
    expect(summary.byType).toEqual([
      { key: "preview_url", count: 1 },
      { key: "pull_request", count: 1 },
    ]);
    expect(summary.items.map((item) => item.workProduct.title)).toEqual(["Preview", "Landing page PR"]);
    expect(summary.items[0]?.issue).toMatchObject({ identifier: "PAP-1", title: "Ship landing page" });
    expect(summary.items[0]?.project).toMatchObject({ id: projectId, name: "Website" });
  });

  it("applies filters and stable empty results", async () => {
    const companyId = randomUUID();
    const projectId = randomUUID();
    const issueId = randomUUID();

    await db.insert(companies).values({
      id: companyId,
      name: "PaperClaw",
      issuePrefix: `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      requireBoardApprovalForNewAgents: false,
    });
    await db.insert(projects).values({ id: projectId, companyId, name: "Reports", status: "planned" });
    await db.insert(issues).values({
      id: issueId,
      companyId,
      projectId,
      title: "Publish report",
      identifier: "PAP-10",
    });
    await db.insert(issueWorkProducts).values({
      companyId,
      projectId,
      issueId,
      type: "document",
      provider: "paperclaw",
      title: "Investor Report",
      status: "approved",
      reviewState: "approved",
    });

    const matching = await outcomeCenterService(db).summary(companyId, {
      type: "document",
      status: "approved",
      reviewState: "approved",
      projectId,
      q: "investor",
    });
    expect(matching.total).toBe(1);
    expect(matching.items).toHaveLength(1);

    const empty = await outcomeCenterService(db).summary(companyId, { q: "missing" });
    expect(empty).toMatchObject({
      companyId,
      total: 0,
      needsReview: 0,
      healthy: 0,
      failedOrUnhealthy: 0,
      byType: [],
      byStatus: [],
      byReviewState: [],
      byHealthStatus: [],
      items: [],
    });
  });
});
