import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOpsIncidentService = vi.hoisted(() => ({
  summary: vi.fn(),
}));

vi.mock("../services/ops-incidents.js", () => ({
  opsIncidentService: () => mockOpsIncidentService,
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
  const [{ errorHandler }, { opsIncidentRoutes }] = await Promise.all([
    import("../middleware/index.js") as Promise<typeof import("../middleware/index.js")>,
    import("../routes/ops-incidents.js") as Promise<typeof import("../routes/ops-incidents.js")>,
  ]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = actor;
    next();
  });
  app.use("/api", opsIncidentRoutes({} as any));
  app.use(errorHandler);
  return app;
}

describe("ops incident routes", () => {
  beforeEach(() => {
    mockOpsIncidentService.summary.mockReset();
    mockOpsIncidentService.summary.mockResolvedValue({
      companyId: "company-1",
      total: 0,
      critical: 0,
      needsAction: 0,
      recovering: 0,
      monitoring: 0,
      byKind: [],
      bySeverity: [],
      byStatus: [],
      items: [],
    });
  });

  it("lists company operations incidents for a company member", async () => {
    const app = await createApp();
    const res = await request(app)
      .get("/api/companies/company-1/ops-incidents?kind=failed_run&severity=high&limit=25&offset=50");

    expect(res.status).toBe(200);
    expect(mockOpsIncidentService.summary).toHaveBeenCalledWith("company-1", {
      kind: "failed_run",
      severity: "high",
      limit: 25,
      offset: 50,
    });
  });

  it("allows viewer members to read operations incidents", async () => {
    const app = await createApp({
      type: "board",
      userId: "viewer-1",
      companyIds: ["company-1"],
      source: "session",
      isInstanceAdmin: false,
      memberships: [{ companyId: "company-1", status: "active", membershipRole: "viewer" }],
    });
    const res = await request(app).get("/api/companies/company-1/ops-incidents");

    expect(res.status).toBe(200);
    expect(mockOpsIncidentService.summary).toHaveBeenCalled();
  });

  it("rejects requests outside the actor company", async () => {
    const app = await createApp();
    const res = await request(app).get("/api/companies/company-2/ops-incidents");

    expect(res.status).toBe(403);
    expect(mockOpsIncidentService.summary).not.toHaveBeenCalled();
  });

  it("rejects anonymous requests", async () => {
    const app = await createApp({ type: "none" });
    const res = await request(app).get("/api/companies/company-1/ops-incidents");

    expect(res.status).toBe(401);
    expect(mockOpsIncidentService.summary).not.toHaveBeenCalled();
  });

  it("rejects invalid filters before calling the service", async () => {
    const app = await createApp();
    const res = await request(app).get("/api/companies/company-1/ops-incidents?kind=unknown");

    expect(res.status).toBe(400);
    expect(mockOpsIncidentService.summary).not.toHaveBeenCalled();
  });
});
