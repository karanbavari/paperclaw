import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import {
  effectiveToolPermissionsQuerySchema,
  replaceToolPermissionPoliciesSchema,
} from "@kesarcloud/shared";
import { validate } from "../middleware/validate.js";
import { assertBoardOrgAccess, assertCompanyAccess, getActorInfo } from "./authz.js";
import { toolPermissionService } from "../services/tool-permissions.js";
import { agentToolsMdService } from "../services/agent-tools-md.js";

export function toolPermissionRoutes(db: Db) {
  const router = Router();
  const svc = toolPermissionService(db);
  const agentToolsMd = agentToolsMdService(db);

  router.get("/companies/:companyId/tool-permissions", async (req, res) => {
    assertBoardOrgAccess(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const policies = await svc.listPolicies(companyId);
    res.json({ companyId, policies, effective: [] });
  });

  router.put(
    "/companies/:companyId/tool-permissions",
    validate(replaceToolPermissionPoliciesSchema),
    async (req, res) => {
      assertBoardOrgAccess(req);
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const actor = getActorInfo(req);
      const policies = await svc.replacePolicies(companyId, req.body.policies, actor);
      const toolsMdSync = await agentToolsMd.syncCompany(companyId, actor);
      res.json({ companyId, policies, effective: [], toolsMdSync });
    },
  );

  router.get("/companies/:companyId/tool-permissions/effective", async (req, res) => {
    assertBoardOrgAccess(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const parsed = effectiveToolPermissionsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
      return;
    }
    const pluginKey = parsed.data.pluginKey ?? "";
    const toolName = parsed.data.toolName ?? "";
    if (!pluginKey || !toolName) {
      res.status(400).json({ error: "pluginKey and toolName are required" });
      return;
    }
    const effective = await svc.resolveEffective(companyId, parsed.data.agentId ?? null, pluginKey, toolName);
    res.json(effective);
  });

  router.get("/companies/:companyId/tool-permission-decisions", async (req, res) => {
    assertBoardOrgAccess(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 100) || 100, 1), 500);
    const decisions = await svc.listDecisions(companyId, limit);
    res.json(decisions);
  });

  return router;
}
