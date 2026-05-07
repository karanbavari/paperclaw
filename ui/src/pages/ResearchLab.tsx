import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Agent,
  ExecutionWorkspace,
  Project,
  ResearchLabDetail,
  ResearchLabListItem,
  ResearchLabType,
} from "@kesarcloud/shared";
import {
  Archive,
  ExternalLink,
  FlaskConical,
  Loader2,
  Microscope,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "@/lib/router";
import { AgentIcon } from "@/components/AgentIconPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { agentsApi } from "../api/agents";
import { executionWorkspacesApi } from "../api/execution-workspaces";
import { projectsApi } from "../api/projects";
import { researchLabsApi } from "../api/researchLabs";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useCompany } from "../context/CompanyContext";
import { useToastActions } from "../context/ToastContext";
import { queryKeys } from "../lib/queryKeys";
import { cn, formatDateTime, relativeTime } from "../lib/utils";

const LAB_TYPES: Array<{ value: ResearchLabType; label: string }> = [
  { value: "research", label: "Research" },
  { value: "prototype", label: "Prototype" },
  { value: "experiment", label: "Experiment" },
  { value: "business_case", label: "Business Case" },
];

const NONE_VALUE = "__none__";

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function statusClass(status: string) {
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected" || status === "trashed") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "board_review" || status === "ceo_review") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "researching" || status === "prototype_running") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-border bg-muted text-muted-foreground";
}

function activeAgents(agents: Agent[]) {
  return agents.filter((agent) => agent.status !== "terminated" && agent.status !== "pending_approval");
}

function LabListItem({
  lab,
  active,
}: {
  lab: ResearchLabListItem;
  active: boolean;
}) {
  return (
    <Link
      to={`/research-labs/${lab.id}`}
      className={cn(
        "block border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-accent/40",
        active && "bg-accent text-foreground",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{lab.title}</div>
          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{lab.objective}</div>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", statusClass(lab.status))}>
          {label(lab.status)}
        </Badge>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>{label(lab.labType)}</span>
        <span>{relativeTime(lab.updatedAt)}</span>
      </div>
    </Link>
  );
}

function NewLabDialog({
  open,
  agents,
  projects,
  workspaces,
  creating,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  agents: Agent[];
  projects: Project[];
  workspaces: ExecutionWorkspace[];
  creating: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: {
    title: string;
    objective: string;
    labType: ResearchLabType;
    projectId: string | null;
    executionWorkspaceId: string | null;
    allowedAgentIds: string[];
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [labType, setLabType] = useState<ResearchLabType>("research");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [agentIds, setAgentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setObjective("");
    setLabType("research");
    setProjectId(null);
    setWorkspaceId(null);
    setAgentIds([]);
  }, [open]);

  function toggleAgent(agentId: string, checked: boolean) {
    setAgentIds((current) =>
      checked ? Array.from(new Set([...current, agentId])) : current.filter((id) => id !== agentId),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Research Lab</DialogTitle>
          <DialogDescription>
            Create an isolated R&D space for research, prototypes, demos, and board-ready reports.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Input
            placeholder="Lab title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            placeholder="Objective, constraints, expected output"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            className="min-h-28"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <Select value={labType} onValueChange={(value) => setLabType(value as ResearchLabType)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {LAB_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectId ?? NONE_VALUE} onValueChange={(value) => setProjectId(value === NONE_VALUE ? null : value)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={workspaceId ?? NONE_VALUE} onValueChange={(value) => setWorkspaceId(value === NONE_VALUE ? null : value)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Workspace" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>No workspace</SelectItem>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>{workspace.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-border">
            <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
              Agents with lab access
            </div>
            <div className="max-h-56 overflow-y-auto">
              {agents.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">No active agents available.</div>
              ) : (
                agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-accent/40"
                  >
                    <Checkbox
                      checked={agentIds.includes(agent.id)}
                      onCheckedChange={(checked) => toggleAgent(agent.id, checked === true)}
                    />
                    <AgentIcon icon={agent.icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">{agent.name}</span>
                    <span className="text-xs text-muted-foreground">{agent.title ?? label(agent.role)}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={creating || !title.trim() || !objective.trim()}
            onClick={() =>
              onCreate({
                title,
                objective,
                labType,
                projectId,
                executionWorkspaceId: workspaceId,
                allowedAgentIds: agentIds,
              })
            }
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LabDetailPanel({
  lab,
  agents,
  projects,
  workspaces,
  saving,
  actionPending,
  onSave,
  onSubmitCeo,
  onSubmitBoard,
  onArchive,
  onTrash,
}: {
  lab: ResearchLabDetail;
  agents: Agent[];
  projects: Project[];
  workspaces: ExecutionWorkspace[];
  saving: boolean;
  actionPending: boolean;
  onSave: (input: {
    title: string;
    objective: string;
    labType: ResearchLabType;
    projectId: string | null;
    executionWorkspaceId: string | null;
    allowedAgentIds: string[];
    demoUrls: string[];
    finalReport: string | null;
  }) => void;
  onSubmitCeo: () => void;
  onSubmitBoard: () => void;
  onArchive: () => void;
  onTrash: () => void;
}) {
  const [title, setTitle] = useState(lab.title);
  const [objective, setObjective] = useState(lab.objective);
  const [labType, setLabType] = useState<ResearchLabType>(lab.labType);
  const [projectId, setProjectId] = useState<string | null>(lab.projectId);
  const [workspaceId, setWorkspaceId] = useState<string | null>(lab.executionWorkspaceId);
  const [agentIds, setAgentIds] = useState<string[]>(lab.allowedAgentIds);
  const [demoUrlsText, setDemoUrlsText] = useState(lab.demoUrls.join("\n"));
  const [finalReport, setFinalReport] = useState(lab.finalReport ?? "");

  useEffect(() => {
    setTitle(lab.title);
    setObjective(lab.objective);
    setLabType(lab.labType);
    setProjectId(lab.projectId);
    setWorkspaceId(lab.executionWorkspaceId);
    setAgentIds(lab.allowedAgentIds);
    setDemoUrlsText(lab.demoUrls.join("\n"));
    setFinalReport(lab.finalReport ?? "");
  }, [lab]);

  function toggleAgent(agentId: string, checked: boolean) {
    setAgentIds((current) =>
      checked ? Array.from(new Set([...current, agentId])) : current.filter((id) => id !== agentId),
    );
  }

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === workspaceId) ?? null;
  const demoUrls = demoUrlsText.split("\n").map((item) => item.trim()).filter(Boolean);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Microscope className="h-4 w-4 text-muted-foreground" />
              <h1 className="truncate text-lg font-semibold">{lab.title}</h1>
              <Badge variant="outline" className={cn(statusClass(lab.status))}>{label(lab.status)}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Updated {formatDateTime(lab.updatedAt)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onSubmitCeo} disabled={actionPending}>
              <Send className="h-4 w-4" />
              CEO Review
            </Button>
            <Button onClick={onSubmitBoard} disabled={actionPending || !finalReport.trim()}>
              <Send className="h-4 w-4" />
              Board Review
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            <Textarea
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              className="min-h-28"
            />
            <div className="grid gap-3 md:grid-cols-3">
              <Select value={labType} onValueChange={(value) => setLabType(value as ResearchLabType)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LAB_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectId ?? NONE_VALUE} onValueChange={(value) => setProjectId(value === NONE_VALUE ? null : value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>No project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={workspaceId ?? NONE_VALUE} onValueChange={(value) => setWorkspaceId(value === NONE_VALUE ? null : value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Workspace" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>No workspace</SelectItem>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>{workspace.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Demo URLs</div>
              <Textarea
                value={demoUrlsText}
                onChange={(event) => setDemoUrlsText(event.target.value)}
                placeholder="https://localhost:3101"
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Final report for CEO and Board</div>
              <Textarea
                value={finalReport}
                onChange={(event) => setFinalReport(event.target.value)}
                placeholder="Summary, evidence, demo links, risks, next recommended action..."
                className="min-h-72 font-mono text-sm"
              />
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={onArchive} disabled={actionPending}>
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
                <Button variant="outline" onClick={onTrash} disabled={actionPending}>
                  <Trash2 className="h-4 w-4" />
                  Trash
                </Button>
              </div>
              <Button
                disabled={saving || !title.trim() || !objective.trim()}
                onClick={() =>
                  onSave({
                    title,
                    objective,
                    labType,
                    projectId,
                    executionWorkspaceId: workspaceId,
                    allowedAgentIds: agentIds,
                    demoUrls,
                    finalReport: finalReport.trim() ? finalReport.trim() : null,
                  })
                }
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-md border border-border">
              <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                Lab Access
              </div>
              <div className="max-h-72 overflow-y-auto">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-accent/40"
                  >
                    <Checkbox
                      checked={agentIds.includes(agent.id)}
                      onCheckedChange={(checked) => toggleAgent(agent.id, checked === true)}
                    />
                    <AgentIcon icon={agent.icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-sm">{agent.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground">Runtime</div>
              {selectedWorkspace ? (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="font-medium">{selectedWorkspace.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedWorkspace.cwd ?? "Adapter managed workspace"}</div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">No isolated workspace linked.</div>
              )}
              {lab.runtimeServices.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {lab.runtimeServices.map((service) => (
                    <div key={service.id} className="rounded-md bg-muted px-3 py-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{service.serviceName}</span>
                        <span className="text-muted-foreground">{service.status}</span>
                      </div>
                      {service.url ? (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-primary"
                        >
                          {service.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-md border border-border p-3">
              <div className="text-xs font-medium text-muted-foreground">Board Approval</div>
              {lab.boardApproval ? (
                <Link to={`/approvals/${lab.boardApproval.id}`} className="mt-2 inline-flex text-sm text-primary">
                  {label(lab.boardApproval.status)}
                </Link>
              ) : (
                <div className="mt-2 text-sm text-muted-foreground">Not submitted yet.</div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function ResearchLab() {
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { labId } = useParams<{ labId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToastActions();
  const [showNewLab, setShowNewLab] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: "Research Lab", href: "/research-labs" },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs]);

  const labsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.researchLabs.list(selectedCompanyId) : ["research-labs", "none"],
    queryFn: () => researchLabsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const agentsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.agents.list(selectedCompanyId) : ["agents", "none"],
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const projectsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.projects.list(selectedCompanyId) : ["projects", "none"],
    queryFn: () => projectsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });
  const workspacesQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.executionWorkspaces.list(selectedCompanyId, {}) : ["execution-workspaces", "none"],
    queryFn: () => executionWorkspacesApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const activeLabId = labId ?? labsQuery.data?.[0]?.id ?? null;
  const detailQuery = useQuery({
    queryKey: selectedCompanyId && activeLabId
      ? queryKeys.researchLabs.detail(selectedCompanyId, activeLabId)
      : ["research-labs", "detail", "none"],
    queryFn: () => researchLabsApi.get(selectedCompanyId!, activeLabId!),
    enabled: !!selectedCompanyId && !!activeLabId && !showNewLab,
  });

  const agents = useMemo(() => activeAgents(agentsQuery.data ?? []), [agentsQuery.data]);
  const projects = projectsQuery.data ?? [];
  const workspaces = workspacesQuery.data ?? [];

  async function invalidateLab(id?: string | null) {
    if (!selectedCompanyId) return;
    await queryClient.invalidateQueries({ queryKey: queryKeys.researchLabs.list(selectedCompanyId) });
    if (id) await queryClient.invalidateQueries({ queryKey: queryKeys.researchLabs.detail(selectedCompanyId, id) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list(selectedCompanyId) });
  }

  const createMutation = useMutation({
    mutationFn: (input: Parameters<typeof researchLabsApi.create>[1]) =>
      researchLabsApi.create(selectedCompanyId!, input),
    onSuccess: async (lab) => {
      setShowNewLab(false);
      await invalidateLab(lab.id);
      navigate(`/research-labs/${lab.id}`);
      pushToast({ title: "Research lab created", tone: "success" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (input: Parameters<typeof researchLabsApi.update>[2]) =>
      researchLabsApi.update(selectedCompanyId!, activeLabId!, input),
    onSuccess: async (lab) => {
      await invalidateLab(lab.id);
      pushToast({ title: "Research lab saved", tone: "success" });
    },
  });

  const ceoMutation = useMutation({
    mutationFn: () => researchLabsApi.submitToCeo(selectedCompanyId!, activeLabId!, {}),
    onSuccess: async (lab) => {
      await invalidateLab(lab.id);
      pushToast({ title: "Sent to CEO review", tone: "success" });
    },
  });

  const boardMutation = useMutation({
    mutationFn: () => researchLabsApi.submitToBoard(selectedCompanyId!, activeLabId!, {}),
    onSuccess: async (lab) => {
      await invalidateLab(lab.id);
      pushToast({ title: "Board approval requested", tone: "info" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => researchLabsApi.archive(selectedCompanyId!, activeLabId!, {}),
    onSuccess: async (lab) => {
      await invalidateLab(lab.id);
      pushToast({ title: "Research lab archived", tone: "success" });
    },
  });

  const trashMutation = useMutation({
    mutationFn: () => researchLabsApi.trash(selectedCompanyId!, activeLabId!, {}),
    onSuccess: async (lab) => {
      await invalidateLab(lab.id);
      pushToast({ title: "Research lab moved to trash", tone: "info" });
    },
  });

  if (!selectedCompanyId) {
    return <div className="p-6 text-sm text-muted-foreground">Select a company to open Research Lab.</div>;
  }

  const labs = labsQuery.data ?? [];
  const lab = detailQuery.data;
  const actionPending = ceoMutation.isPending || boardMutation.isPending || archiveMutation.isPending || trashMutation.isPending;

  return (
    <div className="flex h-full min-h-0 bg-background">
      <aside className="hidden w-80 shrink-0 border-r border-border md:flex md:flex-col">
        <div className="flex h-12 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            Research Lab
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowNewLab(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {labsQuery.isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading labs...</div>
          ) : labs.length ? (
            labs.map((item) => (
              <LabListItem key={item.id} lab={item} active={item.id === activeLabId && !showNewLab} />
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No research labs yet.</div>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {detailQuery.isLoading && activeLabId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading research lab...
          </div>
        ) : lab ? (
          <LabDetailPanel
            lab={lab}
            agents={agents}
            projects={projects}
            workspaces={workspaces}
            saving={saveMutation.isPending}
            actionPending={actionPending}
            onSave={(input) => saveMutation.mutate(input)}
            onSubmitCeo={() => ceoMutation.mutate()}
            onSubmitBoard={() => boardMutation.mutate()}
            onArchive={() => archiveMutation.mutate()}
            onTrash={() => trashMutation.mutate()}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-sm text-center">
              <Microscope className="mx-auto h-8 w-8 text-muted-foreground" />
              <h1 className="mt-3 text-lg font-semibold">Research Lab</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Start an isolated R&D workspace for competitor research, prototypes, tests, and board-ready reports.
              </p>
              <Button className="mt-4" onClick={() => setShowNewLab(true)}>
                <Plus className="h-4 w-4" />
                New Lab
              </Button>
            </div>
          </div>
        )}
      </main>

      <NewLabDialog
        open={showNewLab}
        agents={agents}
        projects={projects}
        workspaces={workspaces}
        creating={createMutation.isPending}
        onOpenChange={setShowNewLab}
        onCreate={(input) => createMutation.mutate({ ...input, demoUrls: [], artifacts: [] })}
      />
    </div>
  );
}
