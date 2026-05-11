import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import {
  buildMetaCommand,
  buildRawMetaCommand,
  ensurePlanAllowed,
  normalizeConfig,
  runMetaCommand,
  summarizeMetaResult,
  validateConfig,
  type MetaAdsConfig,
  type MetaCommandPlan,
  type MetaOperation,
} from "./meta-runner.js";

type ToolParams = Record<string, unknown>;

const execFileAsync = promisify(execFile);
const COMMAND_HISTORY_KEY = "recent-commands";

function asObject(value: unknown): ToolParams {
  return typeof value === "object" && value !== null ? value as ToolParams : {};
}

function stringParam(params: ToolParams, key: string, fallback = "") {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberParam(params: ToolParams, key: string, fallback: number, min: number, max: number) {
  const value = params[key];
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function requireString(params: ToolParams, key: string) {
  const value = stringParam(params, key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function jsonObject(value: unknown) {
  return typeof value === "object" && value !== null ? value : {};
}

function arrayParam(value: unknown) {
  return Array.isArray(value) ? value : [];
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  summary: string;
  operation: string;
  adAccountId?: string;
  mutating: boolean;
  dryRun: boolean;
  ok: boolean;
  runId?: string;
  agentId?: string;
}) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
  const list = Array.isArray(existing) ? existing : [];
  const next = [{
    ...input,
    createdAt: new Date().toISOString(),
  }, ...list].slice(0, 50);
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY }, next);
}

async function auditCommand(ctx: PluginContext, runCtx: ToolRunContext, plan: MetaCommandPlan, result: { ok: boolean; dryRun: boolean }) {
  await rememberCommand(ctx, runCtx.companyId, {
    summary: plan.summary,
    operation: plan.operation,
    adAccountId: plan.adAccountId,
    mutating: plan.mutating,
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Meta Ads ${result.dryRun ? "dry-run" : "command"}: ${plan.summary}`,
    metadata: {
      operation: plan.operation,
      adAccountId: plan.adAccountId,
      mutating: plan.mutating,
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function executePlan(ctx: PluginContext, config: MetaAdsConfig, runCtx: ToolRunContext, plan: MetaCommandPlan, payload?: unknown): Promise<ToolResult> {
  try {
    ensurePlanAllowed(config, plan, payload);
  } catch (err) {
    await auditCommand(ctx, runCtx, plan, { ok: false, dryRun: config.dryRun && plan.mutating });
    return { error: err instanceof Error ? err.message : String(err) };
  }

  if (config.dryRun && plan.mutating) {
    const args = plan.args.includes("--dry-run") ? plan.args : [...plan.args, "--dry-run"];
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: true });
    return {
      content: `Dry run prepared for Meta Ads: ${plan.summary}. Meta CLI was not executed.`,
      data: {
        operation: plan.operation,
        adAccountId: plan.adAccountId ?? null,
        summary: plan.summary,
        dryRun: true,
        command: [config.metaCliBinaryPath, ...args],
        result: null,
        truncated: false,
      },
    };
  }

  try {
    const result = await runMetaCommand(config, plan, payload);
    const data = summarizeMetaResult(result);
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: result.dryRun });
    return {
      content: result.dryRun && plan.mutating
        ? `Dry run prepared for Meta Ads: ${plan.summary}.`
        : `Meta Ads command completed: ${plan.summary}.`,
      data: {
        operation: plan.operation,
        adAccountId: plan.adAccountId ?? null,
        summary: plan.summary,
        dryRun: result.dryRun,
        command: [result.command, ...result.args],
        result: data,
        truncated: result.truncated,
      },
    };
  } catch (err) {
    await auditCommand(ctx, runCtx, plan, { ok: false, dryRun: config.dryRun && plan.mutating });
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function accountOverview(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["accounts", "overview"],
    adAccountId: requireString(params, "adAccountId"),
    summary: "load Meta Ads account overview",
  });
}

function campaignsList(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["campaigns", "list"],
    adAccountId: requireString(params, "adAccountId"),
    params: {
      status: stringParam(params, "status") || undefined,
      limit: numberParam(params, "limit", 50, 1, 500),
    },
    summary: "list Meta Ads campaigns",
  });
}

function campaignCreate(params: ToolParams) {
  const campaign = jsonObject(params.campaign);
  return buildMetaCommand({
    operation: "create",
    parts: ["campaigns", "create"],
    adAccountId: requireString(params, "adAccountId"),
    json: campaign,
    summary: "create Meta Ads campaign",
  });
}

function campaignUpdate(params: ToolParams) {
  const patch = jsonObject(params.patch);
  return buildMetaCommand({
    operation: "update",
    parts: ["campaigns", "update"],
    adAccountId: requireString(params, "adAccountId"),
    entityId: requireString(params, "campaignId"),
    json: patch,
    summary: "update Meta Ads campaign",
  });
}

function adSetsList(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["ad-sets", "list"],
    adAccountId: requireString(params, "adAccountId"),
    params: {
      campaignId: stringParam(params, "campaignId") || undefined,
      status: stringParam(params, "status") || undefined,
      limit: numberParam(params, "limit", 50, 1, 500),
    },
    summary: "list Meta Ads ad sets",
  });
}

function adSetUpdate(params: ToolParams) {
  const patch = jsonObject(params.patch);
  return buildMetaCommand({
    operation: "update",
    parts: ["ad-sets", "update"],
    adAccountId: requireString(params, "adAccountId"),
    entityId: requireString(params, "adSetId"),
    json: patch,
    summary: "update Meta Ads ad set",
  });
}

function adsList(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["ads", "list"],
    adAccountId: requireString(params, "adAccountId"),
    params: {
      campaignId: stringParam(params, "campaignId") || undefined,
      adSetId: stringParam(params, "adSetId") || undefined,
      status: stringParam(params, "status") || undefined,
      limit: numberParam(params, "limit", 50, 1, 500),
    },
    summary: "list Meta Ads ads",
  });
}

function adUpdate(params: ToolParams) {
  const patch = jsonObject(params.patch);
  return buildMetaCommand({
    operation: "update",
    parts: ["ads", "update"],
    adAccountId: requireString(params, "adAccountId"),
    entityId: requireString(params, "adId"),
    json: patch,
    summary: "update Meta Ad",
  });
}

function insightsReport(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["insights", "report"],
    adAccountId: requireString(params, "adAccountId"),
    params: {
      level: stringParam(params, "level", "campaign"),
      since: stringParam(params, "since") || undefined,
      until: stringParam(params, "until") || undefined,
      fields: arrayParam(params.fields).join(",") || undefined,
      breakdowns: arrayParam(params.breakdowns).join(",") || undefined,
    },
    summary: "run Meta Ads insights report",
  });
}

function creativeFatigueAudit(params: ToolParams) {
  return buildMetaCommand({
    operation: "diagnostics",
    parts: ["diagnostics", "creative-fatigue"],
    adAccountId: requireString(params, "adAccountId"),
    params: {
      since: stringParam(params, "since") || undefined,
      until: stringParam(params, "until") || undefined,
    },
    summary: "run Meta Ads creative fatigue diagnostics",
  });
}

function catalogList(params: ToolParams) {
  return buildMetaCommand({
    operation: "read",
    parts: ["catalogs", "list"],
    businessId: requireString(params, "businessId"),
    params: { limit: numberParam(params, "limit", 50, 1, 500) },
    summary: "list Meta Commerce catalogs",
  });
}

function catalogDiagnostics(params: ToolParams) {
  return buildMetaCommand({
    operation: "diagnostics",
    parts: ["catalogs", "diagnostics"],
    catalogId: requireString(params, "catalogId"),
    summary: "run Meta catalog diagnostics",
  });
}

function signalDiagnostics(params: ToolParams) {
  return buildMetaCommand({
    operation: "diagnostics",
    parts: ["diagnostics", "signals"],
    adAccountId: requireString(params, "adAccountId"),
    params: { pixelId: stringParam(params, "pixelId") || undefined },
    summary: "run Meta Pixel and CAPI signal diagnostics",
  });
}

const builders: Record<string, (params: ToolParams) => { plan: MetaCommandPlan; payload?: unknown }> = {
  [TOOL_NAMES.accountOverview]: (params) => ({ plan: accountOverview(params) }),
  [TOOL_NAMES.campaignsList]: (params) => ({ plan: campaignsList(params) }),
  [TOOL_NAMES.campaignCreate]: (params) => ({ plan: campaignCreate(params), payload: params.campaign }),
  [TOOL_NAMES.campaignUpdate]: (params) => ({ plan: campaignUpdate(params), payload: params.patch }),
  [TOOL_NAMES.adSetsList]: (params) => ({ plan: adSetsList(params) }),
  [TOOL_NAMES.adSetUpdate]: (params) => ({ plan: adSetUpdate(params), payload: params.patch }),
  [TOOL_NAMES.adsList]: (params) => ({ plan: adsList(params) }),
  [TOOL_NAMES.adUpdate]: (params) => ({ plan: adUpdate(params), payload: params.patch }),
  [TOOL_NAMES.insightsReport]: (params) => ({ plan: insightsReport(params) }),
  [TOOL_NAMES.creativeFatigueAudit]: (params) => ({ plan: creativeFatigueAudit(params) }),
  [TOOL_NAMES.catalogList]: (params) => ({ plan: catalogList(params) }),
  [TOOL_NAMES.catalogDiagnostics]: (params) => ({ plan: catalogDiagnostics(params) }),
  [TOOL_NAMES.signalDiagnostics]: (params) => ({ plan: signalDiagnostics(params) }),
};

async function registerToolHandlers(ctx: PluginContext) {
  for (const [name, builder] of Object.entries(builders)) {
    ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (params, runCtx) => {
      const config = await getConfig(ctx);
      const { plan, payload } = builder(asObject(params));
      return executePlan(ctx, config, runCtx, plan, payload);
    });
  }

  ctx.tools.register(TOOL_NAMES.runCliCommand, {
    displayName: "Run Meta CLI Command",
    description: "Run a governed raw Meta CLI argument array.",
    parametersSchema: { type: "object" },
  }, async (params, runCtx) => {
    const config = await getConfig(ctx);
    if (!config.enableRawMetaTool) return { error: "Raw Meta CLI tool is disabled in plugin settings." };
    const payload = asObject(params);
    const args = arrayParam(payload.args).map((arg) => String(arg));
    const operation = stringParam(payload, "operation", "raw") as MetaOperation;
    const plan = buildRawMetaCommand({
      args,
      operation,
      adAccountId: stringParam(payload, "adAccountId") || undefined,
      dryRun: payload.dryRun === true,
      summary: stringParam(payload, "summary") || undefined,
    });
    return executePlan(ctx, config, runCtx, plan, payload);
  });
}

async function registerDataHandlers(ctx: PluginContext) {
  ctx.data.register(DATA_KEYS.status, async () => {
    const { config, errors, warnings } = validateConfig(await ctx.config.get());
    let installed = false;
    let version: string | null = null;
    let installError: string | null = null;
    try {
      const result = await execFileAsync(config.metaCliBinaryPath, ["--version"], { timeout: 5000 });
      installed = true;
      version = (result.stdout || result.stderr).trim() || null;
    } catch (err) {
      installError = err instanceof Error ? err.message : String(err);
    }
    return {
      pluginId: PLUGIN_ID,
      version: PLUGIN_VERSION,
      metaCli: { installed, version, installError },
      dryRun: config.dryRun,
      rawEnabled: config.enableRawMetaTool,
      allowedOperations: config.allowedOperations,
      allowedAdAccountIds: config.allowedAdAccountIds,
      metaConfigDir: config.metaConfigDir || null,
      maxBudgetChangePercent: config.maxBudgetChangePercent,
      maxDailyBudgetCents: config.maxDailyBudgetCents,
      errors,
      warnings,
    };
  });

  ctx.data.register(DATA_KEYS.recentCommands, async (params) => {
    const companyId = stringParam(params, "companyId");
    if (!companyId) return { commands: [] };
    const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
    return { commands: Array.isArray(existing) ? existing.slice(0, 20) : [] };
  });
}

const plugin = definePlugin({
  async setup(ctx) {
    await registerDataHandlers(ctx);
    await registerToolHandlers(ctx);
    ctx.logger.info("Meta Ads plugin setup complete");
  },

  async onValidateConfig(config) {
    const result = validateConfig(config);
    return {
      ok: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
    };
  },

  async onHealth() {
    return { status: "ok", message: "Meta Ads plugin worker is running." };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
