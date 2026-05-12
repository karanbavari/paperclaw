import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivitySquare,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ExternalLink,
  FolderOpen,
  Loader2,
  Save,
  Settings2,
  ShieldAlert,
} from "lucide-react";
import type {
  PluginLocalFolderDeclaration,
  PluginSetupStep,
  PluginSetupSummary,
} from "@kesarcloud/shared";
import { pluginsApi, type PluginLocalFolderStatus } from "@/api/plugins";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChoosePathButton } from "@/components/PathInstructionsModal";
import {
  JsonSchemaForm,
  getDefaultValues,
  validateJsonSchemaForm,
  type JsonSchemaNode,
} from "@/components/JsonSchemaForm";

interface PluginSetupWizardProps {
  pluginId: string | null;
  companyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PluginSetupWizard({ pluginId, companyId, open, onOpenChange }: PluginSetupWizardProps) {
  const queryClient = useQueryClient();
  const [activeStepKey, setActiveStepKey] = useState<string | null>(null);

  const pluginQuery = useQuery({
    queryKey: pluginId ? queryKeys.plugins.detail(pluginId) : ["plugins", "none"],
    queryFn: () => pluginsApi.get(pluginId!),
    enabled: open && !!pluginId,
  });

  const setupQuery = useQuery({
    queryKey: pluginId && companyId ? queryKeys.plugins.setup(pluginId, companyId) : ["plugins", "none", "setup"],
    queryFn: () => pluginsApi.setup(pluginId!, companyId!),
    enabled: open && !!pluginId && !!companyId,
  });

  const setup = setupQuery.data;
  const plugin = pluginQuery.data;
  const steps = setup?.steps ?? [];
  const activeStep = steps.find((step) => step.key === activeStepKey) ?? steps[0] ?? null;
  const activeIndex = Math.max(0, steps.findIndex((step) => step.key === activeStep?.key));
  const canGoBack = activeIndex > 0;
  const canGoNext = activeIndex >= 0 && activeIndex < steps.length - 1;
  const setupComplete = setup?.overallStatus === "complete";

  useEffect(() => {
    if (!open) {
      setActiveStepKey(null);
      return;
    }
    if (setup && !activeStepKey) {
      setActiveStepKey(setup.nextStepKey ?? setup.steps[0]?.key ?? null);
    }
  }, [activeStepKey, open, setup]);

  const patchMutation = useMutation({
    mutationFn: (patch: Parameters<typeof pluginsApi.updateSetup>[2]) =>
      pluginsApi.updateSetup(pluginId!, companyId!, patch),
    onSuccess: (summary) => {
      queryClient.setQueryData(queryKeys.plugins.setup(pluginId!, companyId!), summary);
      queryClient.invalidateQueries({ queryKey: queryKeys.plugins.setup(pluginId!, companyId!) });
    },
  });

  function updateManualStep(stepKey: string) {
    if (!setup) return;
    const nextManual = Array.from(new Set([...setup.wizardState.manuallyCompletedStepKeys, stepKey]));
    patchMutation.mutate({
      status: setup.wizardState.status === "not_started" ? "in_progress" : setup.wizardState.status,
      currentStepKey: stepKey,
      manuallyCompletedStepKeys: nextManual,
    });
  }

  function finishSetup() {
    if (!setupComplete) return;
    patchMutation.mutate({
      status: "complete",
      currentStepKey: null,
      completedStepKeys: steps.filter((step) => step.status === "done" || step.status === "skipped").map((step) => step.key),
      completedAt: new Date().toISOString(),
    }, {
      onSuccess: () => onOpenChange(false),
    });
  }

  function goNext() {
    if (!canGoNext) return;
    setActiveStepKey(steps[activeIndex + 1]?.key ?? null);
  }

  function goBack() {
    if (!canGoBack) return;
    setActiveStepKey(steps[activeIndex - 1]?.key ?? null);
  }

  const title = plugin?.manifestJson.displayName ?? "Plugin setup";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{title} setup</DialogTitle>
          <DialogDescription>
            Configure the plugin, verify company-scoped requirements, and mark setup complete.
          </DialogDescription>
        </DialogHeader>

        {pluginQuery.isLoading || setupQuery.isLoading ? (
          <div className="flex min-h-80 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading setup...
          </div>
        ) : !plugin || !setup || !companyId || !pluginId ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Plugin setup could not be loaded.
          </div>
        ) : (
          <div className="grid max-h-[68vh] min-h-[420px] gap-5 overflow-hidden md:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-2 overflow-y-auto border-r border-border/70 pr-4">
              <SetupOverallBadge setup={setup} />
              <Separator />
              {steps.map((step, index) => (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActiveStepKey(step.key)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    activeStep?.key === step.key ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  <StepStatusIcon step={step} className="mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{index + 1}. {step.label}</span>
                    <span className="mt-0.5 block truncate text-xs">{step.required ? "Required" : "Optional"}</span>
                  </span>
                </button>
              ))}
            </aside>

            <main className="overflow-y-auto pr-1">
              {activeStep ? (
                <SetupStepBody
                  pluginId={pluginId}
                  companyId={companyId}
                  step={activeStep}
                  setup={setup}
                  onManualComplete={updateManualStep}
                />
              ) : null}
            </main>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={goBack} disabled={!canGoBack}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {canGoNext ? (
            <Button onClick={goNext}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishSetup} disabled={!setupComplete || patchMutation.isPending}>
              {patchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Finish setup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SetupOverallBadge({ setup }: { setup: PluginSetupSummary }) {
  const variant = setup.overallStatus === "complete" ? "default" : setup.overallStatus === "failed" ? "destructive" : "secondary";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Setup status</span>
        <Badge variant={variant}>{setup.overallStatus.replace("_", " ")}</Badge>
      </div>
      {setup.nextStepKey ? (
        <p className="text-xs text-muted-foreground">Next action: {setup.steps.find((step) => step.key === setup.nextStepKey)?.label ?? setup.nextStepKey}</p>
      ) : (
        <p className="text-xs text-muted-foreground">Required setup checks are complete.</p>
      )}
    </div>
  );
}

function StepStatusIcon({ step, className }: { step: PluginSetupStep; className?: string }) {
  if (step.status === "done") return <CheckCircle2 className={cn("h-4 w-4 text-green-600", className)} />;
  if (step.status === "failed") return <AlertTriangle className={cn("h-4 w-4 text-destructive", className)} />;
  return <Circle className={cn("h-4 w-4 text-muted-foreground", className)} />;
}

function SetupStepBody({
  pluginId,
  companyId,
  step,
  setup,
  onManualComplete,
}: {
  pluginId: string;
  companyId: string;
  step: PluginSetupStep;
  setup: PluginSetupSummary;
  onManualComplete: (stepKey: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{step.label}</h3>
          {step.description ? <p className="max-w-2xl text-sm text-muted-foreground">{step.description}</p> : null}
        </div>
        <Badge variant={step.status === "done" ? "default" : step.status === "failed" ? "destructive" : "secondary"}>
          {step.status.replace("_", " ")}
        </Badge>
      </div>

      {step.kind === "review" ? <ReviewStep step={step} /> : null}
      {step.kind === "config" ? <ConfigStep pluginId={pluginId} companyId={companyId} schema={step.details.schema as JsonSchemaNode | undefined} /> : null}
      {step.kind === "local_folder" ? <LocalFoldersStep pluginId={pluginId} companyId={companyId} /> : null}
      {step.kind === "custom_settings" ? (
        <ManualStep
          icon={<Settings2 className="h-4 w-4" />}
          step={step}
          setup={setup}
          onManualComplete={onManualComplete}
        />
      ) : null}
      {step.kind === "environment_driver" ? (
        <ManualStep
          icon={<ExternalLink className="h-4 w-4" />}
          step={step}
          setup={setup}
          onManualComplete={onManualComplete}
        />
      ) : null}
      {step.kind === "managed_resources" ? (
        <ManualStep
          icon={<Settings2 className="h-4 w-4" />}
          step={step}
          setup={setup}
          onManualComplete={onManualComplete}
        />
      ) : null}
      {step.kind === "health" ? <HealthStep step={step} /> : null}
      {["tools", "jobs", "webhooks", "database"].includes(step.kind) ? <ReviewStep step={step} /> : null}

      {setup.warnings.length > 0 ? (
        <div className="rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          {setup.warnings.join(" ")}
        </div>
      ) : null}
    </div>
  );
}

function ReviewStep({ step }: { step: PluginSetupStep }) {
  const capabilities = Array.isArray(step.details.capabilities) ? step.details.capabilities as string[] : [];
  const tools = Array.isArray(step.details.tools) ? step.details.tools as Array<{ displayName?: string; name?: string }> : [];
  const jobs = Array.isArray(step.details.jobs) ? step.details.jobs as Array<{ displayName?: string; jobKey?: string }> : [];
  const webhooks = Array.isArray(step.details.webhooks) ? step.details.webhooks as Array<{ displayName?: string; endpointKey?: string }> : [];

  return (
    <div className="space-y-4">
      {capabilities.length > 0 ? (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            Capabilities
          </div>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((capability) => (
              <Badge key={capability} variant="outline" className="font-mono">{capability}</Badge>
            ))}
          </div>
        </section>
      ) : null}
      <DeclarationList title="Tools" items={tools.map((tool) => tool.displayName ?? tool.name ?? "Tool")} />
      <DeclarationList title="Jobs" items={jobs.map((job) => job.displayName ?? job.jobKey ?? "Job")} />
      <DeclarationList title="Webhooks" items={webhooks.map((webhook) => webhook.displayName ?? webhook.endpointKey ?? "Webhook")} />
    </div>
  );
}

function DeclarationList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-2">
      <div className="text-sm font-medium">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="rounded-md border border-border/70 px-3 py-2 text-sm">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function ConfigStep({ pluginId, companyId, schema }: { pluginId: string; companyId: string; schema?: JsonSchemaNode }) {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: queryKeys.plugins.config(pluginId),
    queryFn: () => pluginsApi.getConfig(pluginId),
    enabled: !!schema,
  });
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!schema) return;
    setValues({
      ...getDefaultValues(schema),
      ...(config?.configJson ?? {}),
    });
  }, [config?.configJson, schema]);

  const saveMutation = useMutation({
    mutationFn: (configJson: Record<string, unknown>) => pluginsApi.saveConfig(pluginId, configJson),
    onSuccess: async () => {
      setMessage({ tone: "success", text: "Configuration saved." });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.config(pluginId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.setup(pluginId, companyId) }),
      ]);
    },
    onError: (err: Error) => setMessage({ tone: "error", text: err.message || "Configuration save failed." }),
  });

  if (!schema) return <p className="text-sm text-muted-foreground">This plugin does not declare a setup form.</p>;
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading configuration...</div>;
  const activeSchema = schema;

  function save() {
    const nextErrors = validateJsonSchemaForm(values, activeSchema);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMessage({ tone: "error", text: "Fix validation errors before saving." });
      return;
    }
    saveMutation.mutate(values);
  }

  return (
    <div className="space-y-4">
      <JsonSchemaForm schema={activeSchema} values={values} onChange={setValues} errors={errors} disabled={saveMutation.isPending} />
      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save configuration
        </Button>
      </div>
      {message ? (
        <div className={cn(
          "rounded-md border px-3 py-2 text-sm",
          message.tone === "success"
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400"
            : "border-destructive/20 bg-destructive/10 text-destructive",
        )}>
          {message.text}
        </div>
      ) : null}
    </div>
  );
}

function LocalFoldersStep({ pluginId, companyId }: { pluginId: string; companyId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.plugins.localFolders(pluginId, companyId),
    queryFn: () => pluginsApi.listLocalFolders(pluginId, companyId),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading local folders...</div>;
  if (!data || data.declarations.length === 0) return <p className="text-sm text-muted-foreground">No local folders are declared.</p>;

  const statusByKey = new Map(data.folders.map((folder) => [folder.folderKey, folder]));
  return (
    <div className="space-y-3">
      {data.declarations.map((declaration) => (
        <LocalFolderSetupRow
          key={declaration.folderKey}
          pluginId={pluginId}
          companyId={companyId}
          declaration={declaration}
          status={statusByKey.get(declaration.folderKey)}
        />
      ))}
    </div>
  );
}

function LocalFolderSetupRow({
  pluginId,
  companyId,
  declaration,
  status,
}: {
  pluginId: string;
  companyId: string;
  declaration: PluginLocalFolderDeclaration;
  status?: PluginLocalFolderStatus;
}) {
  const queryClient = useQueryClient();
  const [pathValue, setPathValue] = useState(status?.path ?? "");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPathValue(status?.path ?? "");
    setMessage(null);
  }, [declaration.folderKey, status?.path]);

  const saveMutation = useMutation({
    mutationFn: () => pluginsApi.configureLocalFolder(pluginId, companyId, declaration.folderKey, {
      path: pathValue.trim(),
      access: declaration.access,
      requiredDirectories: declaration.requiredDirectories,
      requiredFiles: declaration.requiredFiles,
    }),
    onSuccess: async () => {
      setMessage("Local folder saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.localFolders(pluginId, companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.plugins.setup(pluginId, companyId) }),
      ]);
    },
    onError: (err: Error) => setMessage(err.message || "Local folder save failed."),
  });

  function save() {
    if (!isLikelyAbsolutePath(pathValue.trim())) {
      setMessage("Use a full absolute path.");
      return;
    }
    saveMutation.mutate();
  }

  return (
    <div className="space-y-3 rounded-md border border-border/70 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{declaration.displayName}</span>
            <Badge variant="outline" className="font-mono text-[10px]">{declaration.folderKey}</Badge>
          </div>
          {declaration.description ? <p className="text-sm text-muted-foreground">{declaration.description}</p> : null}
        </div>
        <Badge variant={status?.healthy ? "default" : "secondary"}>{status?.healthy ? "Healthy" : "Needs attention"}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={pathValue}
          onChange={(event) => setPathValue(event.target.value)}
          placeholder="/absolute/path/to/folder"
          className="font-mono"
        />
        <ChoosePathButton className="h-9" />
        <Button onClick={save} disabled={saveMutation.isPending || !pathValue.trim()}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>
      {status?.problems.length ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {status.problems.map((problem) => problem.path ? `${problem.message} ${problem.path}` : problem.message).join(" ")}
        </div>
      ) : null}
      {message ? <div className="text-sm text-muted-foreground">{message}</div> : null}
    </div>
  );
}

function ManualStep({
  icon,
  step,
  setup,
  onManualComplete,
}: {
  icon: ReactNode;
  step: PluginSetupStep;
  setup: PluginSetupSummary;
  onManualComplete: (stepKey: string) => void;
}) {
  const done = setup.wizardState.manuallyCompletedStepKeys.includes(step.key) || step.status === "done";
  return (
    <div className="space-y-4 rounded-md border border-border/70 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="space-y-1 text-sm">
          <div className="font-medium">{done ? "Marked configured" : "Manual confirmation required"}</div>
          <p className="text-muted-foreground">
            This requirement cannot be fully inspected by PaperClaw yet. Complete the linked setup surface, then mark it configured.
          </p>
        </div>
      </div>
      {step.href ? (
        <a href={step.href}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
            Open setup surface
          </Button>
        </a>
      ) : null}
      <Button onClick={() => onManualComplete(step.key)} disabled={done}>
        <CheckCircle2 className="h-4 w-4" />
        {done ? "Configured" : "Mark configured"}
      </Button>
    </div>
  );
}

function HealthStep({ step }: { step: PluginSetupStep }) {
  const pluginStatus = String(step.details.pluginStatus ?? "unknown");
  const lastError = typeof step.details.lastError === "string" ? step.details.lastError : null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2 text-sm">
        <span className="flex items-center gap-2">
          <ActivitySquare className="h-4 w-4 text-muted-foreground" />
          Lifecycle status
        </span>
        <Badge variant={step.status === "done" ? "default" : "destructive"}>{pluginStatus}</Badge>
      </div>
      {lastError ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {lastError}
        </div>
      ) : null}
    </div>
  );
}

function isLikelyAbsolutePath(pathValue: string) {
  return (
    pathValue.startsWith("/") ||
    /^[A-Za-z]:[\\/]/.test(pathValue) ||
    pathValue.startsWith("\\\\")
  );
}
