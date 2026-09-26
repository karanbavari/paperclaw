import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import {
  abFeedbackQuerySchema, approveAbRunSchema, createAbRunSchema, createAbStudySchema, updateAbStudySchema,
} from "@kesarcloud/shared";
import { badRequest } from "../errors.js";
import { validate } from "../middleware/validate.js";
import { abTestService } from "../services/ab-tests.js";
import { heartbeatService } from "../services/heartbeat.js";
import { logActivity } from "../services/index.js";
import type { PluginWorkerManager } from "../services/plugin-worker-manager.js";
import { assertBoard, assertCompanyAccess, getActorInfo } from "./authz.js";

export function abTestRoutes(db: Db, options: { pluginWorkerManager?: PluginWorkerManager } = {}) {
  const router = Router();
  const heartbeat = heartbeatService(db, { pluginWorkerManager: options.pluginWorkerManager });
  const studies = abTestService(db, (agentId, input) => heartbeat.wakeup(agentId, input),
    (runId, reason) => heartbeat.cancelRun(runId, reason));

  function scope(req: Parameters<typeof assertBoard>[0]) {
    const companyId = String(req.params.companyId);
    assertCompanyAccess(req, companyId);
    assertBoard(req);
    return companyId;
  }

  async function activity(req: Parameters<typeof assertBoard>[0], companyId: string, studyId: string, action: string, details: Record<string, unknown> = {}) {
    const actor = getActorInfo(req);
    await logActivity(db, { companyId, actorType: actor.actorType, actorId: actor.actorId,
      agentId: actor.agentId, runId: actor.runId, action, entityType: "ab_study", entityId: studyId, details });
  }

  router.get("/companies/:companyId/ab-tests", async (req, res) => {
    res.json(await studies.listAll(scope(req)));
  });

  router.post("/companies/:companyId/ab-tests", validate(createAbStudySchema), async (req, res) => {
    const companyId = scope(req);
    const created = await studies.create(companyId, req.body);
    await activity(req, companyId, created.id, "ab_study.created", { projectId: created.projectId, workspaceId: created.workspaceId });
    res.status(201).json(created);
  });

  router.get("/companies/:companyId/ab-tests/:studyId", async (req, res) => {
    res.json(await studies.getDetail(scope(req), String(req.params.studyId)));
  });

  router.patch("/companies/:companyId/ab-tests/:studyId", validate(updateAbStudySchema), async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const updated = await studies.update(companyId, studyId, req.body);
    await activity(req, companyId, studyId, "ab_study.updated");
    res.json(updated);
  });

  router.post("/companies/:companyId/ab-tests/:studyId/preview", async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const preview = await studies.generatePreview(companyId, studyId);
    await activity(req, companyId, studyId, "ab_study.preview_requested");
    res.json(preview);
  });

  router.post("/companies/:companyId/ab-tests/:studyId/runs", validate(createAbRunSchema), async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const run = await studies.requestRun(companyId, studyId, req.actor.userId ?? null, req.body.targetCount);
    await activity(req, companyId, studyId, "ab_run.requested", { runId: run.id, targetCount: run.targetCount });
    res.status(201).json(run);
  });

  router.post("/companies/:companyId/ab-tests/:studyId/runs/:runId/approve", validate(approveAbRunSchema), async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const run = await studies.approveRun(companyId, studyId, String(req.params.runId), req.body.agentId, req.actor.userId ?? null);
    await activity(req, companyId, studyId, "ab_run.approved", { runId: run.id, agentId: run.agentId });
    res.json(run);
    void studies.tick().catch(() => {});
  });

  router.post("/companies/:companyId/ab-tests/:studyId/runs/:runId/cancel", async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const run = await studies.cancelRun(companyId, studyId, String(req.params.runId));
    await activity(req, companyId, studyId, "ab_run.cancelled", { runId: run.id });
    res.json(run);
  });

  router.get("/companies/:companyId/ab-tests/:studyId/feedback", async (req, res) => {
    const companyId = scope(req);
    const query = abFeedbackQuerySchema.safeParse(req.query);
    if (!query.success) throw badRequest("Invalid A/B feedback filters", query.error.flatten());
    res.json(await studies.getFeedback(companyId, String(req.params.studyId), query.data));
  });

  router.get("/companies/:companyId/ab-tests/:studyId/personas", async (req, res) => {
    const companyId = scope(req);
    const cursor = Number(req.query.cursor ?? -1);
    const limit = Number(req.query.limit ?? 30);
    if (!Number.isInteger(cursor) || cursor < -1 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw badRequest("Invalid persona pagination");
    res.json(await studies.listPersonas(companyId, String(req.params.studyId), cursor, limit));
  });

  router.post("/companies/:companyId/ab-tests/:studyId/archive", async (req, res) => {
    const companyId = scope(req);
    const studyId = String(req.params.studyId);
    const updated = await studies.archive(companyId, studyId);
    await activity(req, companyId, studyId, "ab_study.archived");
    res.json(updated);
  });

  return { router, tick: studies.tick };
}
