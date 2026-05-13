import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOutcomeCenterService = vi.hoisted(() => ({
  summary: vi.fn(),
}));

vi.mock("../services/outcome-center.js", () => ({
  outcomeCenterService: () => mockOutcomeCenterService,
}));

async function createApp(
  actor: Record<string, unknown> = {
    type: "board",
    userId: "user-1",
    companyIds: ["company-1"],
    source: "session",
    isInstanceAdmin: false,
  },
) {
  vi.resetModules();
  const [{ errorHandler }, { outcomeCenterRoutes }] = await Promise.all([
    import("../middleware/index.js") as Promise<typeof import("../middleware/index.js")>,
    import("../routes/outcome-center.js") as Promise<typeof import("../routes/outcome-center.js")>,
  ]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = actor;
    next();
  });
  app.use("/api", outcomeCenterRoutes({} as any));
  app.use(errorHandler);
  return app;
}

describe("outcome center routes", () => {
  beforeEach(() => {
    mockOutcomeCenterService.summary.mockReset();
    mockOutcomeCenterService.summary.mockResolvedValue({
      companyId: "company-1",
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

  it("lists company outcomes for a company member", async () => {
    const app = await createApp();
    const res = await request(app)
      .get("/api/companies/company-1/outcomes?type=pull_request&limit=25");

    expect(res.status).toBe(200);
    expect(mockOutcomeCenterService.summary).toHaveBeenCalledWith("company-1", {
      type: "pull_request",
      limit: 25,
    });
  });

  it("allows viewer members to read outcomes", async () => {
    const app = await createApp({
      type: "board",
      userId: "viewer-1",
      companyIds: ["company-1"],
      source: "session",
      isInstanceAdmin: false,
      memberships: [{ companyId: "company-1", status: "active", membershipRole: "viewer" }],
    });
    const res = await request(app).get("/api/companies/company-1/outcomes");

    expect(res.status).toBe(200);
    expect(mockOutcomeCenterService.summary).toHaveBeenCalled();
  });

  it("rejects requests outside the actor company", async () => {
    const app = await createApp();
    const res = await request(app).get("/api/companies/company-2/outcomes");

    expect(res.status).toBe(403);
    expect(mockOutcomeCenterService.summary).not.toHaveBeenCalled();
  });

  it("rejects anonymous requests", async () => {
    const app = await createApp({ type: "none" });
    const res = await request(app).get("/api/companies/company-1/outcomes");

    expect(res.status).toBe(401);
    expect(mockOutcomeCenterService.summary).not.toHaveBeenCalled();
  });

  it("rejects invalid filters before calling the service", async () => {
    const app = await createApp();
    const res = await request(app).get("/api/companies/company-1/outcomes?type=unknown");

    expect(res.status).toBe(400);
    expect(mockOutcomeCenterService.summary).not.toHaveBeenCalled();
  });
});
