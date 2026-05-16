import { and, desc, eq, inArray, isNull, ne, notInArray, sql } from "drizzle-orm";
import type { Db } from "@kesarcloud/db";
import {
  agents,
  budgetIncidents,
  companies,
  executionWorkspaces,
  heartbeatRuns,
  issues,
  pluginCompanySettings,
  pluginJobRuns,
  pluginJobs,
  pluginLogs,
  plugins,
  projects,
  workspaceOperations,
  workspaceRuntimeServices,
} from "@kesarcloud/db";
import type {
  BudgetIncident,
  OpsIncidentAction,
  OpsIncidentFilters,
  OpsIncidentItem,
  OpsIncidentKindCount,
  OpsIncidentRef,
  OpsIncidentSeverity,
  OpsIncidentStatus,
  OpsIncidentSummary,
} from "@kesarcloud/shared";
import { notFound } from "../errors.js";
import { budgetService } from "./budgets.js";
import { RECOVERY_ORIGIN_KINDS } from "./recovery/origins.js";

const RECOVERY_ORIGINS = [
  RECOVERY_ORIGIN_KINDS.issueGraphLivenessEscalation,
  RECOVERY_ORIGIN_KINDS.strandedIssueRecovery,
  RECOVERY_ORIGIN_KINDS.staleActiveRunEvaluation,
  RECOVERY_ORIGIN_KINDS.issueProductivityReview,
] as const;

const DEFAULT_LIMIT = 100;
const SOURCE_QUERY_LIMIT = 200;

type IncidentDraft = OpsIncidentItem;

function ref(id: string | null | undefined, label: string | null | undefined, extra?: {
  title?: string | null;
  status?: string | null;
}): OpsIncidentRef | null {
  if (!id) return null;
  return {
    id,
    label: label?.trim() || id.slice(0, 8),
    title: extra?.title ?? null,
    status: extra?.status ?? null,
  };
}

function countValues(items: OpsIncidentItem[], key: keyof Pick<OpsIncidentItem, "kind" | "severity" | "status">): OpsIncidentKindCount[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(String(item[key]), (counts.get(String(item[key])) ?? 0) + 1);
  return [...counts.entries()]
    .map(([countKey, count]) => ({ key: countKey, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function itemSearchText(item: OpsIncidentItem) {
  return [
    item.kind,
    item.severity,
    item.status,
    item.title,
    item.summary,
    item.recommendedAction,
    item.issue?.label,
    item.issue?.title,
    item.run?.label,
    item.agent?.label,
    item.agent?.title,
    item.project?.label,
    item.plugin?.label,
    item.workspace?.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function applyFilters(items: OpsIncidentItem[], filters: OpsIncidentFilters) {
  const q = normalizeText(filters.q);
  return items.filter((item) => {
    if (filters.kind && item.kind !== filters.kind) return false;
    if (filters.severity && item.severity !== filters.severity) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.projectId && item.project?.id !== filters.projectId) return false;
    if (filters.agentId && item.agent?.id !== filters.agentId) return false;
    if (q && !itemSearchText(item).includes(q)) return false;
    return true;
  });
}

function severityRank(severity: OpsIncidentSeverity) {
  return severity === "critical" ? 0 : severity === "high" ? 1 : severity === "medium" ? 2 : 3;
}

function statusRank(status: OpsIncidentStatus) {
  return status === "needs_action" ? 0 : status === "recovering" ? 1 : status === "monitoring" ? 2 : 3;
}

function sortIncidents(items: OpsIncidentItem[]) {
  return [...items].sort((a, b) =>
    severityRank(a.severity) - severityRank(b.severity) ||
    statusRank(a.status) - statusRank(b.status) ||
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function readStringFromRecord(record: unknown, key: string) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return null;
  const value = (record as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function runIssueId(context: unknown) {
  return readStringFromRecord(context, "issueId") ?? readStringFromRecord(context, "taskId");
}

function budgetIncidentToItem(incident: BudgetIncident): IncidentDraft {
  const hardStop = incident.thresholdType === "hard";
  return {
    id: `budget:${incident.id}`,
    kind: "budget_incident",
    severity: hardStop ? "critical" : "high",
    status: "needs_action",
    title: `${hardStop ? "Hard budget stop" : "Budget warning"} for ${incident.scopeName}`,
    summary: `${incident.amountObserved} observed against ${incident.amountLimit} ${incident.metric}.`,
    recommendedAction: hardStop
      ? "Raise the budget and resume the scope, or keep the scope paused."
      : "Review spend and dismiss only if the budget state is expected.",
    sourceType: "budget_incident",
    sourceId: incident.id,
    issue: null,
    run: null,
    agent: incident.scopeType === "agent" ? ref(incident.scopeId, incident.scopeName) : null,
    project: incident.scopeType === "project" ? ref(incident.scopeId, incident.scopeName) : null,
    plugin: null,
    workspace: null,
    actions: ["open_costs", "resolve_budget"],
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  };
}

export function opsIncidentService(db: Db) {
  async function assertCompanyExists(companyId: string) {
    const company = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .then((rows) => rows[0] ?? null);
    if (!company) throw notFound("Company not found");
  }

  async function failedRunIncidents(companyId: string): Promise<IncidentDraft[]> {
    const rows = await db
      .select({
        run: heartbeatRuns,
        agent: {
          id: agents.id,
          name: agents.name,
          role: agents.role,
          title: agents.title,
          status: agents.status,
        },
      })
      .from(heartbeatRuns)
      .innerJoin(agents, eq(heartbeatRuns.agentId, agents.id))
      .where(and(eq(heartbeatRuns.companyId, companyId), inArray(heartbeatRuns.status, ["failed", "timed_out"])))
      .orderBy(desc(heartbeatRuns.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    return rows.map(({ run, agent }) => {
      const issueId = runIssueId(run.contextSnapshot);
      return {
        id: `run:${run.id}`,
        kind: "failed_run",
        severity: run.status === "timed_out" ? "high" : "medium",
        status: "needs_action",
        title: `${agent.name} run ${run.status}`,
        summary: run.error ?? run.errorCode ?? run.stderrExcerpt ?? "A heartbeat run ended without completing successfully.",
        recommendedAction: "Open the run transcript, then retry or repair the owning issue if the failure is actionable.",
        sourceType: "heartbeat_run",
        sourceId: run.id,
        issue: issueId ? ref(issueId, issueId.slice(0, 8)) : null,
        run: ref(run.id, run.id.slice(0, 8), { status: run.status }),
        agent: ref(agent.id, agent.name, { title: agent.title ?? agent.role, status: agent.status }),
        project: null,
        plugin: null,
        workspace: null,
        actions: issueId ? ["open_run", "open_issue"] : ["open_run"],
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
      };
    });
  }

  async function recoveryIssueIncidents(companyId: string): Promise<IncidentDraft[]> {
    const rows = await db
      .select({
        issue: issues,
        agent: {
          id: agents.id,
          name: agents.name,
          role: agents.role,
          title: agents.title,
          status: agents.status,
        },
        project: {
          id: projects.id,
          name: projects.name,
          status: projects.status,
        },
      })
      .from(issues)
      .leftJoin(agents, eq(issues.assigneeAgentId, agents.id))
      .leftJoin(projects, eq(issues.projectId, projects.id))
      .where(
        and(
          eq(issues.companyId, companyId),
          inArray(issues.originKind, [...RECOVERY_ORIGINS]),
          isNull(issues.hiddenAt),
          notInArray(issues.status, ["done", "cancelled"]),
        ),
      )
      .orderBy(desc(issues.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    return rows.map(({ issue, agent, project }) => {
      const staleRun = issue.originKind === RECOVERY_ORIGIN_KINDS.staleActiveRunEvaluation;
      const severity: OpsIncidentSeverity = issue.priority === "critical"
        ? "critical"
        : issue.priority === "high"
          ? "high"
          : staleRun
            ? "high"
            : "medium";
      return {
        id: `recovery:${issue.id}`,
        kind: staleRun ? "stuck_or_silent_run" : "recovery_issue",
        severity,
        status: issue.status === "in_progress" ? "recovering" : "needs_action",
        title: issue.title,
        summary: issue.description ? issue.description.slice(0, 220) : "PaperClaw opened recovery work for an unhealthy execution path.",
        recommendedAction: staleRun
          ? "Review the watchdog evidence and snooze, continue, or dismiss the evaluation."
          : "Open the recovery issue and restore a valid live or waiting path.",
        sourceType: "issue",
        sourceId: issue.id,
        issue: ref(issue.id, issue.identifier ?? issue.id.slice(0, 8), { title: issue.title, status: issue.status }),
        run: issue.originKind === RECOVERY_ORIGIN_KINDS.staleActiveRunEvaluation && issue.originId
          ? ref(issue.originId, issue.originId.slice(0, 8))
          : null,
        agent: agent?.id ? ref(agent.id, agent.name, { title: agent.title ?? agent.role, status: agent.status }) : null,
        project: project?.id ? ref(project.id, project.name, { status: project.status }) : null,
        plugin: null,
        workspace: null,
        actions: staleRun ? ["open_issue", "open_run", "record_watchdog_decision"] : ["open_issue"],
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      };
    });
  }

  async function agentErrorIncidents(companyId: string): Promise<IncidentDraft[]> {
    const rows = await db
      .select()
      .from(agents)
      .where(and(eq(agents.companyId, companyId), eq(agents.status, "error")))
      .orderBy(desc(agents.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    return rows.map((agent) => ({
      id: `agent:${agent.id}`,
      kind: "agent_error",
      severity: "high",
      status: "needs_action",
      title: `${agent.name} is in error state`,
      summary: agent.capabilities ?? "This agent cannot reliably accept new work until its configuration/runtime is repaired.",
      recommendedAction: "Open the agent configuration and recent runs to identify the runtime or adapter error.",
      sourceType: "agent",
      sourceId: agent.id,
      issue: null,
      run: null,
      agent: ref(agent.id, agent.name, { title: agent.title ?? agent.role, status: agent.status }),
      project: null,
      plugin: null,
      workspace: null,
      actions: ["open_agent"],
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }));
  }

  async function pluginFailureIncidents(companyId: string): Promise<IncidentDraft[]> {
    const settingsRows = await db
      .select({
        setting: pluginCompanySettings,
        plugin: plugins,
      })
      .from(pluginCompanySettings)
      .innerJoin(plugins, eq(pluginCompanySettings.pluginId, plugins.id))
      .where(and(eq(pluginCompanySettings.companyId, companyId), ne(pluginCompanySettings.lastError, "")))
      .orderBy(desc(pluginCompanySettings.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    const settingIncidents = settingsRows
      .filter(({ setting }) => setting.lastError && setting.lastError.trim().length > 0)
      .map(({ setting, plugin }) => ({
        id: `plugin-setting:${setting.id}`,
        kind: "plugin_failure" as const,
        severity: "high" as const,
        status: "needs_action" as const,
        title: `${plugin.packageName} company setup error`,
        summary: setting.lastError,
        recommendedAction: "Open the plugin setup/settings page and repair the company-scoped configuration.",
        sourceType: "plugin_company_settings",
        sourceId: setting.id,
        issue: null,
        run: null,
        agent: null,
        project: null,
        plugin: ref(plugin.id, plugin.packageName, { title: plugin.pluginKey, status: plugin.status }),
        workspace: null,
        actions: ["open_plugin"] as OpsIncidentAction[],
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt,
      }));

    const jobRows = await db
      .select({
        run: pluginJobRuns,
        job: pluginJobs,
        plugin: plugins,
      })
      .from(pluginJobRuns)
      .innerJoin(pluginJobs, eq(pluginJobRuns.jobId, pluginJobs.id))
      .innerJoin(plugins, eq(pluginJobRuns.pluginId, plugins.id))
      .innerJoin(pluginCompanySettings, and(
        eq(pluginCompanySettings.pluginId, plugins.id),
        eq(pluginCompanySettings.companyId, companyId),
      ))
      .where(eq(pluginJobRuns.status, "failed"))
      .orderBy(desc(pluginJobRuns.createdAt))
      .limit(SOURCE_QUERY_LIMIT);

    const jobIncidents = jobRows.map(({ run, job, plugin }) => ({
      id: `plugin-job-run:${run.id}`,
      kind: "plugin_failure" as const,
      severity: "medium" as const,
      status: "needs_action" as const,
      title: `${plugin.packageName} job failed: ${job.jobKey}`,
      summary: run.error ?? "A plugin job failed.",
      recommendedAction: "Open the plugin page and inspect the failed job/logs.",
      sourceType: "plugin_job_run",
      sourceId: run.id,
      issue: null,
      run: null,
      agent: null,
      project: null,
      plugin: ref(plugin.id, plugin.packageName, { title: plugin.pluginKey, status: plugin.status }),
      workspace: null,
      actions: ["open_plugin"] as OpsIncidentAction[],
      createdAt: run.createdAt,
      updatedAt: run.finishedAt ?? run.createdAt,
    }));

    const logRows = await db
      .select({
        log: pluginLogs,
        plugin: plugins,
      })
      .from(pluginLogs)
      .innerJoin(plugins, eq(pluginLogs.pluginId, plugins.id))
      .innerJoin(pluginCompanySettings, and(
        eq(pluginCompanySettings.pluginId, plugins.id),
        eq(pluginCompanySettings.companyId, companyId),
      ))
      .where(inArray(pluginLogs.level, ["error", "fatal"]))
      .orderBy(desc(pluginLogs.createdAt))
      .limit(50);

    const logIncidents = logRows.map(({ log, plugin }) => ({
      id: `plugin-log:${log.id}`,
      kind: "plugin_failure" as const,
      severity: log.level === "fatal" ? "high" as const : "medium" as const,
      status: "needs_action" as const,
      title: `${plugin.packageName} emitted ${log.level}`,
      summary: log.message,
      recommendedAction: "Open the plugin logs and repair the plugin or its configuration.",
      sourceType: "plugin_log",
      sourceId: log.id,
      issue: null,
      run: null,
      agent: null,
      project: null,
      plugin: ref(plugin.id, plugin.packageName, { title: plugin.pluginKey, status: plugin.status }),
      workspace: null,
      actions: ["open_plugin"] as OpsIncidentAction[],
      createdAt: log.createdAt,
      updatedAt: log.createdAt,
    }));

    return [...settingIncidents, ...jobIncidents, ...logIncidents];
  }

  async function workspaceIncidents(companyId: string): Promise<IncidentDraft[]> {
    const serviceRows = await db
      .select({
        service: workspaceRuntimeServices,
        project: {
          id: projects.id,
          name: projects.name,
          status: projects.status,
        },
        agent: {
          id: agents.id,
          name: agents.name,
          role: agents.role,
          title: agents.title,
          status: agents.status,
        },
      })
      .from(workspaceRuntimeServices)
      .leftJoin(projects, eq(workspaceRuntimeServices.projectId, projects.id))
      .leftJoin(agents, eq(workspaceRuntimeServices.ownerAgentId, agents.id))
      .where(
        and(
          eq(workspaceRuntimeServices.companyId, companyId),
          sql`(${workspaceRuntimeServices.healthStatus} = 'unhealthy' or ${workspaceRuntimeServices.status} in ('failed', 'error'))`,
        ),
      )
      .orderBy(desc(workspaceRuntimeServices.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    const serviceIncidents = serviceRows.map(({ service, project, agent }) => ({
      id: `runtime-service:${service.id}`,
      kind: "workspace_runtime_unhealthy" as const,
      severity: service.healthStatus === "unhealthy" ? "high" as const : "medium" as const,
      status: "needs_action" as const,
      title: `${service.serviceName} runtime is ${service.healthStatus === "unhealthy" ? "unhealthy" : service.status}`,
      summary: service.url ?? service.command ?? "A workspace runtime service needs operator attention.",
      recommendedAction: "Open the workspace/runtime details and restart or repair the service.",
      sourceType: "workspace_runtime_service",
      sourceId: service.id,
      issue: service.issueId ? ref(service.issueId, service.issueId.slice(0, 8)) : null,
      run: service.startedByRunId ? ref(service.startedByRunId, service.startedByRunId.slice(0, 8)) : null,
      agent: agent?.id ? ref(agent.id, agent.name, { title: agent.title ?? agent.role, status: agent.status }) : null,
      project: project?.id ? ref(project.id, project.name, { status: project.status }) : null,
      plugin: null,
      workspace: service.executionWorkspaceId ? ref(service.executionWorkspaceId, service.serviceName, { status: service.status }) : null,
      actions: ["open_workspace"] as OpsIncidentAction[],
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    const operationRows = await db
      .select({
        operation: workspaceOperations,
        workspace: {
          id: executionWorkspaces.id,
          name: executionWorkspaces.name,
          status: executionWorkspaces.status,
          projectId: executionWorkspaces.projectId,
        },
        project: {
          id: projects.id,
          name: projects.name,
          status: projects.status,
        },
      })
      .from(workspaceOperations)
      .leftJoin(executionWorkspaces, eq(workspaceOperations.executionWorkspaceId, executionWorkspaces.id))
      .leftJoin(projects, eq(executionWorkspaces.projectId, projects.id))
      .where(and(eq(workspaceOperations.companyId, companyId), eq(workspaceOperations.status, "failed")))
      .orderBy(desc(workspaceOperations.updatedAt))
      .limit(SOURCE_QUERY_LIMIT);

    const operationIncidents = operationRows.map(({ operation, workspace, project }) => ({
      id: `workspace-operation:${operation.id}`,
      kind: "workspace_runtime_unhealthy" as const,
      severity: "medium" as const,
      status: "needs_action" as const,
      title: `Workspace operation failed: ${operation.phase}`,
      summary: operation.stderrExcerpt ?? operation.stdoutExcerpt ?? operation.command ?? "A workspace operation failed.",
      recommendedAction: "Open the workspace operation logs and repair the workspace if needed.",
      sourceType: "workspace_operation",
      sourceId: operation.id,
      issue: null,
      run: operation.heartbeatRunId ? ref(operation.heartbeatRunId, operation.heartbeatRunId.slice(0, 8)) : null,
      agent: null,
      project: project?.id ? ref(project.id, project.name, { status: project.status }) : null,
      plugin: null,
      workspace: workspace?.id ? ref(workspace.id, workspace.name, { status: workspace.status }) : null,
      actions: workspace?.id ? ["open_workspace"] as OpsIncidentAction[] : [],
      createdAt: operation.createdAt,
      updatedAt: operation.updatedAt,
    }));

    return [...serviceIncidents, ...operationIncidents];
  }

  return {
    summary: async (companyId: string, filters: OpsIncidentFilters = {}): Promise<OpsIncidentSummary> => {
      await assertCompanyExists(companyId);
      const budgetOverview = await budgetService(db).overview(companyId);
      const allItems = [
        ...(await failedRunIncidents(companyId)),
        ...(await recoveryIssueIncidents(companyId)),
        ...budgetOverview.activeIncidents.map(budgetIncidentToItem),
        ...(await agentErrorIncidents(companyId)),
        ...(await pluginFailureIncidents(companyId)),
        ...(await workspaceIncidents(companyId)),
      ];
      const filtered = sortIncidents(applyFilters(allItems, filters));
      const limit = filters.limit ?? DEFAULT_LIMIT;
      const offset = filters.offset ?? 0;
      const items = filtered.slice(offset, offset + limit);

      return {
        companyId,
        total: filtered.length,
        critical: filtered.filter((item) => item.severity === "critical").length,
        needsAction: filtered.filter((item) => item.status === "needs_action").length,
        recovering: filtered.filter((item) => item.status === "recovering").length,
        monitoring: filtered.filter((item) => item.status === "monitoring").length,
        byKind: countValues(filtered, "kind"),
        bySeverity: countValues(filtered, "severity"),
        byStatus: countValues(filtered, "status"),
        items,
      };
    },
  };
}
