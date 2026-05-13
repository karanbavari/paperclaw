import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import type {
  IssueWorkProductReviewState,
  IssueWorkProductStatus,
  IssueWorkProductType,
  OutcomeCenterItem,
} from "@kesarcloud/shared";
import { outcomesApi } from "../api/outcomes";
import { projectsApi } from "../api/projects";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { cn, formatDateTime, issueUrl, projectUrl } from "../lib/utils";
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
  AlertTriangle,
  ExternalLink,
  Eye,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const OUTCOME_TYPES = [
  "preview_url",
  "runtime_service",
  "pull_request",
  "branch",
  "commit",
  "artifact",
  "document",
] as const;

const OUTCOME_STATUSES = [
  "active",
  "ready_for_review",
  "approved",
  "changes_requested",
  "merged",
  "closed",
  "failed",
  "archived",
  "draft",
] as const;

const REVIEW_STATES = [
  "none",
  "needs_board_review",
  "approved",
  "changes_requested",
] as const;

const TYPE_ICONS: Record<IssueWorkProductType, typeof PackageCheck> = {
  preview_url: Eye,
  runtime_service: Eye,
  pull_request: GitPullRequest,
  branch: GitBranch,
  commit: GitCommit,
  artifact: PackageCheck,
  document: FileText,
};

function label(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function compactCount(items: Array<{ key: string; count: number }>): string {
  if (items.length === 0) return "No outcomes yet";
  return items
    .slice(0, 3)
    .map((item) => `${label(item.key)} ${item.count}`)
    .join(" · ");
}

function healthTone(healthStatus: string): "default" | "secondary" | "destructive" | "outline" {
  if (healthStatus === "healthy") return "secondary";
  if (healthStatus === "unhealthy") return "destructive";
  return "outline";
}

function OutcomeRow({ item }: { item: OutcomeCenterItem }) {
  const { workProduct, issue, project } = item;
  const Icon = TYPE_ICONS[workProduct.type] ?? PackageCheck;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Icon className="h-3 w-3" />
              {label(workProduct.type)}
            </Badge>
            <StatusBadge status={workProduct.status} />
            {workProduct.reviewState !== "none" ? (
              <Badge variant={workProduct.reviewState === "needs_board_review" ? "secondary" : "outline"}>
                {label(workProduct.reviewState)}
              </Badge>
            ) : null}
            <Badge variant={healthTone(workProduct.healthStatus)}>
              {label(workProduct.healthStatus)}
            </Badge>
          </div>

          <div className="mt-2 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {workProduct.title}
            </p>
            {workProduct.summary ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {workProduct.summary}
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <Link to={issueUrl(issue)} className="font-mono hover:text-foreground hover:underline">
              {issue.identifier ?? issue.id.slice(0, 8)}
            </Link>
            <span className="min-w-0 max-w-full truncate">{issue.title}</span>
            {project ? (
              <>
                <span className="hidden sm:inline">·</span>
                <Link to={projectUrl(project)} className="hover:text-foreground hover:underline">
                  {project.name}
                </Link>
              </>
            ) : null}
            <span className="hidden sm:inline">·</span>
            <span>Updated {formatDateTime(workProduct.updatedAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:pt-1">
          {workProduct.url ? (
            <Button variant="outline" size="sm" asChild>
              <a href={workProduct.url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Open
              </a>
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" asChild>
            <Link to={issueUrl(issue)}>Issue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function OutcomeCenter() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [reviewState, setReviewState] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    setBreadcrumbs([{ label: "Outcomes" }]);
  }, [setBreadcrumbs]);

  const filters = useMemo(() => ({
    type: type === "all" ? undefined : type as IssueWorkProductType,
    status: status === "all" ? undefined : status as IssueWorkProductStatus,
    reviewState: reviewState === "all" ? undefined : reviewState as IssueWorkProductReviewState,
    projectId: projectId === "all" ? undefined : projectId,
    q: q.trim() || undefined,
    limit: 100,
  }), [projectId, q, reviewState, status, type]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.outcomes.list(selectedCompanyId!, filters),
    queryFn: () => outcomesApi.summary(selectedCompanyId!, filters),
    enabled: !!selectedCompanyId,
  });

  const { data: projects } = useQuery({
    queryKey: queryKeys.projects.list(selectedCompanyId!),
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const visibleProjects = useMemo(
    () => (projects ?? []).filter((project) => !project.archivedAt),
    [projects],
  );

  if (!selectedCompanyId) {
    return <EmptyState icon={PackageCheck} message="Select a company to view outcomes." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      {error && <p className="text-sm text-destructive">{error.message}</p>}

      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <MetricCard
          icon={PackageCheck}
          value={data?.total ?? 0}
          label="Outcomes"
          description={compactCount(data?.byType ?? [])}
        />
        <MetricCard
          icon={ShieldCheck}
          value={data?.needsReview ?? 0}
          label="Needs Review"
          description={compactCount(data?.byReviewState ?? [])}
        />
        <MetricCard
          icon={Sparkles}
          value={data?.healthy ?? 0}
          label="Healthy"
          description={compactCount(data?.byHealthStatus ?? [])}
        />
        <MetricCard
          icon={AlertTriangle}
          value={data?.failedOrUnhealthy ?? 0}
          label="Failed / Unhealthy"
          description={compactCount(data?.byStatus ?? [])}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 lg:flex-row lg:items-center">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search outcomes"
          className="lg:max-w-xs"
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:flex-1">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full lg:w-[150px]" size="sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {OUTCOME_TYPES.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full lg:w-[160px]" size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {OUTCOME_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reviewState} onValueChange={setReviewState}>
            <SelectTrigger className="w-full lg:w-[170px]" size="sm">
              <SelectValue placeholder="Review" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All reviews</SelectItem>
              {REVIEW_STATES.map((value) => (
                <SelectItem key={value} value={value}>{label(value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full lg:w-[190px]" size="sm">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {visibleProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={PackageCheck}
          message="No outcomes yet. Work products created from issues will appear here."
        />
      ) : (
        <div className={cn("grid gap-3", error ? "opacity-70" : undefined)}>
          {items.map((item) => (
            <OutcomeRow key={item.workProduct.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
