import type {
  PaperClawPluginManifestV1,
  PluginConfig,
  PluginRecord,
  PluginSetupOverallStatus,
  PluginSetupPatchRequest,
  PluginSetupStep,
  PluginSetupStepStatus,
  PluginSetupSummary,
  PluginSetupWizardState,
  PluginCompanySettings,
} from "@kesarcloud/shared";
import { validateInstanceConfig } from "./plugin-config-validator.js";
import {
  findLocalFolderDeclaration,
  getStoredLocalFolders,
  inspectPluginLocalFolder,
} from "./plugin-local-folders.js";

interface PluginSetupRegistry {
  getConfig(pluginId: string): Promise<PluginConfig | null>;
  getCompanySettings(pluginId: string, companyId: string): Promise<PluginCompanySettings | null>;
  upsertCompanySettings(
    pluginId: string,
    companyId: string,
    input: { enabled?: boolean; settingsJson: Record<string, unknown>; lastError?: string | null },
  ): Promise<PluginCompanySettings>;
}

const SETUP_WIZARD_SETTINGS_KEY = "setupWizard";

function nowIso() {
  return new Date().toISOString();
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === "string" && value.trim().length > 0))];
}

export function defaultPluginSetupWizardState(now = nowIso()): PluginSetupWizardState {
  return {
    status: "not_started",
    currentStepKey: null,
    completedStepKeys: [],
    manuallyCompletedStepKeys: [],
    dismissedAt: null,
    completedAt: null,
    updatedAt: now,
    version: 1,
  };
}

export function readPluginSetupWizardState(settingsJson: Record<string, unknown> | null | undefined): PluginSetupWizardState {
  const raw = settingsJson?.[SETUP_WIZARD_SETTINGS_KEY];
  if (!raw || typeof raw !== "object") return defaultPluginSetupWizardState();
  const value = raw as Record<string, unknown>;
  const status = value.status;
  const normalizedStatus =
    status === "in_progress" || status === "complete" || status === "dismissed" || status === "not_started"
      ? status
      : "not_started";
  const currentStepKey = typeof value.currentStepKey === "string" && value.currentStepKey.trim()
    ? value.currentStepKey
    : null;
  const dismissedAt = typeof value.dismissedAt === "string" ? value.dismissedAt : null;
  const completedAt = typeof value.completedAt === "string" ? value.completedAt : null;
  const updatedAt = typeof value.updatedAt === "string" ? value.updatedAt : nowIso();

  return {
    status: normalizedStatus,
    currentStepKey,
    completedStepKeys: uniqueStrings(value.completedStepKeys),
    manuallyCompletedStepKeys: uniqueStrings(value.manuallyCompletedStepKeys),
    dismissedAt,
    completedAt,
    updatedAt,
    version: 1,
  };
}

export function mergePluginSetupWizardState(
  existing: PluginSetupWizardState,
  patch: PluginSetupPatchRequest,
  now = nowIso(),
): PluginSetupWizardState {
  return {
    status: patch.status ?? existing.status,
    currentStepKey: patch.currentStepKey !== undefined ? patch.currentStepKey : existing.currentStepKey,
    completedStepKeys: patch.completedStepKeys !== undefined
      ? uniqueStrings(patch.completedStepKeys)
      : existing.completedStepKeys,
    manuallyCompletedStepKeys: patch.manuallyCompletedStepKeys !== undefined
      ? uniqueStrings(patch.manuallyCompletedStepKeys)
      : existing.manuallyCompletedStepKeys,
    dismissedAt: patch.dismissedAt !== undefined ? patch.dismissedAt : existing.dismissedAt,
    completedAt: patch.completedAt !== undefined ? patch.completedAt : existing.completedAt,
    updatedAt: now,
    version: 1,
  };
}

export function writePluginSetupWizardState(
  settingsJson: Record<string, unknown> | null | undefined,
  state: PluginSetupWizardState,
): Record<string, unknown> {
  return {
    ...(settingsJson ?? {}),
    [SETUP_WIZARD_SETTINGS_KEY]: state,
  };
}

function hasConfigSchema(manifest: PaperClawPluginManifestV1) {
  const schema = manifest.instanceConfigSchema;
  return Boolean(schema && typeof schema === "object" && Object.keys(schema).length > 0);
}

function hasCustomSettingsPage(manifest: PaperClawPluginManifestV1) {
  return Boolean(manifest.ui?.slots?.some((slot) => slot.type === "settingsPage"));
}

function withManualCompletion(
  step: PluginSetupStep,
  state: PluginSetupWizardState,
): PluginSetupStep {
  return state.manuallyCompletedStepKeys.includes(step.key)
    ? { ...step, status: "done", details: { ...step.details, manuallyCompleted: true } }
    : step;
}

function statusForRequiredPaths(statuses: Array<{ healthy: boolean; configured: boolean }>): PluginSetupStepStatus {
  if (statuses.length === 0) return "skipped";
  if (statuses.every((status) => status.healthy)) return "done";
  if (statuses.some((status) => status.configured)) return "failed";
  return "needs_action";
}

function computeOverallStatus(steps: PluginSetupStep[]): PluginSetupOverallStatus {
  const required = steps.filter((step) => step.required);
  if (required.some((step) => step.status === "failed")) return "failed";
  if (required.some((step) => step.status !== "done" && step.status !== "skipped")) return "needs_action";
  return "complete";
}

function computeNextStepKey(steps: PluginSetupStep[]) {
  return steps.find((step) => step.required && step.status !== "done" && step.status !== "skipped")?.key ?? null;
}

export async function buildPluginSetupSummary(input: {
  registry: PluginSetupRegistry;
  plugin: PluginRecord;
  companyId: string;
}): Promise<PluginSetupSummary> {
  const { registry, plugin, companyId } = input;
  const manifest = plugin.manifestJson;
  const settings = await registry.getCompanySettings(plugin.id, companyId);
  const wizardState = readPluginSetupWizardState(settings?.settingsJson);
  const warnings: string[] = [];
  const steps: PluginSetupStep[] = [];

  steps.push({
    key: "review",
    kind: "review",
    label: "Review plugin access",
    description: "Review the plugin package, declared capabilities, and host surfaces.",
    status: "done",
    required: true,
    href: null,
    details: {
      packageName: plugin.packageName,
      version: plugin.version,
      capabilities: manifest.capabilities ?? [],
      tools: manifest.tools ?? [],
      jobs: manifest.jobs ?? [],
      webhooks: manifest.webhooks ?? [],
      uiSlots: manifest.ui?.slots ?? [],
      launchers: [...(manifest.launchers ?? []), ...(manifest.ui?.launchers ?? [])],
      database: manifest.database ?? null,
    },
  });

  if (hasConfigSchema(manifest)) {
    const config = await registry.getConfig(plugin.id);
    let status: PluginSetupStepStatus = "needs_action";
    const schema = manifest.instanceConfigSchema;
    if (config?.configJson && schema) {
      const validation = validateInstanceConfig(config.configJson, schema);
      status = validation.valid ? "done" : "failed";
      if (!validation.valid) {
        warnings.push("Saved plugin configuration does not match the current plugin schema.");
      }
    }

    steps.push({
      key: "config",
      kind: "config",
      label: "Configure instance settings",
      description: "Save the plugin credentials or instance-wide settings required by its manifest schema.",
      status,
      required: true,
      href: null,
      details: {
        hasSavedConfig: Boolean(config),
        schema: manifest.instanceConfigSchema,
      },
    });
  }

  if ((manifest.localFolders?.length ?? 0) > 0) {
    const storedFolders = getStoredLocalFolders(settings?.settingsJson);
    const folderStatuses = await Promise.all((manifest.localFolders ?? []).map((folder) =>
      inspectPluginLocalFolder({
        folderKey: folder.folderKey,
        declaration: findLocalFolderDeclaration(manifest.localFolders, folder.folderKey),
        storedConfig: storedFolders[folder.folderKey] ?? null,
      })));
    steps.push({
      key: "local-folders",
      kind: "local_folder",
      label: "Configure local folders",
      description: "Choose and validate the company-scoped local folders this plugin can access.",
      status: statusForRequiredPaths(folderStatuses),
      required: true,
      href: null,
      details: {
        folders: folderStatuses,
      },
    });
  }

  if (hasCustomSettingsPage(manifest)) {
    steps.push(withManualCompletion({
      key: "custom-settings",
      kind: "custom_settings",
      label: "Review custom settings",
      description: "Complete any plugin-provided setup controls, then mark this step configured.",
      status: "needs_action",
      required: true,
      href: null,
      details: {},
    }, wizardState));
  }

  if ((manifest.environmentDrivers?.length ?? 0) > 0) {
    steps.push(withManualCompletion({
      key: "environment-drivers",
      kind: "environment_driver",
      label: "Configure environment drivers",
      description: "Create any company environments that should use this plugin's runtime driver.",
      status: "needs_action",
      required: true,
      href: "/company/settings/environments",
      details: {
        environmentDrivers: manifest.environmentDrivers ?? [],
      },
    }, wizardState));
  }

  const managedResourceCount =
    (manifest.agents?.length ?? 0) + (manifest.projects?.length ?? 0) + (manifest.routines?.length ?? 0);
  if (managedResourceCount > 0) {
    steps.push(withManualCompletion({
      key: "managed-resources",
      kind: "managed_resources",
      label: "Review managed resources",
      description: "Review plugin-managed agents, projects, or routines before agents rely on them.",
      status: "needs_action",
      required: false,
      href: null,
      details: {
        agents: manifest.agents ?? [],
        projects: manifest.projects ?? [],
        routines: manifest.routines ?? [],
      },
    }, wizardState));
  }

  if ((manifest.tools?.length ?? 0) > 0) {
    steps.push({
      key: "tools",
      kind: "tools",
      label: "Review agent tools",
      description: "Confirm the tools this plugin will make available to agents.",
      status: "done",
      required: false,
      href: null,
      details: {
        tools: manifest.tools ?? [],
      },
    });
  }

  if ((manifest.jobs?.length ?? 0) > 0) {
    steps.push({
      key: "jobs",
      kind: "jobs",
      label: "Review scheduled jobs",
      description: "Confirm the plugin's scheduled job declarations.",
      status: "done",
      required: false,
      href: null,
      details: {
        jobs: manifest.jobs ?? [],
      },
    });
  }

  if ((manifest.webhooks?.length ?? 0) > 0) {
    steps.push({
      key: "webhooks",
      kind: "webhooks",
      label: "Review webhooks",
      description: "Use the plugin settings page to inspect webhook delivery status after configuring upstream systems.",
      status: "done",
      required: false,
      href: null,
      details: {
        webhooks: manifest.webhooks ?? [],
      },
    });
  }

  if (manifest.database) {
    steps.push({
      key: "database",
      kind: "database",
      label: "Review database access",
      description: "This plugin owns a restricted database namespace and migrations.",
      status: "done",
      required: false,
      href: null,
      details: {
        database: manifest.database,
      },
    });
  }

  steps.push({
    key: "health",
    kind: "health",
    label: "Verify plugin health",
    description: "Confirm PaperClaw loaded the plugin and it is not in an error state.",
    status: plugin.status === "ready" && !plugin.lastError ? "done" : "failed",
    required: true,
    href: null,
    details: {
      pluginStatus: plugin.status,
      lastError: plugin.lastError,
    },
  });

  const overallStatus = computeOverallStatus(steps);

  return {
    pluginId: plugin.id,
    pluginKey: plugin.pluginKey,
    companyId,
    overallStatus,
    nextStepKey: computeNextStepKey(steps),
    steps,
    wizardState,
    warnings,
  };
}

export async function updatePluginSetupWizardState(input: {
  registry: PluginSetupRegistry;
  plugin: PluginRecord;
  companyId: string;
  patch: PluginSetupPatchRequest;
}): Promise<PluginSetupWizardState> {
  const existing = await input.registry.getCompanySettings(input.plugin.id, input.companyId);
  const current = readPluginSetupWizardState(existing?.settingsJson);
  const next = mergePluginSetupWizardState(current, input.patch);
  const settingsJson = writePluginSetupWizardState(existing?.settingsJson, next);
  await input.registry.upsertCompanySettings(input.plugin.id, input.companyId, {
    enabled: existing?.enabled ?? true,
    settingsJson,
    lastError: existing?.lastError ?? null,
  });
  return next;
}
