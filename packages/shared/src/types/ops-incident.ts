export type OpsIncidentKind =
  | "failed_run"
  | "stuck_or_silent_run"
  | "recovery_issue"
  | "budget_incident"
  | "plugin_failure"
  | "workspace_runtime_unhealthy"
  | "agent_error";

export type OpsIncidentSeverity = "critical" | "high" | "medium" | "low";

export type OpsIncidentStatus =
  | "needs_action"
  | "recovering"
  | "monitoring"
  | "resolved";

export type OpsIncidentAction =
  | "open_issue"
  | "open_run"
  | "open_agent"
  | "open_costs"
  | "open_plugin"
  | "open_workspace"
  | "resolve_budget"
  | "record_watchdog_decision"
  | "force_release_issue";

export interface OpsIncidentRef {
  id: string;
  label: string;
  title?: string | null;
  status?: string | null;
}

export interface OpsIncidentItem {
  id: string;
  kind: OpsIncidentKind;
  severity: OpsIncidentSeverity;
  status: OpsIncidentStatus;
  title: string;
  summary: string | null;
  recommendedAction: string;
  sourceType: string;
  sourceId: string;
  issue: OpsIncidentRef | null;
  run: OpsIncidentRef | null;
  agent: OpsIncidentRef | null;
  project: OpsIncidentRef | null;
  plugin: OpsIncidentRef | null;
  workspace: OpsIncidentRef | null;
  actions: OpsIncidentAction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OpsIncidentKindCount {
  key: string;
  count: number;
}

export interface OpsIncidentSummary {
  companyId: string;
  total: number;
  critical: number;
  needsAction: number;
  recovering: number;
  monitoring: number;
  byKind: OpsIncidentKindCount[];
  bySeverity: OpsIncidentKindCount[];
  byStatus: OpsIncidentKindCount[];
  items: OpsIncidentItem[];
}

export interface OpsIncidentFilters {
  kind?: OpsIncidentKind;
  severity?: OpsIncidentSeverity;
  status?: OpsIncidentStatus;
  projectId?: string;
  agentId?: string;
  q?: string;
  limit?: number;
  offset?: number;
}
