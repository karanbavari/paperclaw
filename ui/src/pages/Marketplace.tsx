import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  PackagePlus,
  Plug,
  Search,
  Store,
  Users,
  Wrench,
} from "lucide-react";
import type {
  MarketplacePluginDetail,
  MarketplacePluginListItem,
  MarketplaceSkillAssignMode,
  MarketplaceSkillDetail,
  MarketplaceSkillListItem,
} from "@kesarcloud/shared";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useCompany } from "../context/CompanyContext";
import { useToastActions } from "../context/ToastContext";
import { agentsApi } from "../api/agents";
import { marketplaceApi } from "../api/marketplace";
import { queryKeys } from "../lib/queryKeys";
import { cn } from "../lib/utils";

type MarketplaceTab = "skills" | "plugins";

const ASSIGN_OPTIONS: Array<{ value: MarketplaceSkillAssignMode; label: string; description: string }> = [
  { value: "library_only", label: "Company library only", description: "Install now, assign later from Skills or Agent pages." },
  { value: "ceo", label: "CEO", description: "Install and attach to the CEO agent." },
  { value: "all_agents", label: "All active agents", description: "Attach to every active agent in this company." },
  { value: "selected_agents", label: "Selected agents", description: "Choose exactly which agents receive this skill." },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function capabilitySummary(plugin: MarketplacePluginListItem | MarketplacePluginDetail) {
  const parts = [
    plugin.toolCount ? `${plugin.toolCount} tools` : null,
    plugin.uiSlotCount ? `${plugin.uiSlotCount} UI slots` : null,
    plugin.jobCount ? `${plugin.jobCount} jobs` : null,
    plugin.webhookCount ? `${plugin.webhookCount} webhooks` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "No runtime surfaces";
}

export function Marketplace() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { pushToast } = useToastActions();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MarketplaceTab>("skills");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCursors, setPageCursors] = useState<Array<string | null>>([null]);
  const [previewSkillTarget, setPreviewSkillTarget] = useState<MarketplaceSkillListItem | null>(null);
  const [previewPluginTarget, setPreviewPluginTarget] = useState<MarketplacePluginListItem | null>(null);
  const [installSkillTarget, setInstallSkillTarget] = useState<MarketplaceSkillListItem | null>(null);
  const [installPluginTarget, setInstallPluginTarget] = useState<MarketplacePluginListItem | null>(null);
  const [assignMode, setAssignMode] = useState<MarketplaceSkillAssignMode>("library_only");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);

  useEffect(() => {
    setBreadcrumbs([{ label: "Marketplace", href: "/marketplace" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    setCategory(null);
    setPageIndex(0);
    setPageCursors([null]);
  }, [activeTab]);

  useEffect(() => {
    setPageIndex(0);
    setPageCursors([null]);
  }, [category, pageSize, search]);

  const currentCursor = pageCursors[pageIndex] ?? null;
  const listQueryParams = useMemo(() => ({
    q: search.trim(),
    category: category ?? "",
    limit: pageSize,
    cursor: currentCursor,
  }), [category, currentCursor, pageSize, search]);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.marketplace.categories(selectedCompanyId ?? ""),
    queryFn: () => marketplaceApi.categories(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId && activeTab === "skills"),
  });

  const pluginCategoriesQuery = useQuery({
    queryKey: queryKeys.marketplace.pluginCategories(selectedCompanyId ?? ""),
    queryFn: () => marketplaceApi.pluginCategories(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId && activeTab === "plugins"),
  });

  const skillsQuery = useQuery({
    queryKey: queryKeys.marketplace.list(selectedCompanyId ?? "", listQueryParams),
    queryFn: () => marketplaceApi.list(selectedCompanyId!, listQueryParams),
    enabled: Boolean(selectedCompanyId && activeTab === "skills"),
  });

  const pluginsQuery = useQuery({
    queryKey: queryKeys.marketplace.pluginList(selectedCompanyId ?? "", listQueryParams),
    queryFn: () => marketplaceApi.pluginList(selectedCompanyId!, listQueryParams),
    enabled: Boolean(selectedCompanyId && activeTab === "plugins"),
  });

  const previewSkillQuery = useQuery({
    queryKey: queryKeys.marketplace.detail(selectedCompanyId ?? "", previewSkillTarget?.id ?? ""),
    queryFn: () => marketplaceApi.detail(selectedCompanyId!, previewSkillTarget!.id),
    enabled: Boolean(selectedCompanyId && previewSkillTarget),
  });

  const previewPluginQuery = useQuery({
    queryKey: queryKeys.marketplace.pluginDetail(selectedCompanyId ?? "", previewPluginTarget?.id ?? ""),
    queryFn: () => marketplaceApi.pluginDetail(selectedCompanyId!, previewPluginTarget!.id),
    enabled: Boolean(selectedCompanyId && previewPluginTarget),
  });

  const agentsQuery = useQuery({
    queryKey: queryKeys.agents.list(selectedCompanyId ?? ""),
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: Boolean(selectedCompanyId && installSkillTarget),
  });

  const activeAgents = useMemo(
    () => (agentsQuery.data ?? []).filter((agent) => agent.status !== "terminated" && agent.status !== "pending_approval"),
    [agentsQuery.data],
  );

  const installSkillMutation = useMutation({
    mutationFn: () => marketplaceApi.install(selectedCompanyId!, {
      skillId: installSkillTarget!.id,
      assignMode,
      agentIds: assignMode === "selected_agents" ? selectedAgentIds : undefined,
    }),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.categories(selectedCompanyId!) }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", selectedCompanyId!, "list"] }),
        installSkillTarget
          ? queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.detail(selectedCompanyId!, installSkillTarget.id) })
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
      closeSkillInstall();
    },
    onError: (error) => {
      pushToast({
        title: "Install failed",
        body: error instanceof Error ? error.message : "Unable to install this marketplace skill.",
        tone: "error",
      });
    },
  });

  const installPluginMutation = useMutation({
    mutationFn: () => marketplaceApi.installPlugin(selectedCompanyId!, {
      pluginId: installPluginTarget!.id,
    }),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.pluginCategories(selectedCompanyId!) }),
        queryClient.invalidateQueries({ queryKey: ["marketplace", selectedCompanyId!, "plugins", "list"] }),
        installPluginTarget
          ? queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.pluginDetail(selectedCompanyId!, installPluginTarget.id) })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.uiContributions }),
      ]);
      pushToast({
        title: result.warnings.length > 0 ? "Plugin already installed" : "Plugin installed",
        body: result.warnings[0] ?? `${result.plugin.manifestJson.displayName} is ready.`,
        tone: result.warnings.length > 0 ? "info" : "success",
      });
      setInstallPluginTarget(null);
    },
    onError: (error) => {
      pushToast({
        title: "Plugin install failed",
        body: error instanceof Error ? error.message : "Unable to install this marketplace plugin.",
        tone: "error",
      });
    },
  });

  function closeSkillInstall() {
    setInstallSkillTarget(null);
    setAssignMode("library_only");
    setSelectedAgentIds([]);
  }

  function openSkillInstall(skill: MarketplaceSkillListItem | MarketplaceSkillDetail) {
    setInstallSkillTarget(skill);
    setAssignMode(skill.installedSkillId ? "library_only" : "ceo");
    setSelectedAgentIds([]);
  }

  function goToNextPage() {
    const nextCursor = activeTab === "skills" ? skillsQuery.data?.nextCursor : pluginsQuery.data?.nextCursor;
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
    return <div className="p-6 text-sm text-muted-foreground">Select a company to browse marketplace items.</div>;
  }

  const skillCategories = categoriesQuery.data ?? [];
  const pluginCategories = pluginCategoriesQuery.data ?? [];
  const categories = activeTab === "skills" ? skillCategories : pluginCategories;
  const categoryCount = (item: (typeof categories)[number]) =>
    "skillCount" in item ? item.skillCount : item.pluginCount;
  const totalCount = categories.reduce((total, item) => total + categoryCount(item), 0);
  const skills = skillsQuery.data?.items ?? [];
  const plugins = pluginsQuery.data?.items ?? [];
  const visibleCount = activeTab === "skills" ? skills.length : plugins.length;
  const selectedCategoryName = category
    ? categories.find((item) => item.slug === category)?.name ?? "Selected category"
    : "All categories";
  const previewSkill = previewSkillQuery.data ?? previewSkillTarget;
  const previewPlugin = previewPluginQuery.data ?? previewPluginTarget;
  const hasNextPage = Boolean(activeTab === "skills" ? skillsQuery.data?.nextCursor : pluginsQuery.data?.nextCursor);
  const activeListQuery = activeTab === "skills" ? skillsQuery : pluginsQuery;
  const isFetchingPage = activeListQuery.isFetching && !activeListQuery.isLoading;

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      <div className="border-b border-border px-6 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold">Marketplace</h1>
            <p className="text-sm text-muted-foreground">
              Install reusable skills and first-party plugins for this PaperClaw instance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MarketplaceTab)}>
              <TabsList>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="plugins">Plugins</TabsTrigger>
              </TabsList>
            </Tabs>
            <Badge variant="outline">{visibleCount} visible</Badge>
          </div>
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
              <span className="text-xs text-muted-foreground">{totalCount}</span>
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
                <span className="ml-2 text-xs text-muted-foreground">{categoryCount(item)}</span>
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
                  placeholder={activeTab === "skills" ? "Search marketplace skills" : "Search marketplace plugins"}
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
                    disabled={pageIndex === 0 || activeListQuery.isLoading}
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
                    disabled={!hasNextPage || activeListQuery.isLoading}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {activeListQuery.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading marketplace...</div>
          ) : activeListQuery.error ? (
            <div className="p-6 text-sm text-destructive">
              {activeListQuery.error instanceof Error ? activeListQuery.error.message : "Failed to load marketplace"}
            </div>
          ) : activeTab === "skills" && skills.length === 0 ? (
            <EmptyState label="No skills found" />
          ) : activeTab === "plugins" && plugins.length === 0 ? (
            <EmptyState label="No plugins found" />
          ) : activeTab === "skills" ? (
            <div className={cn("grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", isFetchingPage && "opacity-70")}>
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onPreview={() => setPreviewSkillTarget(skill)}
                  onInstall={() => openSkillInstall(skill)}
                />
              ))}
            </div>
          ) : (
            <div className={cn("grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", isFetchingPage && "opacity-70")}>
              {plugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onPreview={() => setPreviewPluginTarget(plugin)}
                  onInstall={() => setInstallPluginTarget(plugin)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Dialog open={Boolean(previewSkillTarget)} onOpenChange={(open) => !open && setPreviewSkillTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewSkill?.name ?? "Skill preview"}</DialogTitle>
            <DialogDescription>
              {previewSkill?.description ?? "Loading marketplace skill details..."}
            </DialogDescription>
          </DialogHeader>
          <SkillPreview skill={previewSkill} query={previewSkillQuery} />
          <DialogFooter showCloseButton>
            <Button
              type="button"
              onClick={() => previewSkill && openSkillInstall(previewSkill)}
              disabled={!previewSkill || previewSkillQuery.isLoading}
            >
              <PackagePlus className="mr-2 h-4 w-4" />
              {previewSkill?.installedSkillId ? "Assign" : "Install"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(previewPluginTarget)} onOpenChange={(open) => !open && setPreviewPluginTarget(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewPlugin?.name ?? "Plugin preview"}</DialogTitle>
            <DialogDescription>
              {previewPlugin?.description ?? "Loading marketplace plugin details..."}
            </DialogDescription>
          </DialogHeader>
          <PluginPreview plugin={previewPlugin} query={previewPluginQuery} />
          <DialogFooter showCloseButton>
            <Button
              type="button"
              onClick={() => previewPlugin && setInstallPluginTarget(previewPlugin)}
              disabled={!previewPlugin || previewPluginQuery.isLoading || Boolean(previewPlugin?.installedPluginId)}
            >
              <Plug className="mr-2 h-4 w-4" />
              {previewPlugin?.installedPluginId ? "Installed" : "Install"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(installSkillTarget)} onOpenChange={(open) => !open && closeSkillInstall()}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{installSkillTarget ? `Install ${installSkillTarget.name}` : "Install skill"}</DialogTitle>
            <DialogDescription>
              Add this skill to the company library and optionally attach it to agents.
            </DialogDescription>
          </DialogHeader>
          <SkillInstallOptions
            assignMode={assignMode}
            activeAgents={activeAgents}
            selectedAgentIds={selectedAgentIds}
            onAssignModeChange={setAssignMode}
            onToggleAgent={toggleSelectedAgent}
          />
          <DialogFooter showCloseButton>
            <Button
              onClick={() => installSkillMutation.mutate()}
              disabled={
                installSkillMutation.isPending
                || !installSkillTarget
                || (assignMode === "selected_agents" && selectedAgentIds.length === 0)
              }
            >
              {installSkillMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(installPluginTarget)} onOpenChange={(open) => !open && setInstallPluginTarget(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{installPluginTarget ? `Install ${installPluginTarget.name}` : "Install plugin"}</DialogTitle>
            <DialogDescription>
              Plugins are installed for this PaperClaw instance and can add tools, UI, jobs, webhooks, or host integrations.
            </DialogDescription>
          </DialogHeader>
          {installPluginTarget ? (
            <div className="space-y-3">
              <div className="border border-border p-3 text-sm">
                <div className="font-medium">{installPluginTarget.packageName}</div>
                <div className="mt-1 text-muted-foreground">{capabilitySummary(installPluginTarget)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                Instance admin access is required because plugin installation loads code on the host.
              </div>
            </div>
          ) : null}
          <DialogFooter showCloseButton>
            <Button
              onClick={() => installPluginMutation.mutate()}
              disabled={installPluginMutation.isPending || !installPluginTarget || Boolean(installPluginTarget.installedPluginId)}
            >
              {installPluginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plug className="mr-2 h-4 w-4" />}
              {installPluginTarget?.installedPluginId ? "Installed" : "Install"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-2 p-6 text-center">
      <Store className="h-8 w-8 text-muted-foreground" />
      <div className="text-sm font-medium">{label}</div>
      <div className="max-w-sm text-sm text-muted-foreground">Try a different search or category.</div>
    </div>
  );
}

function SkillCard({ skill, onPreview, onInstall }: {
  skill: MarketplaceSkillListItem;
  onPreview: () => void;
  onInstall: () => void;
}) {
  return (
    <article className="flex min-h-64 flex-col border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{skill.categoryName}</Badge>
          {skill.installedSkillId ? (
            <Badge variant="secondary"><Check className="h-3 w-3" /> Installed</Badge>
          ) : null}
        </div>
        <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug">{skill.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{skill.description ?? skill.slug}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{skill.trustLevel.replace(/_/g, " ")}</span>
          {skill.installSource ? <span>Package source available</span> : <span>Catalog fallback</span>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button type="button" size="sm" variant={skill.installedSkillId ? "outline" : "default"} onClick={onInstall}>
          <PackagePlus className="mr-2 h-4 w-4" />
          {skill.installedSkillId ? "Assign" : "Install"}
        </Button>
      </div>
    </article>
  );
}

function PluginCard({ plugin, onPreview, onInstall }: {
  plugin: MarketplacePluginListItem;
  onPreview: () => void;
  onInstall: () => void;
}) {
  return (
    <article className="flex min-h-64 flex-col border border-border bg-card p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{plugin.categoryName}</Badge>
          <Badge variant="secondary"><Wrench className="h-3 w-3" /> Plugin</Badge>
          {plugin.installedPluginId ? (
            <Badge variant="secondary"><Check className="h-3 w-3" /> {plugin.installedStatus ?? "Installed"}</Badge>
          ) : null}
        </div>
        <h2 className="mt-3 line-clamp-2 text-base font-semibold leading-snug">{plugin.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{plugin.description ?? plugin.slug}</p>
        <div className="mt-3 text-xs text-muted-foreground">{capabilitySummary(plugin)}</div>
        <div className="mt-3 truncate text-xs text-muted-foreground">{plugin.packageName}</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" size="sm" variant="outline" onClick={onPreview}>
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button type="button" size="sm" variant={plugin.installedPluginId ? "outline" : "default"} onClick={onInstall} disabled={Boolean(plugin.installedPluginId)}>
          <Plug className="mr-2 h-4 w-4" />
          {plugin.installedPluginId ? "Installed" : "Install"}
        </Button>
      </div>
    </article>
  );
}

function SkillPreview({ skill, query }: {
  skill: MarketplaceSkillListItem | MarketplaceSkillDetail | null;
  query: ReturnType<typeof useQuery<MarketplaceSkillDetail>>;
}) {
  if (query.isLoading) {
    return <LoadingPreview label="Loading preview..." />;
  }
  if (query.error) {
    return <div className="py-6 text-sm text-destructive">{query.error instanceof Error ? query.error.message : "Failed to load skill preview"}</div>;
  }
  if (!skill) return null;
  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{skill.categoryName}</Badge>
        <Badge variant="secondary">{skill.trustLevel.replace(/_/g, " ")}</Badge>
        {skill.installedSkillId ? <Badge variant="secondary"><Check className="h-3 w-3" /> Installed</Badge> : null}
      </div>
      <PreviewGrid leftLabel="Source" leftValue={skill.sourceUrl ?? "Catalog fallback"} rightLabel="Install source" rightValue={skill.installSource ?? "Not packaged"} />
      {"installNotes" in skill && skill.installNotes ? <PreviewText title="Install notes" value={skill.installNotes} /> : null}
      {"markdown" in skill && skill.markdown ? <PreviewMarkdown title="Skill details" value={skill.markdown} /> : null}
    </div>
  );
}

function PluginPreview({ plugin, query }: {
  plugin: MarketplacePluginListItem | MarketplacePluginDetail | null;
  query: ReturnType<typeof useQuery<MarketplacePluginDetail>>;
}) {
  if (query.isLoading) {
    return <LoadingPreview label="Loading preview..." />;
  }
  if (query.error) {
    return <div className="py-6 text-sm text-destructive">{query.error instanceof Error ? query.error.message : "Failed to load plugin preview"}</div>;
  }
  if (!plugin) return null;
  return (
    <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{plugin.categoryName}</Badge>
        <Badge variant="secondary">{plugin.sourceType}</Badge>
        {plugin.installedPluginId ? <Badge variant="secondary"><Check className="h-3 w-3" /> {plugin.installedStatus ?? "Installed"}</Badge> : null}
      </div>
      <PreviewGrid leftLabel="Package" leftValue={plugin.packageName} rightLabel="Source" rightValue={plugin.localPath ?? plugin.sourceType} />
      <div className="grid gap-3 text-sm sm:grid-cols-4">
        <Metric label="Tools" value={plugin.toolCount} />
        <Metric label="UI slots" value={plugin.uiSlotCount} />
        <Metric label="Jobs" value={plugin.jobCount} />
        <Metric label="Webhooks" value={plugin.webhookCount} />
      </div>
      {plugin.capabilities.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {plugin.capabilities.map((capability) => (
            <span key={capability} className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {capability}
            </span>
          ))}
        </div>
      ) : null}
      {"installNotes" in plugin && plugin.installNotes ? <PreviewText title="Install notes" value={plugin.installNotes} /> : null}
      {"markdown" in plugin && plugin.markdown ? <PreviewMarkdown title="Plugin details" value={plugin.markdown} /> : null}
    </div>
  );
}

function LoadingPreview({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function PreviewGrid({ leftLabel, leftValue, rightLabel, rightValue }: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <div className="border border-border p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{leftLabel}</div>
        <div className="mt-1 break-words text-foreground">{leftValue}</div>
      </div>
      <div className="border border-border p-3">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{rightLabel}</div>
        <div className="mt-1 break-words text-foreground">{rightValue}</div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function PreviewText({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{value}</p>
    </section>
  );
}

function PreviewMarkdown({ title, value }: { title: string; value: string }) {
  return (
    <section>
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="mt-2 max-h-72 overflow-y-auto border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
        <pre className="whitespace-pre-wrap font-sans">{value}</pre>
      </div>
    </section>
  );
}

function SkillInstallOptions({ assignMode, activeAgents, selectedAgentIds, onAssignModeChange, onToggleAgent }: {
  assignMode: MarketplaceSkillAssignMode;
  activeAgents: Array<{ id: string; name: string; role: string; adapterType: string }>;
  selectedAgentIds: string[];
  onAssignModeChange: (mode: MarketplaceSkillAssignMode) => void;
  onToggleAgent: (agentId: string, checked: boolean) => void;
}) {
  return (
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
              onChange={() => onAssignModeChange(option.value)}
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
                  onChange={(event) => onToggleAgent(agent.id, event.target.checked)}
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
  );
}
