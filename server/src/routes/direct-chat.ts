import { Router } from "express";
import type { Db } from "@kesarcloud/db";
import { addDirectChatMessageSchema } from "@kesarcloud/shared";
import { validate } from "../middleware/validate.js";
import { assertCompanyAccess, getActorInfo } from "./authz.js";
import { directChatService } from "../services/direct-chat.js";
import { heartbeatService } from "../services/heartbeat.js";
import { logActivity } from "../services/index.js";
import type { PluginWorkerManager } from "../services/plugin-worker-manager.js";

export function directChatRoutes(
  db: Db,
  options: { pluginWorkerManager?: PluginWorkerManager } = {},
) {
  const router = Router();
  const directChat = directChatService(db);
  const heartbeat = heartbeatService(db, {
    pluginWorkerManager: options.pluginWorkerManager,
  });

  router.get("/companies/:companyId/direct-chat", async (req, res) => {
    const companyId = String(req.params.companyId);
    assertCompanyAccess(req, companyId);
    res.json(await directChat.get(companyId));
  });

  router.post(
    "/companies/:companyId/direct-chat/messages",
    validate(addDirectChatMessageSchema),
    async (req, res) => {
      const companyId = String(req.params.companyId);
      assertCompanyAccess(req, companyId);
      const actor = getActorInfo(req);

      const detail = req.actor.type === "agent"
        ? await directChat.addAgentMessage({
            companyId,
            agentId: req.actor.agentId!,
            body: req.body.body,
          })
        : await directChat.addBoardMessage({
            companyId,
            body: req.body.body,
            actor: {
              type: actor.actorType,
              id: actor.actorId,
            },
            wakeup: (agentId, wakeupOptions) => heartbeat.wakeup(agentId, wakeupOptions),
          });

      await logActivity(db, {
        companyId,
        actorType: actor.actorType,
        actorId: actor.actorId,
        agentId: actor.agentId,
        runId: actor.runId,
        action: "direct_chat.message_created",
        entityType: "direct_chat",
        entityId: detail.id,
        details: {
          messageAuthorType: req.actor.type === "agent" ? "agent" : "board",
          ceoAgentId: detail.ceoAgentId,
        },
      });

      res.status(201).json(detail);
    },
  );

  return router;
}
