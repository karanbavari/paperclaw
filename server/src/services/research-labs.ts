import { and, desc, eq, inArray } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  approvals,
  executionWorkspaces,
  researchLabs,
  workspaceRuntimeServices,
} from "@kesarcloud/db";
import type {
  Agent,
  Approval,
  CreateResearchLab,
  ExecutionWorkspace,
  ResearchLab,
  ResearchLabArtifact,
  ResearchLabDetail,
  ResearchLabListItem,
  ResearchLabStatus,
  UpdateResearchLab,
} from "@kesarcloud/shared";
import { forbidden, notFound } from "../errors.js";

type ResearchLabRow = typeof researchLabs.$inferSelect;
type Actor = {
  actorType: "user" | "agent";
  actorId: string;
  agentId: string | null;
};

function uniqueIds(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function toArtifact(value: Record<string, unknown>): ResearchLabArtifact {
  return {
    title: typeof value.title === "string" ? value.title : "Artifact",
    url: typeof value.url === "string" ? value.url : null,
    kind: typeof value.kind === "string" ? value.kind : null,
    description: typeof value.description === "string" ? value.description : null,
  };
}

function toLab(row: ResearchLabRow): ResearchLab {
  return {
    id: row.id,
    companyId: row.companyId,
    projectId: row.projectId,
    executionWorkspaceId: row.executionWorkspaceId,
    ownerAgentId: row.ownerAgentId,
    ownerUserId: row.ownerUserId,
    boardApprovalId: row.boardApprovalId,
    title: row.title,
    objective: row.objective,
    labType: row.labType as ResearchLab["labType"],
    status: row.status as ResearchLabStatus,
    allowedAgentIds: row.allowedAgentIds ?? [],
    demoUrls: row.demoUrls ?? [],
    artifacts: (row.artifacts ?? []).map(toArtifact),
    finalReport: row.finalReport,
    decisionNote: row.decisionNote,
    metadata: row.metadata ?? null,
    submittedToCeoAt: row.submittedToCeoAt,
    submittedToBoardAt: row.submittedToBoardAt,
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function hasLabAccess(row: ResearchLabRow, actor: Actor) {
  if (actor.actorType === "user") return true;
  if (!actor.agentId) return false;
  return row.ownerAgentId === actor.agentId || (row.allowedAgentIds ?? []).includes(actor.agentId);
}

async function enrichLabs(db: Db, rows: ResearchLabRow[]): Promise<ResearchLabListItem[]> {
  const agentIds = uniqueIds(rows.flatMap((row) => [row.ownerAgentId, ...(row.allowedAgentIds ?? [])]));
  const workspaceIds = uniqueIds(rows.map((row) => row.executionWorkspaceId));
  const approvalIds = uniqueIds(rows.map((row) => row.boardApprovalId));

  const agentRows = agentIds.length > 0
    ? await db.select().from(agents).where(inArray(agents.id, agentIds))
    : [];
  const workspaceRows = workspaceIds.length > 0
    ? await db.select().from(executionWorkspaces).where(inArray(executionWorkspaces.id, workspaceIds))
    : [];
  const approvalRows = approvalIds.length > 0
    ? await db.select().from(approvals).where(inArray(approvals.id, approvalIds))
    : [];

  const agentsById = new Map(agentRows.map((agent) => [agent.id, agent]));
  const workspacesById = new Map(workspaceRows.map((workspace) => [workspace.id, workspace]));
  const approvalsById = new Map(approvalRows.map((approval) => [approval.id, approval]));

  return rows.map((row) => {
    const lab = toLab(row);
    const workspace = row.executionWorkspaceId ? workspacesById.get(row.executionWorkspaceId) ?? null : null;
    const approval = row.boardApprovalId ? approvalsById.get(row.boardApprovalId) ?? null : null;
    return {
      ...lab,
      allowedAgents: lab.allowedAgentIds
        .map((agentId) => agentsById.get(agentId) ?? null)
        .filter((agent): agent is typeof agents.$inferSelect => Boolean(agent))
        .map((agent) => ({
          id: agent.id,
          name: agent.name,
          role: agent.role as Agent["role"],
          status: agent.status as Agent["status"],
        })),
      executionWorkspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            status: workspace.status as ExecutionWorkspace["status"],
            cwd: workspace.cwd,
          }
        : null,
      boardApproval: approval
        ? {
            id: approval.id,
            status: approval.status as Approval["status"],
            decisionNote: approval.decisionNote,
            decidedAt: approval.decidedAt,
          }
        : null,
    };
  });
}

export function researchLabService(db: Db) {
  async function getRow(companyId: string, labId: string, actor: Actor) {
    const row = await db
      .select()
      .from(researchLabs)
      .where(and(eq(researchLabs.companyId, companyId), eq(researchLabs.id, labId)))
      .then((rows) => rows[0] ?? null);
    if (!row) throw notFound("Research lab not found");
    if (!hasLabAccess(row, actor)) throw forbidden("This agent cannot access this research lab");
    return row;
  }

  async function updateStatus(
    companyId: string,
    labId: string,
    status: ResearchLabStatus,
    actor: Actor,
    patch: Partial<typeof researchLabs.$inferInsert> = {},
  ) {
    await getRow(companyId, labId, actor);
    const row = await db
      .update(researchLabs)
      .set({
        ...patch,
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(researchLabs.companyId, companyId), eq(researchLabs.id, labId)))
      .returning()
      .then((rows) => rows[0] ?? null);
    if (!row) throw notFound("Research lab not found");
    return getDetail(companyId, row.id, actor);
  }

  async function getDetail(companyId: string, labId: string, actor: Actor): Promise<ResearchLabDetail> {
    const row = await getRow(companyId, labId, actor);
    const lab = (await enrichLabs(db, [row]))[0]!;
    const runtimeServices = row.executionWorkspaceId
      ? await db
          .select()
          .from(workspaceRuntimeServices)
          .where(eq(workspaceRuntimeServices.executionWorkspaceId, row.executionWorkspaceId))
      : [];
    return {
      ...lab,
      runtimeServices: runtimeServices.map((service) => ({
        id: service.id,
        companyId: service.companyId,
        projectId: service.projectId,
        projectWorkspaceId: service.projectWorkspaceId,
        executionWorkspaceId: service.executionWorkspaceId,
        issueId: service.issueId,
        scopeType: service.scopeType as "project_workspace" | "execution_workspace" | "run" | "agent",
        scopeId: service.scopeId,
        serviceName: service.serviceName,
        status: service.status as "starting" | "running" | "stopped" | "failed",
        lifecycle: service.lifecycle as "shared" | "ephemeral",
        reuseKey: service.reuseKey,
        command: service.command,
        cwd: service.cwd,
        port: service.port,
        url: service.url,
        provider: service.provider as "local_process" | "adapter_managed",
        providerRef: service.providerRef,
        ownerAgentId: service.ownerAgentId,
        startedByRunId: service.startedByRunId,
        lastUsedAt: service.lastUsedAt,
        startedAt: service.startedAt,
        stoppedAt: service.stoppedAt,
        stopPolicy: service.stopPolicy,
        healthStatus: service.healthStatus as "unknown" | "healthy" | "unhealthy",
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
      })),
    };
  }

  return {
    list: async (companyId: string, actor: Actor): Promise<ResearchLabListItem[]> => {
      const rows = await db
        .select()
        .from(researchLabs)
        .where(eq(researchLabs.companyId, companyId))
        .orderBy(desc(researchLabs.updatedAt));
      return enrichLabs(db, rows.filter((row) => hasLabAccess(row, actor)));
    },

    get: getDetail,

    create: async (companyId: string, input: CreateResearchLab, actor: Actor): Promise<ResearchLabDetail> => {
      const now = new Date();
      const ownerAgentId = input.ownerAgentId ?? (actor.actorType === "agent" ? actor.agentId : null);
      const allowedAgentIds = uniqueIds([ownerAgentId, ...(input.allowedAgentIds ?? [])]);
      const row = await db
        .insert(researchLabs)
        .values({
          companyId,
          title: input.title,
          objective: input.objective,
          labType: input.labType,
          status: "draft",
          projectId: input.projectId ?? null,
          executionWorkspaceId: input.executionWorkspaceId ?? null,
          ownerAgentId,
          ownerUserId: actor.actorType === "user" ? actor.actorId : null,
          allowedAgentIds,
          demoUrls: input.demoUrls ?? [],
          artifacts: input.artifacts ?? [],
          finalReport: input.finalReport ?? null,
          metadata: input.metadata ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .then((rows) => rows[0]!);
      return getDetail(companyId, row.id, actor);
    },

    update: async (companyId: string, labId: string, input: UpdateResearchLab, actor: Actor): Promise<ResearchLabDetail> => {
      const current = await getRow(companyId, labId, actor);
      const ownerAgentId = input.ownerAgentId !== undefined ? input.ownerAgentId : current.ownerAgentId;
      const patch: Partial<typeof researchLabs.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.title !== undefined) patch.title = input.title;
      if (input.objective !== undefined) patch.objective = input.objective;
      if (input.labType !== undefined) patch.labType = input.labType;
      if (input.status !== undefined) patch.status = input.status;
      if (input.projectId !== undefined) patch.projectId = input.projectId;
      if (input.executionWorkspaceId !== undefined) patch.executionWorkspaceId = input.executionWorkspaceId;
      if (input.ownerAgentId !== undefined) patch.ownerAgentId = input.ownerAgentId;
      if (input.allowedAgentIds !== undefined) {
        patch.allowedAgentIds = uniqueIds([ownerAgentId, ...input.allowedAgentIds]);
      }
      if (input.demoUrls !== undefined) patch.demoUrls = input.demoUrls;
      if (input.artifacts !== undefined) patch.artifacts = input.artifacts;
      if (input.finalReport !== undefined) patch.finalReport = input.finalReport;
      if (input.decisionNote !== undefined) patch.decisionNote = input.decisionNote;
      if (input.metadata !== undefined) patch.metadata = input.metadata;

      const row = await db
        .update(researchLabs)
        .set(patch)
        .where(and(eq(researchLabs.companyId, companyId), eq(researchLabs.id, labId)))
        .returning()
        .then((rows) => rows[0] ?? null);
      if (!row) throw notFound("Research lab not found");
      return getDetail(companyId, row.id, actor);
    },

    submitToCeo: (companyId: string, labId: string, actor: Actor) =>
      updateStatus(companyId, labId, "ceo_review", actor, { submittedToCeoAt: new Date() }),

    submitToBoard: async (
      companyId: string,
      labId: string,
      actor: Actor,
      note?: string | null,
    ): Promise<ResearchLabDetail> => {
      const current = await getRow(companyId, labId, actor);
      const approval = await db
        .insert(approvals)
        .values({
          companyId,
          type: "research_lab_report",
          requestedByAgentId: actor.actorType === "agent" ? actor.agentId : null,
          requestedByUserId: actor.actorType === "user" ? actor.actorId : null,
          status: "pending",
          payload: {
            researchLabId: current.id,
            title: current.title,
            objective: current.objective,
            labType: current.labType,
            projectId: current.projectId,
            executionWorkspaceId: current.executionWorkspaceId,
            demoUrls: current.demoUrls,
            artifacts: current.artifacts,
            finalReport: current.finalReport,
            note: note ?? null,
          },
          decisionNote: null,
          decidedByUserId: null,
          decidedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .then((rows) => rows[0]!);

      return updateStatus(companyId, labId, "board_review", actor, {
        boardApprovalId: approval.id,
        submittedToBoardAt: new Date(),
      });
    },

    archive: (companyId: string, labId: string, actor: Actor, decisionNote?: string | null) =>
      updateStatus(companyId, labId, "archived", actor, {
        decisionNote: decisionNote ?? null,
        archivedAt: new Date(),
      }),

    trash: (companyId: string, labId: string, actor: Actor, decisionNote?: string | null) =>
      updateStatus(companyId, labId, "trashed", actor, {
        decisionNote: decisionNote ?? null,
        archivedAt: new Date(),
      }),
  };
}
