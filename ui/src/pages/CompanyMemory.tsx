import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Brain, Check, Clock, Database, Search, Archive } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTabBar } from "../components/PageTabBar";
import { ProductPage, ProductPageHeader, ProductSection } from "../components/ProductPage";
import { EmptyState } from "../components/EmptyState";
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
  if (status === "approved" || status === "active") return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
  if (status === "proposed") return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
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
    onSuccess: async (profile) => {
      queryClient.setQueryData(queryKeys.companyMemory.profile(selectedCompanyId!), profile);
      setProfileDraft(profile);
      await queryClient.invalidateQueries({ queryKey: queryKeys.companyMemory.profile(selectedCompanyId!) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.companyMemory.recall(selectedCompanyId!, { query: recallQuery, agentId: recallAgentId || null }) });
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
    if (saveProfileMutation.isError || saveProfileMutation.isSuccess) saveProfileMutation.reset();
    setProfileDraft((current) => ({ ...current, [key]: value }));
  }

  const canCreateMemory = newTitle.trim().length > 0 && newBody.trim().length > 0;

  return (
    <ProductPage>
      <ProductPageHeader
        title="Memory"
        description="Keep the company's profile and shared knowledge available to every agent."
        icon={Brain}
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <PageTabBar items={TABS} value={tab} onValueChange={setTab} align="start" />

        <TabsContent value="profile" className="space-y-4">
          <ProductSection title="Company profile" description="The background and operating context agents should know.">
          <div className="space-y-5 p-4 sm:p-5">
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
              <Select value={profileDraft.defaultLanguage ?? "en"} onValueChange={(value) => setProfileField("defaultLanguage", value as UpdateCompanyProfile["defaultLanguage"])}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                {COMPANY_PROFILE_LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>{option.label}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={profileDraft.defaultCurrency ?? "USD"} onValueChange={(value) => setProfileField("defaultCurrency", value as UpdateCompanyProfile["defaultCurrency"])}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                {COMPANY_PROFILE_CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>{option.code} - {option.label}</SelectItem>
                ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Website">
              <Input
                value={profileDraft.website ?? ""}
                onChange={(event) => setProfileField("website", event.target.value || null)}
              />
            </Field>
            <Field label="Timezone">
              <Select value={profileDraft.timezone ?? "__unset__"} onValueChange={(value) => setProfileField("timezone", (value === "__unset__" ? null : value) as UpdateCompanyProfile["timezone"])}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Unset" /></SelectTrigger>
                <SelectContent>
                <SelectItem value="__unset__">Unset</SelectItem>
                {COMPANY_PROFILE_TIMEZONE_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
                </SelectContent>
              </Select>
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
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => saveProfileMutation.mutate()} disabled={saveProfileMutation.isPending || profileQuery.isLoading}>
              <Check className="h-4 w-4" />
              {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
            {saveProfileMutation.isSuccess ? (
              <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                <Check className="h-4 w-4" />
                Profile saved.
              </div>
            ) : null}
            {saveProfileMutation.isError ? (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {saveProfileMutation.error instanceof Error ? saveProfileMutation.error.message : "Failed to save profile."}
              </div>
            ) : null}
          </div>
          </div>
          </ProductSection>
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
          <ProductSection title="Recall preview" description="Check which memories an agent would retrieve for a topic.">
          <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                value={recallQuery}
                onChange={(event) => setRecallQuery(event.target.value)}
                placeholder="Customer policy, onboarding, pricing..."
              />
            </div>
            <Select value={recallAgentId || "__any__"} onValueChange={(value) => setRecallAgentId(value === "__any__" ? "" : value)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Any agent" /></SelectTrigger>
              <SelectContent>
              <SelectItem value="__any__">Any agent</SelectItem>
              {(agentsQuery.data ?? []).map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
              </SelectContent>
            </Select>
          </div>
          </ProductSection>
          <MemoryList
            items={recallQueryResult.data?.items ?? []}
            loading={recallQueryResult.isFetching}
            onApprove={(id) => approveMutation.mutate(id)}
            onArchive={(id) => archiveMutation.mutate(id)}
            recall
          />
        </TabsContent>
      </Tabs>
    </ProductPage>
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
    <ProductSection title="Find memory" description="Search and filter the company's stored knowledge.">
    <div className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_170px_150px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input className="pl-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search memory..." />
      </div>
      <Select value={memoryType} disabled={lockType} onValueChange={(value) => setMemoryType(value as CompanyMemoryType | "all")}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
        <SelectItem value="all">All types</SelectItem>
        {COMPANY_MEMORY_TYPES.map((type) => (
          <SelectItem key={type} value={type}>{label(type)}</SelectItem>
        ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={(value) => setStatus(value as CompanyMemoryStatus | "all")}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
        <SelectItem value="all">All statuses</SelectItem>
        {COMPANY_MEMORY_STATUSES.map((value) => (
          <SelectItem key={value} value={value}>{label(value)}</SelectItem>
        ))}
        </SelectContent>
      </Select>
    </div>
    </ProductSection>
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
    <ProductSection title="Add memory" description="Write a fact or note that agents can use later.">
    <div className="space-y-4 p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px]">
        <Input aria-label="Memory title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <Select value={kind} onValueChange={(value) => setKind(value as CompanyMemoryKind)}>
          <SelectTrigger className="w-full" aria-label="Memory kind"><SelectValue /></SelectTrigger>
          <SelectContent>{COMPANY_MEMORY_KINDS.map((value) => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={scope} onValueChange={(value) => setScope(value as CompanyMemoryScopeType)}>
          <SelectTrigger className="w-full" aria-label="Memory scope"><SelectValue /></SelectTrigger>
          <SelectContent>{COMPANY_MEMORY_SCOPE_TYPES.map((value) => <SelectItem key={value} value={value}>{label(value)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Textarea aria-label="Memory body" value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder="Memory body" />
      <Button size="sm" onClick={onSubmit} disabled={!canSubmit || isPending}>
        <Database className="h-4 w-4" />
        Add Memory
      </Button>
    </div>
    </ProductSection>
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
    return <ProductSection><div className="p-6 text-sm text-muted-foreground">Loading memory...</div></ProductSection>;
  }
  if (items.length === 0) {
    return <ProductSection><EmptyState icon={Brain} message="No memory items yet." /></ProductSection>;
  }
  return (
    <ProductSection><div className="divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="space-y-2 px-4 py-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h2 className="truncate text-sm font-medium">{item.title}</h2>
                <span className={cn("rounded-md border px-2 py-0.5 text-xs font-medium", statusTone(item.status))}>
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
                <Button size="icon-sm" variant="ghost" onClick={() => onApprove(item.id)} aria-label={`Approve ${item.title}`} title="Approve">
                  <Check className="h-4 w-4" />
                </Button>
              ) : null}
              {item.status !== "archived" ? (
                <Button size="icon-sm" variant="ghost" onClick={() => onArchive(item.id)} aria-label={`Archive ${item.title}`} title="Archive">
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
    </div></ProductSection>
  );
}
