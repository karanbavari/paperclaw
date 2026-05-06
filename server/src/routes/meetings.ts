import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import {
  addMeetingMessageSchema,
  createMeetingSchema,
} from "@kesarcloud/shared";
import { validate } from "../middleware/validate.js";
import { assertBoard, assertCompanyAccess, getActorInfo } from "./authz.js";
import { heartbeatService } from "../services/heartbeat.js";
import { meetingService } from "../services/meetings.js";
import type { PluginWorkerManager } from "../services/plugin-worker-manager.js";

export function meetingRoutes(
  db: Db,
  options: { pluginWorkerManager?: PluginWorkerManager } = {},
) {
  const router = Router();
  const meetings = meetingService(db);
  const heartbeat = heartbeatService(db, {
    pluginWorkerManager: options.pluginWorkerManager,
  });

  router.get("/companies/:companyId/meetings", async (req, res) => {
    const companyId = String(req.params.companyId);
    assertCompanyAccess(req, companyId);
    res.json(await meetings.list(companyId));
  });

  router.post("/companies/:companyId/meetings", validate(createMeetingSchema), async (req, res) => {
    const companyId = String(req.params.companyId);
    assertBoard(req);
    assertCompanyAccess(req, companyId);
    const actor = getActorInfo(req);
    const meeting = await meetings.create({
      companyId,
      title: req.body.title,
      topic: req.body.topic,
      agentIds: req.body.agentIds,
      actor: {
        type: actor.actorType,
        id: actor.actorId,
        agentId: actor.agentId,
      },
    });
    res.status(201).json(meeting);
  });

  router.get("/companies/:companyId/meetings/:meetingId", async (req, res) => {
    const companyId = String(req.params.companyId);
    const meetingId = String(req.params.meetingId);
    assertCompanyAccess(req, companyId);
    res.json(await meetings.get(companyId, meetingId));
  });

  router.post(
    "/companies/:companyId/meetings/:meetingId/messages",
    validate(addMeetingMessageSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      const meetingId = String(req.params.meetingId);
      assertBoard(req);
      assertCompanyAccess(req, companyId);
      const actor = getActorInfo(req);
      const detail = await meetings.addBoardMessage({
        companyId,
        meetingId,
        body: req.body.body,
        targetAgentId: req.body.targetAgentId,
        actor: {
          type: actor.actorType,
          id: actor.actorId,
        },
        wakeup: (agentId, options) => heartbeat.wakeup(agentId, options),
      });
      res.status(201).json(detail);
    },
  );

  return router;
}
