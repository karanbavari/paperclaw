import { Router, type Request } from "express";
import type { Db } from "@kesarcloud/db";
import {
  companyMemoryListQuerySchema,
  companyMemoryRecallSchema,
  createCompanyMemoryItemSchema,
  updateCompanyMemoryItemSchema,
  updateCompanyProfileSchema,
} from "@kesarcloud/shared";
import { forbidden } from "../errors.js";
import { validate } from "../middleware/validate.js";
import { agentService, companyLocalizationService, companyMemoryService, logActivity } from "../services/index.js";
import { assertCompanyAccess, getActorInfo } from "./authz.js";

export function companyMemoryRoutes(db: Db) {
  const router = Router();
  const memory = companyMemoryService(db);
  const localization = companyLocalizationService(db);
  const agents = agentService(db);

  async function isCeoAgent(req: Request, companyId: string) {
    if (req.actor.type !== "agent" || !req.actor.agentId) return false;
    const actorAgent = await agents.getById(req.actor.agentId);
    return Boolean(actorAgent && actorAgent.companyId === companyId && actorAgent.role === "ceo");
  }

  async function canManageMemory(req: Request, companyId: string) {
    assertCompanyAccess(req, companyId);
    if (req.actor.type === "board") return true;
    return await isCeoAgent(req, companyId);
  }

  async function assertCanManageMemory(req: Request, companyId: string) {
    if (await canManageMemory(req, companyId)) return;
    throw forbidden("Only Board users or CEO agents can manage company memory");
  }

  function actorForWrite(req: Request, canApprove: boolean) {
    return {
      userId: req.actor.type === "board" ? req.actor.userId ?? "board" : null,
      agentId: req.actor.type === "agent" ? req.actor.agentId ?? null : null,
      canApprove,
    };
  }

  router.get("/companies/:companyId/profile", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    res.json(await memory.getProfile(companyId));
  });

  router.patch(
    "/companies/:companyId/profile",
    validate(updateCompanyProfileSchema),
    async (req, res) => {
      const companyId = req.params.companyId as string;
      await assertCanManageMemory(req, companyId);
      const profile = await memory.upsertProfile(companyId, req.body);
      const localizationSync = await localization.syncManagedAgentInstructions(companyId, profile);
      const actor = getActorInfo(req);
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        agentId: actor.agentId,
        runId: actor.runId,
        action: "company.profile_updated",
        entityType: "company",
        entityId: companyId,
        details: { ...req.body, localizationSync },
      });
      res.json(profile);
    },
  );

  router.get("/companies/:companyId/memory", async (req, res) => {
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);
    const query = companyMemoryListQuerySchema.parse(req.query);
    res.json(await memory.listMemory(companyId, query));
  });

  router.post(
    "/companies/:companyId/memory",
    validate(createCompanyMemoryItemSchema),
    async (req, res) => {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      const canApprove = await canManageMemory(req, companyId);
      const item = await memory.createMemory(companyId, req.body, actorForWrite(req, canApprove));
      const actor = getActorInfo(req);
      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        agentId: actor.agentId,
        runId: actor.runId,
        action: "company.memory_created",
        entityType: "company_memory",
        entityId: item.id,
        details: { memoryType: item.memoryType, status: item.status, sourceType: item.sourceType },
      });
      res.status(201).json(item);
    },
  );

  router.patch(
    "/companies/:companyId/memory/:memoryId",
    validate(updateCompanyMemoryItemSchema),
    async (req, res) => {
      const companyId = req.params.companyId as string;
      const memoryId = req.params.memoryId as string;
      await assertCanManageMemory(req, companyId);
      const item = await memory.updateMemory(companyId, memoryId, req.body);
      if (!item) {
        res.status(404).json({ error: "Memory item not found" });
        return;
      }
      res.json(item);
    },
  );

  router.post("/companies/:companyId/memory/:memoryId/approve", async (req, res) => {
    const companyId = req.params.companyId as string;
    const memoryId = req.params.memoryId as string;
    await assertCanManageMemory(req, companyId);
    const item = await memory.approveMemory(companyId, memoryId, actorForWrite(req, true));
    if (!item) {
      res.status(404).json({ error: "Memory item not found" });
      return;
    }
    res.json(item);
  });

  router.post("/companies/:companyId/memory/:memoryId/archive", async (req, res) => {
    const companyId = req.params.companyId as string;
    const memoryId = req.params.memoryId as string;
    await assertCanManageMemory(req, companyId);
    const item = await memory.archiveMemory(companyId, memoryId);
    if (!item) {
      res.status(404).json({ error: "Memory item not found" });
      return;
    }
    res.json(item);
  });

  router.post(
    "/companies/:companyId/memory/recall",
    validate(companyMemoryRecallSchema),
    async (req, res) => {
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);
      res.json(await memory.recall(companyId, req.body));
    },
  );

  return router;
}
