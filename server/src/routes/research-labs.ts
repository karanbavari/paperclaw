import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import {
  createResearchLabSchema,
  researchLabDecisionSchema,
  researchLabSubmitSchema,
  updateResearchLabSchema,
} from "@kesarcloud/shared";
import { validate } from "../middleware/validate.js";
import { logActivity, researchLabService } from "../services/index.js";
import { assertCompanyAccess, getActorInfo } from "./authz.js";

export function researchLabRoutes(db: Db) {
  const router = Router();
  const labs = researchLabService(db);

  function actor(req: Parameters<typeof getActorInfo>[0]) {
    const info = getActorInfo(req);
    return {
      actorType: info.actorType,
      actorId: info.actorId,
      agentId: info.agentId,
      runId: info.runId,
    };
  }

  async function record(req: Parameters<typeof getActorInfo>[0], input: {
    companyId: string;
    action: string;
    labId: string;
    details?: Record<string, unknown>;
  }) {
    const info = actor(req);
    await logActivity(db, {
      companyId: input.companyId,
      actorType: info.actorType,
      actorId: info.actorId,
      agentId: info.agentId,
      runId: info.runId,
      action: input.action,
      entityType: "research_lab",
      entityId: input.labId,
      details: input.details ?? {},
    });
  }

  router.get("/companies/:companyId/research-labs", async (req, res) => {
    const companyId = String(req.params.companyId);
    assertCompanyAccess(req, companyId);
    res.json(await labs.list(companyId, actor(req)));
  });

  router.post(
    "/companies/:companyId/research-labs",
    validate(createResearchLabSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.create(companyId, req.body, actor(req));
      await record(req, {
        companyId,
        action: "research_lab.created",
        labId: lab.id,
        details: { labType: lab.labType, status: lab.status },
      });
      res.status(201).json(lab);
    },
  );

  router.get("/companies/:companyId/research-labs/:labId", async (req, res) => {
    const companyId = String(req.params.companyId);
    const labId = String(req.params.labId);
    assertCompanyAccess(req, companyId);
    res.json(await labs.get(companyId, labId, actor(req)));
  });

  router.patch(
    "/companies/:companyId/research-labs/:labId",
    validate(updateResearchLabSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const labId = String(req.params.labId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.update(companyId, labId, req.body, actor(req));
      await record(req, {
        companyId,
        action: "research_lab.updated",
        labId,
        details: { status: lab.status },
      });
      res.json(lab);
    },
  );

  router.post(
    "/companies/:companyId/research-labs/:labId/submit-ceo",
    validate(researchLabSubmitSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const labId = String(req.params.labId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.submitToCeo(companyId, labId, actor(req));
      await record(req, {
        companyId,
        action: "research_lab.submitted_to_ceo",
        labId,
        details: { note: req.body.note ?? null },
      });
      res.json(lab);
    },
  );

  router.post(
    "/companies/:companyId/research-labs/:labId/submit-board",
    validate(researchLabSubmitSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const labId = String(req.params.labId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.submitToBoard(companyId, labId, actor(req), req.body.note);
      await record(req, {
        companyId,
        action: "research_lab.submitted_to_board",
        labId,
        details: { approvalId: lab.boardApprovalId, note: req.body.note ?? null },
      });
      res.json(lab);
    },
  );

  router.post(
    "/companies/:companyId/research-labs/:labId/archive",
    validate(researchLabDecisionSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const labId = String(req.params.labId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.archive(companyId, labId, actor(req), req.body.decisionNote);
      await record(req, {
        companyId,
        action: "research_lab.archived",
        labId,
        details: { decisionNote: req.body.decisionNote ?? null },
      });
      res.json(lab);
    },
  );

  router.post(
    "/companies/:companyId/research-labs/:labId/trash",
    validate(researchLabDecisionSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const labId = String(req.params.labId);
      assertCompanyAccess(req, companyId);
      const lab = await labs.trash(companyId, labId, actor(req), req.body.decisionNote);
      await record(req, {
        companyId,
        action: "research_lab.trashed",
        labId,
        details: { decisionNote: req.body.decisionNote ?? null },
      });
      res.json(lab);
    },
  );

  return router;
}
