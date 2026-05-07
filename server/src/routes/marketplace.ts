import { Router, type Request } from "express";
import type { Db } from "@kesarcloud/db";
import { marketplaceInstallSchema } from "@kesarcloud/shared";
import { validate } from "../middleware/validate.js";
import { forbidden } from "../errors.js";
import { agentService, logActivity, marketplaceService } from "../services/index.js";
import { assertCompanyAccess, getActorInfo } from "./authz.js";

export function marketplaceRoutes(db: Db) {
  const router = Router();
  const marketplace = marketplaceService(db);
  const agents = agentService(db);

  async function assertCanInstall(req: Request, companyId: string) {
    assertCompanyAccess(req, companyId);
    if (req.actor.type === "board") return;
    if (!req.actor.agentId) throw forbidden("Agent authentication required");
    const agent = await agents.getById(req.actor.agentId);
    if (!agent || agent.companyId !== companyId) {
      throw forbidden("Agent key cannot access another company");
    }
    if (agent.role === "ceo") return;
    throw forbidden("Only Board users or CEO agents can install marketplace skills");
  }

  router.get("/companies/:companyId/marketplace/categories", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    res.json(await marketplace.categories());
  });

  router.get("/companies/:companyId/marketplace/skills", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const limit = Number.parseInt(String(req.query.limit ?? ""), 10);
    res.json(await marketplace.list(companyId, {
      q: typeof req.query.q === "string" ? req.query.q : null,
      category: typeof req.query.category === "string" ? req.query.category : null,
      cursor: typeof req.query.cursor === "string" ? req.query.cursor : null,
      limit: Number.isFinite(limit) ? limit : null,
    }));
  });

  router.get("/companies/:companyId/marketplace/skills/:skillId", async (req, res) => {
    const companyId = req.params.companyId as string;
    const skillId = req.params.skillId as string;
    assertCompanyAccess(req, companyId);
    const detail = await marketplace.detail(companyId, skillId);
    if (!detail) {
      res.status(404).json({ error: "Marketplace skill not found" });
      return;
    }
    res.json(detail);
  });

  router.post(
    "/companies/:companyId/marketplace/install",
    validate(marketplaceInstallSchema),
    async (req, res) => {
      const companyId = req.params.companyId as string;
      await assertCanInstall(req, companyId);
      const actor = getActorInfo(req);
      const result = await marketplace.install(companyId, req.body, {
        actorType: actor.actorType,
        actorId: actor.actorId,
        agentId: actor.agentId,
      });
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        agentId: actor.agentId,
        runId: actor.runId,
        action: result.approval ? "marketplace.skill_install_requested" : "marketplace.skill_installed",
        entityType: result.approval ? "approval" : "company_skill",
        entityId: result.approval?.id ?? result.skill?.id ?? companyId,
        details: {
          skillId: req.body.skillId,
          assignMode: req.body.assignMode,
          assignedAgentIds: result.assignedAgentIds,
          approvalId: result.approval?.id ?? null,
          warningCount: result.warnings.length,
        },
      });
      res.status(result.approval ? 202 : 200).json(result);
    },
  );

  return router;
}
