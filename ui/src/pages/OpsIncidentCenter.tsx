import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OpsIncidentFilters,
  OpsIncidentItem,
  OpsIncidentKind,
  OpsIncidentSeverity,
  OpsIncidentStatus,
} from "@kesarcloud/shared";
import { agentsApi } from "../api/agents";
import { budgetsApi } from "../api/budgets";
import { heartbeatsApi } from "../api/heartbeats";
import { issuesApi } from "../api/issues";
import { opsIncidentsApi } from "../api/opsIncidents";
import { projectsApi } from "../api/projects";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useCompany } from "../context/CompanyContext";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import { cn, formatDateTime } from "../lib/utils";
import { EmptyState } from "../components/EmptyState";
import { MetricCard } from "../components/MetricCard";
import { PageSkeleton } from "../components/PageSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  AlertTriangle,
  Bot,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  HeartPulse,
  PackageOpen,
  RefreshCw,
  Search,
  ShieldAlert,
  WalletCards,
  Wrench,
} from "lucide-react";

const INCIDENT_KINDS = [
  "failed_run",
  "stuck_or_silent_run",
  "recovery_issue",
  "budget_incident",
  "plugin_failure",
  "workspace_runtime_unhealthy",
  "agent_error",
] as const satisfies readonly OpsIncidentKind[];

const SEVERITIES = ["critical", "high", "medium", "low"] as const satisfies readonly OpsIncidentSeverity[];
const STATUSES = ["needs_action", "recovering", "monitoring", "resolved"] as const satisfies readonly OpsIncidentStatus[];
const PAGE_SIZE = 20;

const KIND_ICONS: Record<OpsIncidentKind, typeof ShieldAlert> = {
  failed_run: AlertTriangle,
  stuck_or_silent_run: HeartPulse,
  recovery_issue: Wrench,
  budget_incident: WalletCards,
  plugin_failure: PackageOpen,
  workspace_runtime_unhealthy: Activity,
  agent_error: Bot,
};

function label(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactCount(items: Array<{ key: string; count: number }>): string {
  if (items.length === 0) return "No active incidents";
  return items
    .slice(0, 3)
    .map((item) => `${label(item.key)} ${item.count}`)
    .join(" · ");
}

function severityTone(severity: OpsIncidentSeverity): "default" | "secondary" | "destructive" | "outline" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "medium") return "secondary";
  return "outline";
}

function issueHref(item: OpsIncidentItem) {
  return item.issue ? `/issues/${encodeURIComponent(item.issue.id)}` : null;
}

function runHref(item: OpsIncidentItem) {
  if (!item.run) return null;
  return item.agent
    ? `/agents/${encodeURIComponent(item.agent.id)}/runs/${encodeURIComponent(item.run.id)}`
    : `/agents/all`;
}

function agentHref(item: OpsIncidentItem) {
  return item.agent ? `/agents/${encodeURIComponent(item.agent.id)}` : null;
}

function projectHref(item: OpsIncidentItem) {
  return item.project ? `/projects/${encodeURIComponent(item.project.id)}` : null;
}

function workspaceHref(item: OpsIncidentItem) {
  return item.workspace ? `/execution-workspaces/${encodeURIComponent(item.workspace.id)}` : null;
}

function pluginHref(item: OpsIncidentItem) {
  return item.plugin ? `/plugins/${encodeURIComponent(item.plugin.id)}` : null;
}

function OpsIncidentRow({
  item,
  onBudgetKeepPaused,
  onWatchdogContinue,
  onForceRelease,
  busy,
}: {
  item: OpsIncidentItem;
  onBudgetKeepPaused: (item: OpsIncidentItem) => void;
  onWatchdogContinue: (item: OpsIncidentItem) => void;
  onForceRelease: (item: OpsIncidentItem) => void;
  busy: boolean;
}) {
  const Icon = KIND_ICONS[item.kind] ?? ShieldAlert;
  const links = [
    item.issue ? { label: item.issue.label, href: issueHref(item), title: item.issue.title ?? "Issue" } : null,
    item.run ? { label: item.run.label, href: runHref(item), title: "Run" } : null,
    item.agent ? { label: item.agent.label, href: agentHref(item), title: item.agent.title ?? "Agent" } : null,
    item.project ? { label: item.project.label, href: projectHref(item), title: "Project" } : null,
    item.workspace ? { label: item.workspace.label, href: workspaceHref(item), title: "Workspace" } : null,
    item.plugin ? { label: item.plugin.label, href: pluginHref(item), title: "Plugin" } : null,
  ].filter((link): link is { label: string; href: string | null; title: string } => !!link && !!link.href);

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Icon className="h-3 w-3" />
              {label(item.kind)}
            </Badge>
            <Badge variant={severityTone(item.severity)}>{label(item.severity)}</Badge>
            <StatusBadge status={item.status} />
          </div>

          <div className="mt-2 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
            {item.summary ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.summary}</p>
            ) : null}
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.recommendedAction}</p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {links.map((link) => (
              <Link key={`${link.title}-${link.href}`} to={link.href!} className="hover:text-foreground hover:underline">
                <span className="text-muted-foreground/70">{link.title}</span>{" "}
                <span className="font-mono">{link.label}</span>
              </Link>
            ))}
            <span>Updated {formatDateTime(item.updatedAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:max-w-sm xl:justify-end xl:pt-1">
          {issueHref(item) ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to={issueHref(item)!}>Issue</Link>
            </Button>
          ) : null}
          {runHref(item) ? (
            <Button variant="outline" size="sm" asChild>
              <Link to={runHref(item)!}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Run
              </Link>
            </Button>
          ) : null}
          {item.actions.includes("open_costs") ? (
            <Button variant="outline" size="sm" asChild>
              <Link to="/costs">Costs</Link>
            </Button>
          ) : null}
          {item.actions.includes("resolve_budget") ? (
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => onBudgetKeepPaused(item)}>
              Keep Paused
            </Button>
          ) : null}
          {item.actions.includes("record_watchdog_decision") && item.run ? (
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => onWatchdogContinue(item)}>
              Continue
            </Button>
          ) : null}
          {item.actions.includes("force_release_issue") && item.issue ? (
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => onForceRelease(item)}>
              Release
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function OpsIncidentCenter() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToastActions();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [agentId, setAgentId] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setBreadcrumbs([{ label: "Ops" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    setPage(1);
  }, [agentId, kind, projectId, q, severity, status]);

  const filters = useMemo<OpsIncidentFilters>(() => ({
    kind: kind === "all" ? undefined : kind as OpsIncidentKind,
    severity: severity === "all" ? undefined : severity as OpsIncidentSeverity,
    status: status === "all" ? undefined : status as OpsIncidentStatus,
    projectId: projectId === "all" ? undefined : projectId,
    agentId: agentId === "all" ? undefined : agentId,
    q: q.trim() || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  }), [agentId, kind, page, projectId, q, severity, status]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.opsIncidents.list(selectedCompanyId!, filters as unknown as Record<string, unknown>),
    queryFn: () => opsIncidentsApi.summary(selectedCompanyId!, filters),
    enabled: !!selectedCompanyId,
    refetchInterval: 30_000,
  });

  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: agents } = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId!),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const invalidateOps = () => {
    if (!selectedCompanyId) return;
    void queryClient.invalidateQueries({ queryKey: ["ops-incidents", selectedCompanyId] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.sidebarBadges(selectedCompanyId) });
  };

  const budgetMutation = useMutation({
    mutationFn: (item: OpsIncidentItem) => budgetsApi.resolveIncident(selectedCompanyId!, item.sourceId, {
      action: "keep_paused",
      decisionNote: "Acknowledged from Ops Incident Center.",
    }),
    onSuccess: () => {
      invalidateOps();
      pushToast({ tone: "success", title: "Budget incident acknowledged" });
    },
    onError: (err) => pushToast({ tone: "error", title: "Could not update budget incident", body: String(err) }),
  });

  const watchdogMutation = useMutation({
    mutationFn: (item: OpsIncidentItem) => heartbeatsApi.recordWatchdogDecision({
      runId: item.run!.id,
      evaluationIssueId: item.issue?.id ?? null,
      decision: "continue",
      reason: "Continue requested from Ops Incident Center.",
    }),
    onSuccess: () => {
      invalidateOps();
      pushToast({ tone: "success", title: "Continuation recorded" });
    },
    onError: (err) => pushToast({ tone: "error", title: "Could not continue run", body: String(err) }),
  });

  const releaseMutation = useMutation({
    mutationFn: (item: OpsIncidentItem) => issuesApi.adminForceRelease(item.issue!.id),
    onSuccess: () => {
      invalidateOps();
      pushToast({ tone: "success", title: "Issue lock released" });
    },
    onError: (err) => pushToast({ tone: "error", title: "Could not release issue", body: String(err) }),
  });

  const visibleProjects = useMemo(
    () => (projects ?? []).filter((project) => !project.archivedAt),
    [projects],
  );
  const visibleAgents = useMemo(
    () => (agents ?? []).filter((agent) => agent.status !== "terminated"),
    [agents],
  );
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalItems);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (!selectedCompanyId) {
    return <EmptyState icon={ShieldAlert} message="Select a company to view operations." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  const items = data?.items ?? [];
  const actionBusy = budgetMutation.isPending || watchdogMutation.isPending || releaseMutation.isPending;

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <MetricCard
          icon={ShieldAlert}
          value={data?.critical ?? 0}
          label="Critical"
          description={compactCount(data?.bySeverity ?? [])}
        />
        <MetricCard
          icon={AlertTriangle}
          value={data?.needsAction ?? 0}
          label="Needs Action"
          description={compactCount(data?.byKind ?? [])}
        />
        <MetricCard
          icon={RefreshCw}
          value={data?.recovering ?? 0}
          label="Recovering"
          description={compactCount(data?.byStatus ?? [])}
        />
        <MetricCard
          icon={Activity}
          value={data?.total ?? 0}
          label="Total"
          description={compactCount(data?.byKind ?? [])}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 xl:flex-row xl:items-center">
        <div className="relative xl:max-w-xs xl:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search incidents"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 xl:flex xl:flex-1">
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="w-full xl:w-[190px]" size="sm">
              <SelectValue placeholder="Kind" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {INCIDENT_KINDS.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-full xl:w-[130px]" size="sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              {SEVERITIES.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full xl:w-[150px]" size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full xl:w-[180px]" size="sm">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {visibleProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={agentId} onValueChange={setAgentId}>
            <SelectTrigger className="w-full xl:w-[180px]" size="sm">
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All agents</SelectItem>
              {visibleAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={ShieldAlert} message="No active operations incidents." />
      ) : (
        <>
          <div className={cn("grid gap-3", error ? "opacity-70" : undefined)}>
            {items.map((item) => (
              <OpsIncidentRow
                key={item.id}
                item={item}
                busy={actionBusy}
                onBudgetKeepPaused={(target) => budgetMutation.mutate(target)}
                onWatchdogContinue={(target) => watchdogMutation.mutate(target)}
                onForceRelease={(target) => releaseMutation.mutate(target)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {pageStart}-{pageEnd} of {totalItems} incidents
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Previous
              </Button>
              <span className="min-w-16 text-center text-xs text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
                <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
