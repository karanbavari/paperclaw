import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import { outcomeCenterQuerySchema } from "@kesarcloud/shared";
import { outcomeCenterService } from "../services/outcome-center.js";
import { assertCompanyAccess } from "./authz.js";

export function outcomeCenterRoutes(db: Db) {
  const router = Router();
  const svc = outcomeCenterService(db);

  router.get("/companies/:companyId/outcomes", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const query = outcomeCenterQuerySchema.parse(req.query);
    const summary = await svc.summary(companyId, query);
    res.json(summary);
  });

  return router;
}
