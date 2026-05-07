import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronLeft, ChevronRight, Eye, Loader2, PackagePlus, Search, Store, Users } from "lucide-react";
import type { MarketplaceSkillAssignMode, MarketplaceSkillDetail, MarketplaceSkillListItem } from "@kesarcloud/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useCompany } from "../context/CompanyContext";
import { useToastActions } from "../context/ToastContext";
import { agentsApi } from "../api/agents";
import { marketplaceApi } from "../api/marketplace";
import { queryKeys } from "../lib/queryKeys";
import { cn } from "../lib/utils";

const ASSIGN_OPTIONS: Array<{ value: MarketplaceSkillAssignMode; label: string; description: string }> = [
  { value: "library_only", label: "Company library only", description: "Install now, assign later from Skills or Agent pages." },
  { value: "ceo", label: "CEO", description: "Install and attach to the CEO agent." },
  { value: "all_agents", label: "All active agents", description: "Attach to every active agent in this company." },
  { value: "selected_agents", label: "Selected agents", description: "Choose exactly which agents receive this skill." },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export function Marketplace() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToastActions();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);
  const [previewTarget, setPreviewTarget] = useState<MarketplaceSkillListItem | null>(null);
  const [installTarget, setInstallTarget] = useState<MarketplaceSkillListItem | null>(null);
  const [assignMode, setAssignMode] = useState<MarketplaceSkillAssignMode>("library_only");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    setBreadcrumbs([{ label: "Marketplace", href: "/marketplace" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, [category, pageSize, search]);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.marketplace.categories(selectedCompanyId ?? ""),
    queryFn: () => marketplaceApi.categories(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId),
  });

  const currentCursor = pageCursors[pageIndex] ?? null;
  const listQueryParams = useMemo(() => ({
    q: search.trim(),
    category: category ?? "",
    limit: pageSize,
    cursor: currentCursor,
  }), [category, currentCursor, pageSize, search]);

  const skillsQuery = useQuery({
    queryKey: queryKeys.marketplace.list(selectedCompanyId ?? "", listQueryParams),
    queryFn: () => marketplaceApi.list(selectedCompanyId!, listQueryParams),
    enabled: Boolean(selectedCompanyId),
  });

  const previewQuery = useQuery({
    queryKey: queryKeys.marketplace.detail(selectedCompanyId ?? "", previewTarget?.id ?? ""),
    queryFn: () => marketplaceApi.detail(selectedCompanyId!, previewTarget!.id),
    enabled: Boolean(selectedCompanyId && previewTarget),
  });

  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId ?? ""),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId),
  });

  const activeAgents = useMemo(
    () => (agentsQuery.data ?? []).filter((agent) => agent.status !== "terminated" && agent.status !== "pending_approval"),
    [agentsQuery.data],
  );

  const installMutation = useMutation({
    mutationFn: () => marketplaceApi.install(selectedCompanyId!, {
      skillId: installTarget!.id,
      assignMode,
      agentIds: assignMode === "selected_agents" ? selectedAgentIds : undefined,
    }),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.categories(selectedCompanyId!) }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", selectedCompanyId!, "list"] }),
        installTarget
          ? queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.detail(selectedCompanyId!, installTarget.id) })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: queryKeys.companySkills.list(selectedCompanyId!) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.approvals.list(selectedCompanyId!) }),
        ...result.assignedAgentIds.map((agentId) =>
          queryClient.invalidateQueries({ queryKey: queryKeys.agents.skills(agentId) }),
        ),
      ]);
      pushToast({
        title: result.approval ? "Approval requested" : "Skill installed",
        body: result.approval
          ? "Board approval is required before this skill is installed."
          : result.assignedAgentIds.length > 0
            ? `Assigned to ${result.assignedAgentIds.length} agent${result.assignedAgentIds.length === 1 ? "" : "s"}.`
            : "Added to the company skill library.",
        tone: result.approval ? "info" : "success",
      });
      closeInstall();
    },
    onError: (error) => {
      pushToast({
        title: "Install failed",
        body: error instanceof Error ? error.message : "Unable to install this marketplace skill.",
        tone: "error",
      });
    },
  });

  function closeInstall() {
    setInstallTarget(null);
    setAssignMode("library_only");
    setSelectedAgentIds([]);
  }

  function openInstall(skill: MarketplaceSkillListItem) {
    setInstallTarget(skill);
    setAssignMode(skill.installedSkillId ? "library_only" : "ceo");
    setSelectedAgentIds([]);
  }

  function openInstallFromPreview(skill: MarketplaceSkillListItem | MarketplaceSkillDetail) {
    setPreviewTarget(null);
    openInstall(skill);
  }

  function goToNextPage() {
    const nextCursor = skillsQuery.data?.nextCursor ?? null;
    if (!nextCursor) return;
    setPageCursors((current) => {
      const next = [...current];
      next[pageIndex + 1] = nextCursor;
      return next;
    });
    setPageIndex((current) => current + 1);
  }

  function toggleSelectedAgent(agentId: string, checked: boolean) {
    setSelectedAgentIds((current) =>
      checked ? Array.from(new Set([...current, agentId])) : current.filter((id) => id !== agentId),
    );
  }

  if (!selectedCompanyId) {
    return <div className="p-6 text-sm text-muted-foreground">Select a company to browse marketplace skills.</div>;
  }

  const categories = categoriesQuery.data ?? [];
  const skills = skillsQuery.data?.items ?? [];
  const selectedCategoryName = category
    ? categories.find((item) => item.slug === category)?.name ?? "Selected category"
    : "All categories";
  const previewSkill = previewQuery.data ?? previewTarget;
  const hasNextPage = Boolean(skillsQuery.data?.nextCursor);
  const isFetchingPage = skillsQuery.isFetching && !skillsQuery.isLoading;

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Browse remote OpenClaw skills and install only what your company needs.
            </p>
          </div>
          <Badge variant="outline">{skills.length} visible</Badge>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-11rem)] grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <div className="border-b border-border pb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Categories
          </div>
          <div className="mt-4 space-y-1">
            <button
              className={cn(
                "flex w-full items-center justify-between px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50",
                category === null && "bg-accent text-foreground",
              )}
              onClick={() => setCategory(null)}
            >
              <span>All categories</span>
              <span className="text-xs text-muted-foreground">{categories.reduce((total, item) => total + item.skillCount, 0)}</span>
            </button>
            {categories.map((item) => (
              <button
                key={item.slug}
                className={cn(
                  "flex w-full items-center justify-between px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50",
                  category === item.slug && "bg-accent text-foreground",
                )}
                onClick={() => setCategory(item.slug)}
              >
                <span className="truncate">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{item.skillCount}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="border-b border-border px-6 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-2 border border-input bg-background px-3">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search marketplace skills"
                  className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{selectedCategoryName}</Badge>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                >
                  <SelectTrigger size="sm" className="w-[132px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option} per page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                    disabled={pageIndex === 0 || skillsQuery.isLoading}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="min-w-16 text-center text-xs text-muted-foreground">Page {pageIndex + 1}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={goToNextPage}
                    disabled={!hasNextPage || skillsQuery.isLoading}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {skillsQuery.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading marketplace...</div>
          ) : skillsQuery.error ? (
            <div className="p-6 text-sm text-destructive">
              {skillsQuery.error instanceof Error ? skillsQuery.error.message : "Failed to load marketplace"}
            </div>
          ) : skills.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-2 p-6 text-center">
              <Store className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm font-medium">No skills found</div>
              <div className="max-w-sm text-sm text-muted-foreground">Try a different search or category.</div>
            </div>
          ) : (
            <div className={cn("grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", isFetchingPage && "opacity-70")}>
              {skills.map((skill) => (
                <article key={skill.id} className="flex min-h-64 flex-col border border-border bg-card p-4 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{skill.categoryName}</Badge>
                      {skill.installedSkillId ? (
                        <Badge variant="secondary"><Check className="h-3 w-3" /> Installed</Badge>
                      ) : null}
                    </div>
                    <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug">{skill.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {skill.description ?? skill.slug}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{skill.trustLevel.replace(/_/g, " ")}</span>
                      {skill.installSource ? <span>Package source available</span> : <span>Catalog fallback</span>}
                    </div>
                    {skill.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {skill.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {skill.tags.length > 4 ? (
                          <span className="px-1 py-0.5 text-xs text-muted-foreground">+{skill.tags.length - 4}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setPreviewTarget(skill)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button type="button" size="sm" variant={skill.installedSkillId ? "outline" : "default"} onClick={() => openInstall(skill)}>
                      <PackagePlus className="mr-2 h-4 w-4" />
                      {skill.installedSkillId ? "Assign" : "Install"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={Boolean(previewTarget)} onOpenChange={(open) => !open && setPreviewTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewSkill?.name ?? "Skill preview"}</DialogTitle>
            <DialogDescription>
              {previewSkill?.description ?? "Loading marketplace skill details..."}
            </DialogDescription>
          </DialogHeader>

          {previewQuery.isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview...
            </div>
          ) : previewQuery.error ? (
            <div className="py-6 text-sm text-destructive">
              {previewQuery.error instanceof Error ? previewQuery.error.message : "Failed to load skill preview"}
            </div>
          ) : previewSkill ? (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{previewSkill.categoryName}</Badge>
                <Badge variant="secondary">{previewSkill.trustLevel.replace(/_/g, " ")}</Badge>
                {previewSkill.installedSkillId ? (
                  <Badge variant="secondary"><Check className="h-3 w-3" /> Installed</Badge>
                ) : null}
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="border border-border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Source</div>
                  <div className="mt-1 break-words text-foreground">{previewSkill.sourceUrl ?? "Catalog fallback"}</div>
                </div>
                <div className="border border-border p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Install source</div>
                  <div className="mt-1 break-words text-foreground">{previewSkill.installSource ?? "Not packaged"}</div>
                </div>
              </div>
              {previewSkill.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {previewSkill.tags.map((tag) => (
                    <span key={tag} className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              {previewQuery.data?.installNotes ? (
                <section>
                  <h3 className="text-sm font-medium">Install notes</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{previewQuery.data.installNotes}</p>
                </section>
              ) : null}
              {previewQuery.data?.markdown ? (
                <section>
                  <h3 className="text-sm font-medium">Skill details</h3>
                  <div className="mt-2 max-h-72 overflow-y-auto border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    <pre className="whitespace-pre-wrap font-sans">{previewQuery.data.markdown}</pre>
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          <DialogFooter showCloseButton>
            <Button
              type="button"
              onClick={() => previewSkill && openInstallFromPreview(previewSkill)}
              disabled={!previewSkill || previewQuery.isLoading}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {previewSkill?.installedSkillId ? "Assign" : "Install"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(installTarget)} onOpenChange={(open) => !open && closeInstall()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{installTarget ? `Install ${installTarget.name}` : "Install skill"}</DialogTitle>
            <DialogDescription>
              Add this skill to the company library and optionally attach it to agents.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              {ASSIGN_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border border-border px-3 py-2 transition-colors hover:bg-accent/40",
                    assignMode === option.value && "border-foreground bg-accent/40",
                  )}
                >
                  <input
                    type="radio"
                    name="assignMode"
                    className="mt-1"
                    checked={assignMode === option.value}
                    onChange={() => setAssignMode(option.value)}
                  />
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>

            {assignMode === "selected_agents" && (
              <div className="max-h-56 overflow-y-auto border border-border">
                {activeAgents.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No active agents available.</div>
                ) : (
                  activeAgents.map((agent) => (
                    <label key={agent.id} className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(agent.id)}
                        onChange={(event) => toggleSelectedAgent(agent.id, event.target.checked)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{agent.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{agent.role} · {agent.adapterType}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter showCloseButton>
            <Button
              onClick={() => installMutation.mutate()}
              disabled={
                installMutation.isPending
                || !installTarget
                || (assignMode === "selected_agents" && selectedAgentIds.length === 0)
              }
            >
              {installMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
