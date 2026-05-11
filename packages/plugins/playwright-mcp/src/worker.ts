import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, RAW_TOOL_NAME } from "./constants.js";
import {
  PlaywrightMcpClient,
  normalizeConfig,
  validateConfig,
  type McpCallResult,
  type McpToolInfo,
  type PlaywrightMcpConfig,
} from "./mcp-runner.js";
import { ALL_TOOL_NAMES, PLAYWRIGHT_TOOLS } from "./tool-definitions.js";

type ToolParams = Record<string, unknown>;
type ClientLike = {
  listTools(): Promise<McpToolInfo[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult>;
  close(): Promise<void>;
};

const COMMAND_HISTORY_KEY = "recent-browser-commands";

function asObject(value: unknown): ToolParams {
  return typeof value === "object" && value !== null ? value as ToolParams : {};
}

function stringParam(params: ToolParams, key: string, fallback = "") {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  toolName: string;
  url?: string;
  ok: boolean;
  isError: boolean;
  truncated: boolean;
  runId?: string;
  agentId?: string;
}) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
  const list = Array.isArray(existing) ? existing : [];
  const next = [{ ...input, createdAt: new Date().toISOString() }, ...list].slice(0, 50);
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY }, next);
}

async function auditCommand(ctx: PluginContext, runCtx: ToolRunContext, input: {
  toolName: string;
  params: ToolParams;
  ok: boolean;
  isError: boolean;
  truncated: boolean;
}) {
  const url = stringParam(input.params, "url") || stringParam(input.params, "origin") || undefined;
  await rememberCommand(ctx, runCtx.companyId, {
    toolName: input.toolName,
    url,
    ok: input.ok,
    isError: input.isError,
    truncated: input.truncated,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Playwright MCP browser tool: ${input.toolName}`,
    metadata: {
      toolName: input.toolName,
      url,
      ok: input.ok,
      isError: input.isError,
      truncated: input.truncated,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

function summarizeContent(content: unknown[]) {
  return content.map((item) => {
    if (typeof item !== "object" || item === null) return item;
    const entry = item as Record<string, unknown>;
    if (entry.type === "image") {
      return {
        type: "image",
        mimeType: typeof entry.mimeType === "string" ? entry.mimeType : null,
        dataBytes: typeof entry.data === "string" ? Buffer.byteLength(entry.data, "base64") : null,
      };
    }
    return entry;
  });
}

async function executeMcpTool(
  ctx: PluginContext,
  client: ClientLike,
  runCtx: ToolRunContext,
  toolName: string,
  params: ToolParams,
): Promise<ToolResult> {
  try {
    const result = await client.callTool(toolName, params);
    await auditCommand(ctx, runCtx, {
      toolName,
      params,
      ok: !result.isError,
      isError: result.isError === true,
      truncated: result.truncated,
    });
    if (result.isError) {
      return { error: result.text || `Playwright MCP tool "${toolName}" returned an error.` };
    }
    return {
      content: result.text || `Playwright MCP tool completed: ${toolName}.`,
      data: {
        toolName,
        structuredContent: result.structuredContent ?? null,
        content: summarizeContent(result.content),
        truncated: result.truncated,
      },
    };
  } catch (err) {
    await auditCommand(ctx, runCtx, {
      toolName,
      params,
      ok: false,
      isError: true,
      truncated: false,
    });
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export function createPlaywrightMcpPlugin(clientFactory?: (getConfig: () => Promise<PlaywrightMcpConfig>) => ClientLike) {
  let client: ClientLike | null = null;

  function getClient(ctx: PluginContext) {
    if (!client) {
      const configGetter = () => getConfig(ctx);
      client = clientFactory ? clientFactory(configGetter) : new PlaywrightMcpClient(configGetter);
    }
    return client;
  }

  async function registerToolHandlers(ctx: PluginContext) {
    for (const tool of PLAYWRIGHT_TOOLS) {
      ctx.tools.register(tool.name, {
        displayName: tool.displayName,
        description: tool.description,
        parametersSchema: { type: "object" },
      }, async (params, runCtx) => executeMcpTool(ctx, getClient(ctx), runCtx, tool.name, asObject(params)));
    }

    ctx.tools.register(RAW_TOOL_NAME, {
      displayName: "Browser Call MCP Tool",
      description: "Call any discovered Playwright MCP tool by name.",
      parametersSchema: { type: "object" },
    }, async (params, runCtx) => {
      const payload = asObject(params);
      const toolName = stringParam(payload, "toolName");
      if (!toolName) return { error: "toolName is required." };
      const discovered = await getClient(ctx).listTools();
      const discoveredNames = new Set(discovered.map((tool) => tool.name));
      if (!discoveredNames.has(toolName) && !ALL_TOOL_NAMES.includes(toolName)) {
        return { error: `Playwright MCP tool "${toolName}" was not discovered.` };
      }
      return executeMcpTool(ctx, getClient(ctx), runCtx, toolName, asObject(payload.arguments));
    });
  }

  async function registerDataHandlers(ctx: PluginContext) {
    ctx.data.register(DATA_KEYS.status, async () => {
      const { config, errors, warnings } = validateConfig(await ctx.config.get());
      let connected = false;
      let discoveredTools: McpToolInfo[] = [];
      let connectError: string | null = null;
      if (config.checkConnectionOnStatus) {
        try {
          discoveredTools = await getClient(ctx).listTools();
          connected = true;
        } catch (err) {
          connectError = err instanceof Error ? err.message : String(err);
        }
      }
      return {
        pluginId: PLUGIN_ID,
        version: PLUGIN_VERSION,
        connected,
        connectError,
        command: config.command,
        args: config.args,
        headless: config.headless,
        browser: config.browser || null,
        caps: config.caps,
        allowedOrigins: config.allowedOrigins,
        blockedOrigins: config.blockedOrigins,
        checkConnectionOnStatus: config.checkConnectionOnStatus,
        discoveredToolCount: discoveredTools.length,
        expectedToolCount: PLAYWRIGHT_TOOLS.length + 1,
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

  return definePlugin({
    async setup(ctx) {
      await registerDataHandlers(ctx);
      await registerToolHandlers(ctx);
      ctx.logger.info("Playwright MCP plugin setup complete");
    },

    async onValidateConfig(config) {
      const result = validateConfig(config);
      return {
        ok: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings,
      };
    },

    async onConfigChanged() {
      await client?.close();
      client = null;
    },

    async onShutdown() {
      await client?.close();
      client = null;
    },

    async onHealth() {
      return { status: "ok", message: "Playwright MCP plugin worker is running." };
    },
  });
}

const plugin = createPlaywrightMcpPlugin();
export default plugin;
runWorker(plugin, import.meta.url);
