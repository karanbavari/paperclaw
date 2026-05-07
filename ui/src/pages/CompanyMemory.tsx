import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Check, Clock, Database, Search, Archive } from "lucide-react";
import {
  COMPANY_MEMORY_KINDS,
  COMPANY_MEMORY_SCOPE_TYPES,
  COMPANY_MEMORY_STATUSES,
  COMPANY_MEMORY_TYPES,
  COMPANY_PROFILE_CURRENCY_OPTIONS,
  COMPANY_PROFILE_LANGUAGE_OPTIONS,
  COMPANY_PROFILE_TIMEZONE_OPTIONS,
  type CompanyMemoryKind,
  type CompanyMemoryScopeType,
  type CompanyMemoryStatus,
  type CompanyMemoryType,
  type UpdateCompanyProfile,
} from "@kesarcloud/shared";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTabBar } from "../components/PageTabBar";
import { Field } from "../components/agent-config-primitives";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { useCompany } from "../context/CompanyContext";
import { companyMemoryApi } from "../api/companyMemory";
import { agentsApi } from "../api/agents";
import { queryKeys } from "../lib/queryKeys";
import { cn } from "../lib/utils";

const TABS = [
  { value: "profile", label: "Company Profile" },
  { value: "knowledge", label: "Knowledge Base" },
  { value: "short-term", label: "Short-Term" },
  { value: "recall", label: "Recall Preview" },
];

function emptyProfile(): UpdateCompanyProfile {
  return {
    registeredSince: null,
    businessCategory: null,
    defaultLanguage: "en",
    defaultCurrency: "USD",
    website: null,
    contactEmail: null,
    contactPhone: null,
    contactAddress: null,
    timezone: null,
    businessSummary: null,
    targetCustomers: null,
    brandVoice: null,
    operatingNotes: null,
  };
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function statusTone(status: string) {
  if (status === "approved" || status === "active") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "proposed") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-muted-foreground bg-muted border-border";
}

export function CompanyMemory() {
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("profile");
  const [profileDraft, setProfileDraft] = useState<UpdateCompanyProfile>(() => emptyProfile());
  const [search, setSearch] = useState("");
  const [memoryType, setMemoryType] = useState<CompanyMemoryType | "all">("all");
  const [status, setStatus] = useState<CompanyMemoryStatus | "all">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newKind, setNewKind] = useState<CompanyMemoryKind>("note");
  const [newScope, setNewScope] = useState<CompanyMemoryScopeType>("company");
  const [recallQuery, setRecallQuery] = useState("");
  const [recallAgentId, setRecallAgentId] = useState("");

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: "Memory" },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs]);

  const profileQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.companyMemory.profile(selectedCompanyId) : ["company-memory", "__disabled__", "profile"],
    queryFn: () => companyMemoryApi.getProfile(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  useEffect(() => {
    setProfileDraft(profileQuery.data ?? emptyProfile());
  }, [profileQuery.data]);

  const listQueryParams = useMemo(() => ({
    q: search,
    memoryType: memoryType === "all" ? undefined : memoryType,
    status: status === "all" ? undefined : status,
    limit: 80,
  }), [memoryType, search, status]);

  const memoryQuery = useQuery({
    queryKey: selectedCompanyId
      ? queryKeys.companyMemory.list(selectedCompanyId, listQueryParams)
      : ["company-memory", "__disabled__", "list"],
    queryFn: () => companyMemoryApi.list(selectedCompanyId!, listQueryParams),
    enabled: !!selectedCompanyId,
  });

  const agentsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.agents.list(selectedCompanyId) : ["agents", "__disabled__"],
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const recallQueryResult = useQuery({
    queryKey: selectedCompanyId
      ? queryKeys.companyMemory.recall(selectedCompanyId, { query: recallQuery, agentId: recallAgentId || null })
      : ["company-memory", "__disabled__", "recall"],
    queryFn: () =>
      companyMemoryApi.recall(selectedCompanyId!, {
        query: recallQuery || undefined,
        agentId: recallAgentId || null,
        limit: 8,
      }),
    enabled: !!selectedCompanyId && tab === "recall",
  });

  const saveProfileMutation = useMutation({
    mutationFn: () => companyMemoryApi.updateProfile(selectedCompanyId!, profileDraft),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.companyMemory.profile(selectedCompanyId!), profile);
    },
  });

  const createMemoryMutation = useMutation({
    mutationFn: () =>
      companyMemoryApi.create(selectedCompanyId!, {
        memoryType: tab === "short-term" ? "short_term" : "long_term",
        kind: newKind,
        scopeType: newScope,
        title: newTitle.trim(),
        body: newBody.trim(),
        sourceType: "manual",
        tags: [],
        confidence: 70,
        importance: 50,
      }),
    onSuccess: async () => {
      setNewTitle("");
      setNewBody("");
      await queryClient.invalidateQueries({ queryKey: ["company-memory", selectedCompanyId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => companyMemoryApi.approve(selectedCompanyId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-memory", selectedCompanyId] }),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => companyMemoryApi.archive(selectedCompanyId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["company-memory", selectedCompanyId] }),
  });

  const filteredItems = useMemo(() => {
    const items = memoryQuery.data?.items ?? [];
    if (tab === "short-term") return items.filter((item) => item.memoryType === "short_term");
    return items.filter((item) => item.memoryType !== "short_term");
  }, [memoryQuery.data?.items, tab]);

  if (!selectedCompanyId) {
    return <div className="text-sm text-muted-foreground">No company selected.</div>;
  }

  function setProfileField<K extends keyof UpdateCompanyProfile>(key: K, value: UpdateCompanyProfile[K]) {
    setProfileDraft((current) => ({ ...current, [key]: value }));
  }

  const canCreateMemory = newTitle.trim().length > 0 && newBody.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Brain className="h-5 w-5 shrink-0 text-muted-foreground" />
          <h1 className="truncate text-lg font-semibold">Memory</h1>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <PageTabBar items={TABS} value={tab} onValueChange={setTab} align="start" />

        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Registered since">
              <Input
                type="date"
                value={profileDraft.registeredSince ?? ""}
                onChange={(event) => setProfileField("registeredSince", event.target.value || null)}
              />
            </Field>
            <Field label="Business category">
              <Input
                value={profileDraft.businessCategory ?? ""}
                onChange={(event) => setProfileField("businessCategory", event.target.value || null)}
              />
            </Field>
            <Field label="Language">
              <select
                value={profileDraft.defaultLanguage ?? "en"}
                onChange={(event) => setProfileField("defaultLanguage", event.target.value as UpdateCompanyProfile["defaultLanguage"])}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                {COMPANY_PROFILE_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Currency">
              <select
                value={profileDraft.defaultCurrency ?? "USD"}
                onChange={(event) => setProfileField("defaultCurrency", event.target.value as UpdateCompanyProfile["defaultCurrency"])}
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                {COMPANY_PROFILE_CURRENCY_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>{option.code} - {option.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Website">
              <Input
                value={profileDraft.website ?? ""}
                onChange={(event) => setProfileField("website", event.target.value || null)}
              />
            </Field>
            <Field label="Timezone">
              <select
                value={profileDraft.timezone ?? ""}
                onChange={(event) =>
                  setProfileField("timezone", (event.target.value || null) as UpdateCompanyProfile["timezone"])
                }
                className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">Unset</option>
                {COMPANY_PROFILE_TIMEZONE_OPTIONS.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </Field>
            <Field label="Contact email">
              <Input
                value={profileDraft.contactEmail ?? ""}
                onChange={(event) => setProfileField("contactEmail", event.target.value || null)}
              />
            </Field>
            <Field label="Contact phone">
              <Input
                value={profileDraft.contactPhone ?? ""}
                onChange={(event) => setProfileField("contactPhone", event.target.value || null)}
              />
            </Field>
          </div>
          <Field label="Contact address">
            <Textarea
              value={profileDraft.contactAddress ?? ""}
              onChange={(event) => setProfileField("contactAddress", event.target.value || null)}
              rows={3}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Business summary">
              <Textarea
                value={profileDraft.businessSummary ?? ""}
                onChange={(event) => setProfileField("businessSummary", event.target.value || null)}
                rows={6}
              />
            </Field>
            <Field label="Target customers">
              <Textarea
                value={profileDraft.targetCustomers ?? ""}
                onChange={(event) => setProfileField("targetCustomers", event.target.value || null)}
                rows={6}
              />
            </Field>
            <Field label="Brand voice">
              <Textarea
                value={profileDraft.brandVoice ?? ""}
                onChange={(event) => setProfileField("brandVoice", event.target.value || null)}
                rows={6}
              />
            </Field>
            <Field label="Operating notes">
              <Textarea
                value={profileDraft.operatingNotes ?? ""}
                onChange={(event) => setProfileField("operatingNotes", event.target.value || null)}
                rows={6}
              />
            </Field>
          </div>
          <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending}>
            <Check className="h-4 w-4" />
            Save Profile
          </Button>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <MemoryToolbar
            search={search}
            setSearch={setSearch}
            memoryType={memoryType}
            setMemoryType={setMemoryType}
            status={status}
            setStatus={setStatus}
          />
          <MemoryComposer
            title={newTitle}
            setTitle={setNewTitle}
            body={newBody}
            setBody={setNewBody}
            kind={newKind}
            setKind={setNewKind}
            scope={newScope}
            setScope={setNewScope}
            canSubmit={canCreateMemory}
            isPending={createMemoryMutation.isPending}
            onSubmit={() => createMemoryMutation.mutate()}
          />
          <MemoryList
            items={filteredItems}
            loading={memoryQuery.isFetching}
            onApprove={(id) => approveMutation.mutate(id)}
            onArchive={(id) => archiveMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="short-term" className="space-y-4">
          <MemoryToolbar
            search={search}
            setSearch={setSearch}
            memoryType="short_term"
            setMemoryType={() => undefined}
            status={status}
            setStatus={setStatus}
            lockType
          />
          <MemoryComposer
            title={newTitle}
            setTitle={setNewTitle}
            body={newBody}
            setBody={setNewBody}
            kind={newKind}
            setKind={setNewKind}
            scope={newScope}
            setScope={setNewScope}
            canSubmit={canCreateMemory}
            isPending={createMemoryMutation.isPending}
            onSubmit={() => createMemoryMutation.mutate()}
          />
          <MemoryList
            items={filteredItems}
            loading={memoryQuery.isFetching}
            onApprove={(id) => approveMutation.mutate(id)}
            onArchive={(id) => archiveMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="recall" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                value={recallQuery}
                onChange={(event) => setRecallQuery(event.target.value)}
                placeholder="Customer policy, onboarding, pricing..."
              />
            </div>
            <select
              value={recallAgentId}
              onChange={(event) => setRecallAgentId(event.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="">Any agent</option>
              {(agentsQuery.data ?? []).map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
          <MemoryList
            items={recallQueryResult.data?.items ?? []}
            loading={recallQueryResult.isFetching}
            onApprove={(id) => approveMutation.mutate(id)}
            onArchive={(id) => archiveMutation.mutate(id)}
            recall
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MemoryToolbar({
  search,
  setSearch,
  memoryType,
  setMemoryType,
  status,
  setStatus,
  lockType = false,
}: {
  search: string;
  setSearch: (value: string) => void;
  memoryType: CompanyMemoryType | "all";
  setMemoryType: (value: CompanyMemoryType | "all") => void;
  status: CompanyMemoryStatus | "all";
  setStatus: (value: CompanyMemoryStatus | "all") => void;
  lockType?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_150px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search memory..." />
      </div>
      <select
        value={memoryType}
        disabled={lockType}
        onChange={(event) => setMemoryType(event.target.value as CompanyMemoryType | "all")}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm disabled:opacity-70"
      >
        <option value="all">All types</option>
        {COMPANY_MEMORY_TYPES.map((type) => (
          <option key={type} value={type}>{label(type)}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(event) => setStatus(event.target.value as CompanyMemoryStatus | "all")}
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
      >
        <option value="all">All status</option>
        {COMPANY_MEMORY_STATUSES.map((value) => (
          <option key={value} value={value}>{label(value)}</option>
        ))}
      </select>
    </div>
  );
}

function MemoryComposer({
  title,
  setTitle,
  body,
  setBody,
  kind,
  setKind,
  scope,
  setScope,
  canSubmit,
  isPending,
  onSubmit,
}: {
  title: string;
  setTitle: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  kind: CompanyMemoryKind;
  setKind: (value: CompanyMemoryKind) => void;
  scope: CompanyMemoryScopeType;
  setScope: (value: CompanyMemoryScopeType) => void;
  canSubmit: boolean;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px]">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <select value={kind} onChange={(event) => setKind(event.target.value as CompanyMemoryKind)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          {COMPANY_MEMORY_KINDS.map((value) => <option key={value} value={value}>{label(value)}</option>)}
        </select>
        <select value={scope} onChange={(event) => setScope(event.target.value as CompanyMemoryScopeType)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          {COMPANY_MEMORY_SCOPE_TYPES.map((value) => <option key={value} value={value}>{label(value)}</option>)}
        </select>
      </div>
      <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder="Memory body" />
      <Button size="sm" onClick={onSubmit} disabled={!canSubmit || isPending}>
        <Database className="h-4 w-4" />
        Add Memory
      </Button>
    </div>
  );
}

function MemoryList({
  items,
  loading,
  onApprove,
  onArchive,
  recall = false,
}: {
  items: Array<{
    id: string;
    title: string;
    body: string;
    summary: string | null;
    memoryType: string;
    kind: string;
    status: string;
    tags: string[];
    updatedAt: string;
    recallScore?: number;
  }>;
  loading: boolean;
  onApprove: (id: string) => void;
  onArchive: (id: string) => void;
  recall?: boolean;
}) {
  if (loading && items.length === 0) {
    return <div className="rounded-md border border-border p-5 text-sm text-muted-foreground">Loading memory...</div>;
  }
  if (items.length === 0) {
    return <div className="rounded-md border border-border p-5 text-sm text-muted-foreground">No memory items.</div>;
  }
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {items.map((item) => (
        <div key={item.id} className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-medium">{item.title}</h2>
                <span className={cn("rounded border px-1.5 py-0.5 text-[10px] uppercase", statusTone(item.status))}>
                  {label(item.status)}
                </span>
                {recall && item.recallScore !== undefined ? (
                  <Badge variant="secondary">Score {item.recallScore}</Badge>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{label(item.memoryType)}</span>
                <span>{label(item.kind)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(item.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {item.status === "proposed" ? (
                <Button size="icon-sm" variant="ghost" onClick={() => onApprove(item.id)} title="Approve">
                  <Check className="h-4 w-4" />
                </Button>
              ) : null}
              {item.status !== "archived" ? (
                <Button size="icon-sm" variant="ghost" onClick={() => onArchive(item.id)} title="Archive">
                  <Archive className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{item.summary || item.body}</p>
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
