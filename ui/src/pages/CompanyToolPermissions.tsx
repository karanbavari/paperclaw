import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ToolPermissionEffect, UpsertToolPermissionPolicyRequest } from "@kesarcloud/shared";
import { ShieldCheck, Save, AlertTriangle } from "lucide-react";
import { agentsApi } from "@/api/agents";
import { pluginsApi } from "@/api/plugins";
import { toolPermissionsApi } from "@/api/toolPermissions";
import { useBreadcrumbs } from "@/context/BreadcrumbContext";
import { useCompany } from "@/context/CompanyContext";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const EFFECT_LABELS: Record<ToolPermissionEffect, string> = {
  inherit: "Inherit",
  allow: "Allow",
  deny: "Deny",
  approval_required: "Approval required",
  budget_limited: "Budget limited",
};

const editableEffects: ToolPermissionEffect[] = ["inherit", "allow", "deny", "approval_required", "budget_limited"];

function budgetLimit(amount: number) {
  return {
    amount: Math.max(1, Math.floor(amount)),
    windowKind: "calendar_month_utc" as const,
    metric: "execution_count" as const,
  };
}

function parseToolName(namespacedName: string) {
  const index = namespacedName.lastIndexOf(":");
  if (index <= 0) return { pluginKey: "", toolName: namespacedName };
  return {
    pluginKey: namespacedName.slice(0, index),
    toolName: namespacedName.slice(index + 1),
  };
}

function policyKey(policy: Pick<UpsertToolPermissionPolicyRequest, "subjectType" | "subjectId" | "pluginKey" | "toolName">) {
  return [
    policy.subjectType,
    policy.subjectId ?? "",
    policy.pluginKey ?? "",
    policy.toolName ?? "",
  ].join("|");
}

export function CompanyToolPermissions() {
  const { selectedCompany, selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<UpsertToolPermissionPolicyRequest[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  useEffect(() => {
    setBreadcrumbs([
      { label: selectedCompany?.name ?? "Company", href: "/dashboard" },
      { label: "Company Settings", href: "/company/settings" },
      { label: "Tool Permissions" },
    ]);
  }, [selectedCompany?.name, setBreadcrumbs]);

  const policiesQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.toolPermissions.list(selectedCompanyId) : ["tool-permissions", "__disabled__"],
    queryFn: () => toolPermissionsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const toolsQuery = useQuery({
    queryKey: ["plugins", "tools", "all"],
    queryFn: () => pluginsApi.listAllTools(),
    enabled: !!selectedCompanyId,
  });

  const agentsQuery = useQuery({
    queryKey: selectedCompanyId ? queryKeys.agents.list(selectedCompanyId) : ["agents", "__disabled__"],
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  useEffect(() => {
    if (policiesQuery.data) {
      setDraft(policiesQuery.data.policies.map((policy) => ({
        id: policy.id,
        subjectType: policy.subjectType,
        subjectId: policy.subjectId,
        pluginKey: policy.pluginKey,
        toolName: policy.toolName,
        effect: policy.effect,
        budgetLimit: policy.budgetLimit,
        enabled: policy.enabled,
      })));
    }
  }, [policiesQuery.data]);

  const mutation = useMutation({
    mutationFn: () => toolPermissionsApi.replace(selectedCompanyId!, { policies: draft }),
    onSuccess: () => {
      if (!selectedCompanyId) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.toolPermissions.list(selectedCompanyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.toolPermissions.decisions(selectedCompanyId) });
    },
  });

  const tools = toolsQuery.data ?? [];
  const agents = agentsQuery.data ?? [];
  const policyByKey = useMemo(() => new Map(draft.map((policy) => [policyKey(policy), policy])), [draft]);

  function setPolicy(next: UpsertToolPermissionPolicyRequest) {
    const key = policyKey(next);
    setDraft((current) => {
      const without = current.filter((policy) => policyKey(policy) !== key);
      if (next.effect === "inherit") return without;
      return [...without, { ...next, enabled: true }];
    });
  }

  function getEffect(policy: UpsertToolPermissionPolicyRequest): ToolPermissionEffect {
    return policyByKey.get(policyKey(policy))?.effect ?? "inherit";
  }

  function getBudgetAmount(policy: UpsertToolPermissionPolicyRequest): number {
    return policyByKey.get(policyKey(policy))?.budgetLimit?.amount ?? 10;
  }

  if (!selectedCompanyId) {
    return <div className="p-4 text-sm text-muted-foreground">Select a company to manage tool permissions.</div>;
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Tool Permissions</h1>
            <p className="text-sm text-muted-foreground">Control which plugin tools agents may run.</p>
          </div>
        </div>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>

      {mutation.error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "Could not save tool permissions"}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company defaults</CardTitle>
          <CardDescription>Fallback policy used when no agent or tool-specific rule exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <PolicySelect
            value={getEffect({ subjectType: "company", effect: "inherit" })}
            budgetAmount={getBudgetAmount({ subjectType: "company", effect: "inherit" })}
            onChange={(effect) => setPolicy({
              subjectType: "company",
              effect,
              budgetLimit: effect === "budget_limited" ? budgetLimit(10) : null,
            })}
            onBudgetAmountChange={(amount) => setPolicy({
              subjectType: "company",
              effect: "budget_limited",
              budgetLimit: budgetLimit(amount),
            })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent overrides</CardTitle>
          <CardDescription>Override company rules for one agent and one plugin tool.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            className="h-9 min-w-[260px] rounded-md border border-input bg-background px-3 text-sm"
            value={selectedAgentId}
            onChange={(event) => setSelectedAgentId(event.target.value)}
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          {!selectedAgentId ? (
            <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              Choose an agent to edit tool-specific overrides.
            </div>
          ) : null}
          <ToolPolicyTable
            disabled={!selectedAgentId}
            tools={tools}
            getEffect={(pluginKey, toolName) => getEffect({
              subjectType: "agent",
              subjectId: selectedAgentId,
              pluginKey,
              toolName,
              effect: "inherit",
            })}
            onChange={(pluginKey, toolName, effect) => setPolicy({
              subjectType: "agent",
              subjectId: selectedAgentId,
              pluginKey,
              toolName,
              effect,
              budgetLimit: effect === "budget_limited" ? budgetLimit(10) : null,
            })}
            getBudgetAmount={(pluginKey, toolName) => getBudgetAmount({
              subjectType: "agent",
              subjectId: selectedAgentId,
              pluginKey,
              toolName,
              effect: "inherit",
            })}
            onBudgetAmountChange={(pluginKey, toolName, amount) => setPolicy({
              subjectType: "agent",
              subjectId: selectedAgentId,
              pluginKey,
              toolName,
              effect: "budget_limited",
              budgetLimit: budgetLimit(amount),
            })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company tool rules</CardTitle>
          <CardDescription>Rules here apply to every agent unless an agent override exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <ToolPolicyTable
            tools={tools}
            getEffect={(pluginKey, toolName) => getEffect({
              subjectType: "company",
              pluginKey,
              toolName,
              effect: "inherit",
            })}
            onChange={(pluginKey, toolName, effect) => setPolicy({
              subjectType: "company",
              pluginKey,
              toolName,
              effect,
              budgetLimit: effect === "budget_limited" ? budgetLimit(10) : null,
            })}
            getBudgetAmount={(pluginKey, toolName) => getBudgetAmount({
              subjectType: "company",
              pluginKey,
              toolName,
              effect: "inherit",
            })}
            onBudgetAmountChange={(pluginKey, toolName, amount) => setPolicy({
              subjectType: "company",
              pluginKey,
              toolName,
              effect: "budget_limited",
              budgetLimit: budgetLimit(amount),
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PolicySelect({ value, onChange, budgetAmount, onBudgetAmountChange, disabled }: {
  value: ToolPermissionEffect;
  onChange: (value: ToolPermissionEffect) => void;
  budgetAmount?: number;
  onBudgetAmountChange?: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value as ToolPermissionEffect)}
        disabled={disabled}
      >
        {editableEffects.map((effect) => (
          <option key={effect} value={effect}>{EFFECT_LABELS[effect]}</option>
        ))}
      </select>
      {value === "budget_limited" ? (
        <input
          className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          type="number"
          min={1}
          value={budgetAmount ?? 10}
          onChange={(event) => onBudgetAmountChange?.(Number(event.target.value))}
          disabled={disabled}
          aria-label="Monthly execution limit"
        />
      ) : null}
    </div>
  );
}

function ToolPolicyTable({
  tools,
  getEffect,
  onChange,
  getBudgetAmount,
  onBudgetAmountChange,
  disabled = false,
}: {
  tools: Array<{ name: string; displayName: string; description: string }>;
  getEffect: (pluginKey: string, toolName: string) => ToolPermissionEffect;
  onChange: (pluginKey: string, toolName: string, effect: ToolPermissionEffect) => void;
  getBudgetAmount?: (pluginKey: string, toolName: string) => number;
  onBudgetAmountChange?: (pluginKey: string, toolName: string, value: number) => void;
  disabled?: boolean;
}) {
  if (tools.length === 0) {
    return <p className="text-sm text-muted-foreground">No plugin tools are registered right now.</p>;
  }

  return (
    <div className="space-y-2">
      {tools.map((tool, index) => {
        const parsed = parseToolName(tool.name);
        return (
          <div key={tool.name}>
            {index > 0 ? <Separator className="my-2" /> : null}
            <div className="grid gap-3 py-2 md:grid-cols-[minmax(0,1fr)_190px] md:items-center">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{tool.displayName}</span>
                  <Badge variant="outline" className="font-mono">{tool.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
              <PolicySelect
                value={getEffect(parsed.pluginKey, parsed.toolName)}
                onChange={(effect) => onChange(parsed.pluginKey, parsed.toolName, effect)}
                budgetAmount={getBudgetAmount?.(parsed.pluginKey, parsed.toolName)}
                onBudgetAmountChange={(amount) => onBudgetAmountChange?.(parsed.pluginKey, parsed.toolName, amount)}
                disabled={disabled}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
