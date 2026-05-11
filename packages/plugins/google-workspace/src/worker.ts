import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import {
  buildGwsCommand,
  buildRawGwsCommand,
  isServiceAllowed,
  normalizeConfig,
  runGwsCommand,
  summarizeGwsResult,
  validateConfig,
  type GoogleWorkspaceConfig,
  type GwsCommandPlan,
} from "./gws-runner.js";

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

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  service: string;
  summary: string;
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

async function auditCommand(ctx: PluginContext, runCtx: ToolRunContext, plan: GwsCommandPlan, result: { ok: boolean; dryRun: boolean }) {
  await rememberCommand(ctx, runCtx.companyId, {
    service: plan.service,
    summary: plan.summary,
    mutating: plan.mutating,
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Google Workspace ${result.dryRun ? "dry-run" : "command"}: ${plan.summary}`,
    metadata: {
      service: plan.service,
      mutating: plan.mutating,
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function executePlan(ctx: PluginContext, config: GoogleWorkspaceConfig, runCtx: ToolRunContext, plan: GwsCommandPlan): Promise<ToolResult> {
  if (config.dryRun && plan.mutating) {
    const args = plan.args.includes("--dry-run") ? plan.args : [...plan.args, "--dry-run"];
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: true });
    return {
      content: `Dry run prepared for Google Workspace: ${plan.summary}. gws was not executed.`,
      data: {
        service: plan.service,
        summary: plan.summary,
        dryRun: true,
        command: [config.gwsBinaryPath, ...args],
        result: null,
        truncated: false,
      },
    };
  }

  try {
    const result = await runGwsCommand(config, plan);
    const data = summarizeGwsResult(result);
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: result.dryRun });
    return {
      content: result.dryRun && plan.mutating
        ? `Dry run prepared for Google Workspace: ${plan.summary}.`
        : `Google Workspace command completed: ${plan.summary}.`,
      data: {
        service: plan.service,
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

function gmailSearch(params: ToolParams) {
  return buildGwsCommand({
    service: "gmail",
    parts: ["users", "messages", "list"],
    params: {
      userId: "me",
      q: requireString(params, "query"),
      maxResults: numberParam(params, "maxResults", 10, 1, 100),
    },
    summary: "search Gmail messages",
  });
}

function gmailRead(params: ToolParams) {
  return buildGwsCommand({
    service: "gmail",
    parts: ["users", "messages", "get"],
    params: {
      userId: "me",
      id: requireString(params, "messageId"),
      format: stringParam(params, "format", "metadata"),
    },
    summary: "read Gmail message",
  });
}

function gmailSend(params: ToolParams) {
  return buildGwsCommand({
    service: "gmail",
    parts: ["+send"],
    params: {
      to: requireString(params, "to"),
      subject: requireString(params, "subject"),
      body: requireString(params, "body"),
      cc: stringParam(params, "cc") || undefined,
    },
    mutating: true,
    summary: "send Gmail message",
  });
}

function gmailReply(params: ToolParams) {
  return buildGwsCommand({
    service: "gmail",
    parts: ["+reply"],
    params: {
      messageId: requireString(params, "messageId"),
      body: requireString(params, "body"),
    },
    mutating: true,
    summary: "reply to Gmail message",
  });
}

function calendarAgenda(params: ToolParams) {
  return buildGwsCommand({
    service: "calendar",
    parts: ["+agenda"],
    params: {
      calendarId: stringParam(params, "calendarId", "primary"),
      days: numberParam(params, "days", 1, 1, 31),
    },
    summary: "load Calendar agenda",
  });
}

function calendarCreateEvent(params: ToolParams) {
  return buildGwsCommand({
    service: "calendar",
    parts: ["events", "insert"],
    params: { calendarId: stringParam(params, "calendarId", "primary") },
    json: {
      summary: requireString(params, "summary"),
      description: stringParam(params, "description") || undefined,
      start: { dateTime: requireString(params, "start") },
      end: { dateTime: requireString(params, "end") },
    },
    mutating: true,
    summary: "create Calendar event",
  });
}

function calendarUpdateEvent(params: ToolParams) {
  return buildGwsCommand({
    service: "calendar",
    parts: ["events", "patch"],
    params: {
      calendarId: stringParam(params, "calendarId", "primary"),
      eventId: requireString(params, "eventId"),
    },
    json: jsonObject(params.patch),
    mutating: true,
    summary: "update Calendar event",
  });
}

function calendarDeleteEvent(params: ToolParams) {
  return buildGwsCommand({
    service: "calendar",
    parts: ["events", "delete"],
    params: {
      calendarId: stringParam(params, "calendarId", "primary"),
      eventId: requireString(params, "eventId"),
    },
    mutating: true,
    summary: "delete Calendar event",
  });
}

function driveSearch(params: ToolParams) {
  return buildGwsCommand({
    service: "drive",
    parts: ["files", "list"],
    params: {
      q: requireString(params, "query"),
      pageSize: numberParam(params, "pageSize", 10, 1, 100),
      fields: "files(id,name,mimeType,webViewLink,modifiedTime)",
    },
    summary: "search Drive files",
  });
}

function driveUpload(params: ToolParams) {
  return buildGwsCommand({
    service: "drive",
    parts: ["files", "create"],
    json: {
      name: stringParam(params, "name") || undefined,
      parents: stringParam(params, "parentId") ? [stringParam(params, "parentId")] : undefined,
    },
    extraArgs: ["--upload", requireString(params, "filePath")],
    mutating: true,
    summary: `upload Drive file ${requireString(params, "filePath")}`,
  });
}

function driveShare(params: ToolParams) {
  return buildGwsCommand({
    service: "drive",
    parts: ["permissions", "create"],
    params: { fileId: requireString(params, "fileId") },
    json: {
      type: "user",
      role: stringParam(params, "role", "reader"),
      emailAddress: requireString(params, "emailAddress"),
    },
    mutating: true,
    summary: "share Drive file",
  });
}

function docsCreate(params: ToolParams) {
  return buildGwsCommand({
    service: "docs",
    parts: ["documents", "create"],
    json: { title: requireString(params, "title") },
    mutating: true,
    summary: "create Google Doc",
  });
}

function docsAppendText(params: ToolParams) {
  return buildGwsCommand({
    service: "docs",
    parts: ["documents", "batchUpdate"],
    params: { documentId: requireString(params, "documentId") },
    json: {
      requests: [{
        insertText: {
          location: { index: numberParam(params, "index", 1, 1, 1_000_000) },
          text: requireString(params, "text"),
        },
      }],
    },
    mutating: true,
    summary: "append text to Google Doc",
  });
}

function sheetsReadRange(params: ToolParams) {
  return buildGwsCommand({
    service: "sheets",
    parts: ["spreadsheets", "values", "get"],
    params: { spreadsheetId: requireString(params, "spreadsheetId"), range: requireString(params, "range") },
    summary: "read Sheets range",
  });
}

function sheetsAppendRows(params: ToolParams) {
  return buildGwsCommand({
    service: "sheets",
    parts: ["spreadsheets", "values", "append"],
    params: {
      spreadsheetId: requireString(params, "spreadsheetId"),
      range: requireString(params, "range"),
      valueInputOption: stringParam(params, "valueInputOption", "USER_ENTERED"),
    },
    json: { values: Array.isArray(params.values) ? params.values : [] },
    mutating: true,
    summary: "append rows to Sheet",
  });
}

function chatSendMessage(params: ToolParams) {
  return buildGwsCommand({
    service: "chat",
    parts: ["spaces", "messages", "create"],
    params: { parent: requireString(params, "parent") },
    json: { text: requireString(params, "text") },
    mutating: true,
    summary: "send Google Chat message",
  });
}

const builders: Record<string, (params: ToolParams) => GwsCommandPlan> = {
  [TOOL_NAMES.gmailSearch]: gmailSearch,
  [TOOL_NAMES.gmailRead]: gmailRead,
  [TOOL_NAMES.gmailSend]: gmailSend,
  [TOOL_NAMES.gmailReply]: gmailReply,
  [TOOL_NAMES.calendarAgenda]: calendarAgenda,
  [TOOL_NAMES.calendarCreateEvent]: calendarCreateEvent,
  [TOOL_NAMES.calendarUpdateEvent]: calendarUpdateEvent,
  [TOOL_NAMES.calendarDeleteEvent]: calendarDeleteEvent,
  [TOOL_NAMES.driveSearch]: driveSearch,
  [TOOL_NAMES.driveUpload]: driveUpload,
  [TOOL_NAMES.driveShare]: driveShare,
  [TOOL_NAMES.docsCreate]: docsCreate,
  [TOOL_NAMES.docsAppendText]: docsAppendText,
  [TOOL_NAMES.sheetsReadRange]: sheetsReadRange,
  [TOOL_NAMES.sheetsAppendRows]: sheetsAppendRows,
  [TOOL_NAMES.chatSendMessage]: chatSendMessage,
};

async function registerToolHandlers(ctx: PluginContext) {
  for (const [name, builder] of Object.entries(builders)) {
    ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (params, runCtx) => {
      const config = await getConfig(ctx);
      const plan = builder(asObject(params));
      return executePlan(ctx, config, runCtx, plan);
    });
  }

  ctx.tools.register(TOOL_NAMES.runGwsCommand, {
    displayName: "Run gws Command",
    description: "Run a governed raw gws service/resource/method command.",
    parametersSchema: { type: "object" },
  }, async (params, runCtx) => {
    const config = await getConfig(ctx);
    if (!config.enableRawGwsTool) return { error: "Raw gws tool is disabled in plugin settings." };
    const payload = asObject(params);
    const service = requireString(payload, "service");
    if (!isServiceAllowed(config, service)) return { error: `Service "${service}" is not allowed.` };
    const plan = buildRawGwsCommand({
      service,
      resource: stringParam(payload, "resource") || undefined,
      method: requireString(payload, "method"),
      params: payload.params,
      json: payload.json,
      dryRun: typeof payload.dryRun === "boolean" ? payload.dryRun : undefined,
    });
    return executePlan(ctx, config, runCtx, plan);
  });
}

async function registerDataHandlers(ctx: PluginContext) {
  ctx.data.register(DATA_KEYS.status, async () => {
    const { config, errors, warnings } = validateConfig(await ctx.config.get());
    let installed = false;
    let version: string | null = null;
    let installError: string | null = null;
    try {
      const result = await execFileAsync(config.gwsBinaryPath, ["--version"], { timeout: 5000 });
      installed = true;
      version = (result.stdout || result.stderr).trim() || null;
    } catch (err) {
      installError = err instanceof Error ? err.message : String(err);
    }
    return {
      pluginId: PLUGIN_ID,
      version: PLUGIN_VERSION,
      gws: { installed, version, installError },
      dryRun: config.dryRun,
      rawEnabled: config.enableRawGwsTool,
      allowedServices: config.allowedServices,
      gwsConfigDir: config.gwsConfigDir || null,
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
    ctx.logger.info("Google Workspace plugin setup complete");
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
    return { status: "ok", message: "Google Workspace plugin worker is running." };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
