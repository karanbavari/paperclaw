import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import { opsIncidentQuerySchema } from "@kesarcloud/shared";
import { opsIncidentService } from "../services/ops-incidents.js";
import { assertCompanyAccess } from "./authz.js";

export function opsIncidentRoutes(db: Db) {
  const router = Router();
  const svc = opsIncidentService(db);

  router.get("/companies/:companyId/ops-incidents", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const query = opsIncidentQuerySchema.parse(req.query);
    const summary = await svc.summary(companyId, query);
    res.json(summary);
  });

  return router;
}
