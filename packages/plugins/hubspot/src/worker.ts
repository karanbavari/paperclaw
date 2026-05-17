import { definePlugin, runWorker, type PluginContext, type ToolResult, type ToolRunContext } from "@kesarcloud/plugin-sdk";
import { ACTION_KEYS, DATA_KEYS, DEFAULT_SCOPES, PLUGIN_VERSION, TOOL_NAMES } from "./constants.js";
import { createHubSpotAuthorizationUrl, createOauthState } from "./oauth.js";
import { HubSpotClient, isConnected, normalizeConfig, summarizeResult, validateConfig, type HubSpotConfig, type HubSpotRequestPlan } from "./hubspot-client.js";

type Params = Record<string, unknown>;

const COMMAND_HISTORY_KEY = "recent-commands";
const API_PATH_ALLOWLIST = [
  "/crm/v3/objects/",
  "/crm/v3/properties/",
  "/crm/v3/owners",
  "/crm/v3/pipelines/",
  "/crm/v4/objects/",
];

const ALIASES: Record<string, { objectType: string; action: "list" | "search" | "get" | "create" | "update" | "archive" }> = {
  [TOOL_NAMES.contactsList]: { objectType: "contacts", action: "list" },
  [TOOL_NAMES.contactsSearch]: { objectType: "contacts", action: "search" },
  [TOOL_NAMES.contactGet]: { objectType: "contacts", action: "get" },
  [TOOL_NAMES.contactCreate]: { objectType: "contacts", action: "create" },
  [TOOL_NAMES.contactUpdate]: { objectType: "contacts", action: "update" },
  [TOOL_NAMES.contactArchive]: { objectType: "contacts", action: "archive" },
  [TOOL_NAMES.companiesList]: { objectType: "companies", action: "list" },
  [TOOL_NAMES.companiesSearch]: { objectType: "companies", action: "search" },
  [TOOL_NAMES.companyGet]: { objectType: "companies", action: "get" },
  [TOOL_NAMES.companyCreate]: { objectType: "companies", action: "create" },
  [TOOL_NAMES.companyUpdate]: { objectType: "companies", action: "update" },
  [TOOL_NAMES.companyArchive]: { objectType: "companies", action: "archive" },
  [TOOL_NAMES.dealsList]: { objectType: "deals", action: "list" },
  [TOOL_NAMES.dealsSearch]: { objectType: "deals", action: "search" },
  [TOOL_NAMES.dealGet]: { objectType: "deals", action: "get" },
  [TOOL_NAMES.dealCreate]: { objectType: "deals", action: "create" },
  [TOOL_NAMES.dealUpdate]: { objectType: "deals", action: "update" },
  [TOOL_NAMES.dealArchive]: { objectType: "deals", action: "archive" },
  [TOOL_NAMES.ticketsList]: { objectType: "tickets", action: "list" },
  [TOOL_NAMES.ticketsSearch]: { objectType: "tickets", action: "search" },
  [TOOL_NAMES.ticketGet]: { objectType: "tickets", action: "get" },
  [TOOL_NAMES.ticketCreate]: { objectType: "tickets", action: "create" },
  [TOOL_NAMES.ticketUpdate]: { objectType: "tickets", action: "update" },
  [TOOL_NAMES.ticketArchive]: { objectType: "tickets", action: "archive" },
  [TOOL_NAMES.noteCreate]: { objectType: "notes", action: "create" },
  [TOOL_NAMES.noteGet]: { objectType: "notes", action: "get" },
  [TOOL_NAMES.noteUpdate]: { objectType: "notes", action: "update" },
  [TOOL_NAMES.noteArchive]: { objectType: "notes", action: "archive" },
  [TOOL_NAMES.taskCreate]: { objectType: "tasks", action: "create" },
  [TOOL_NAMES.taskGet]: { objectType: "tasks", action: "get" },
  [TOOL_NAMES.taskUpdate]: { objectType: "tasks", action: "update" },
  [TOOL_NAMES.taskArchive]: { objectType: "tasks", action: "archive" },
};

function asObject(value: unknown): Params {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function stringParam(params: Params, key: string, fallback = "") {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function requireString(params: Params, key: string) {
  const value = stringParam(params, key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function numberParam(params: Params, key: string, fallback?: number) {
  const value = typeof params[key] === "number" ? params[key] as number : Number.parseInt(String(params[key] ?? ""), 10);
  return Number.isFinite(value) ? Math.floor(value) : fallback;
}

function boolParam(params: Params, key: string, fallback?: boolean) {
  return typeof params[key] === "boolean" ? params[key] as boolean : fallback;
}

function jsonObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function arrayParam(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function stringArrayParam(params: Params, key: string) {
  return arrayParam(params[key]).map((entry) => String(entry).trim()).filter(Boolean);
}

function compact(value: Params) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

function csv(values: string[]) {
  return values.length ? values.join(",") : undefined;
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

function assertCompanyConnected(config: HubSpotConfig, companyId: string) {
  if (!isConnected(config)) throw new Error("HubSpot is not connected.");
  if (config.connectedCompanyId && config.connectedCompanyId !== companyId) {
    throw new Error("HubSpot is connected for a different PaperClaw company.");
  }
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  operation: string;
  mutating: boolean;
  dryRun: boolean;
  ok: boolean;
  runId?: string;
  agentId?: string;
}) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
  const list = Array.isArray(existing) ? existing : [];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY }, [{
    ...input,
    createdAt: new Date().toISOString(),
  }, ...list].slice(0, 50));
}

async function audit(ctx: PluginContext, runCtx: ToolRunContext, plan: HubSpotRequestPlan, result: { ok: boolean; dryRun: boolean }) {
  await rememberCommand(ctx, runCtx.companyId, {
    operation: plan.operation,
    mutating: Boolean(plan.mutating),
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `HubSpot ${result.dryRun ? "dry-run" : "request"}: ${plan.operation}`,
    metadata: {
      operation: plan.operation,
      method: plan.method,
      path: plan.path,
      mutating: Boolean(plan.mutating),
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function executePlan(ctx: PluginContext, runCtx: ToolRunContext, plan: HubSpotRequestPlan): Promise<ToolResult> {
  const config = await getConfig(ctx);
  assertCompanyConnected(config, runCtx.companyId);

  if (config.dryRun && plan.mutating) {
    await audit(ctx, runCtx, plan, { ok: true, dryRun: true });
    return {
      content: `Dry run prepared for HubSpot: ${plan.operation}. HubSpot was not changed.`,
      data: {
        operation: plan.operation,
        method: plan.method,
        path: plan.path,
        query: plan.query ?? null,
        body: plan.body ?? null,
        dryRun: true,
      },
    };
  }

  try {
    const client = new HubSpotClient(ctx, config);
    const response = await client.request(plan, runCtx.companyId);
    await audit(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `HubSpot request completed: ${plan.operation}.`,
      data: summarizeResult(response, config.maxOutputBytes),
    };
  } catch (error) {
    await audit(ctx, runCtx, plan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function objectPath(objectType: string, objectId?: string) {
  const base = `/crm/v3/objects/${encodeURIComponent(objectType)}`;
  return objectId ? `${base}/${encodeURIComponent(objectId)}` : base;
}

function listQuery(params: Params) {
  return compact({
    limit: numberParam(params, "limit"),
    after: stringParam(params, "after"),
    properties: csv(stringArrayParam(params, "properties")),
    associations: csv(stringArrayParam(params, "associations")),
    archived: boolParam(params, "archived"),
  });
}

function getQuery(params: Params) {
  return compact({
    properties: csv(stringArrayParam(params, "properties")),
    associations: csv(stringArrayParam(params, "associations")),
    archived: boolParam(params, "archived"),
    idProperty: stringParam(params, "idProperty"),
  });
}

function searchBody(params: Params) {
  return compact({
    filterGroups: arrayParam(params.filterGroups).length ? arrayParam(params.filterGroups) : undefined,
    sorts: arrayParam(params.sorts).length ? arrayParam(params.sorts) : undefined,
    properties: stringArrayParam(params, "properties").length ? stringArrayParam(params, "properties") : undefined,
    query: stringParam(params, "query") || undefined,
    limit: numberParam(params, "limit"),
    after: stringParam(params, "after") || undefined,
  });
}

function recordBody(params: Params) {
  return compact({
    properties: jsonObject(params.properties),
    associations: arrayParam(params.associations).length ? arrayParam(params.associations) : undefined,
  });
}

function batchBody(params: Params, action: "read" | "create" | "update" | "archive") {
  if (action === "read") {
    return compact({
      properties: stringArrayParam(params, "properties").length ? stringArrayParam(params, "properties") : undefined,
      idProperty: stringParam(params, "idProperty") || undefined,
      inputs: arrayParam(params.inputs),
    });
  }
  return { inputs: arrayParam(params.inputs) };
}

function objectPlan(action: "list" | "search" | "get" | "create" | "update" | "archive", objectType: string, params: Params): HubSpotRequestPlan {
  const objectId = stringParam(params, "objectId");
  if (action === "list") {
    return { operation: `list ${objectType}`, method: "GET", path: objectPath(objectType), query: listQuery(params) };
  }
  if (action === "search") {
    return { operation: `search ${objectType}`, method: "POST", path: `${objectPath(objectType)}/search`, body: searchBody(params) };
  }
  if (action === "get") {
    return { operation: `get ${objectType}`, method: "GET", path: objectPath(objectType, requireString({ objectId }, "objectId")), query: getQuery(params) };
  }
  if (action === "create") {
    return { operation: `create ${objectType}`, method: "POST", path: objectPath(objectType), body: recordBody(params), mutating: true };
  }
  if (action === "update") {
    return {
      operation: `update ${objectType}`,
      method: "PATCH",
      path: objectPath(objectType, requireString({ objectId }, "objectId")),
      query: compact({ idProperty: stringParam(params, "idProperty") }),
      body: { properties: jsonObject(params.properties) },
      mutating: true,
    };
  }
  return { operation: `archive ${objectType}`, method: "DELETE", path: objectPath(objectType, requireString({ objectId }, "objectId")), mutating: true };
}

function planFor(name: string, params: Params, config: HubSpotConfig): HubSpotRequestPlan {
  const alias = ALIASES[name];
  if (alias) return objectPlan(alias.action, alias.objectType, params);
  if (name === TOOL_NAMES.objectList) return objectPlan("list", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.objectSearch) return objectPlan("search", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.objectGet) return objectPlan("get", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.objectCreate) return objectPlan("create", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.objectUpdate) return objectPlan("update", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.objectArchive) return objectPlan("archive", requireString(params, "objectType"), params);
  if (name === TOOL_NAMES.batchRead) return { operation: "batch read objects", method: "POST", path: `${objectPath(requireString(params, "objectType"))}/batch/read`, body: batchBody(params, "read") };
  if (name === TOOL_NAMES.batchCreate) return { operation: "batch create objects", method: "POST", path: `${objectPath(requireString(params, "objectType"))}/batch/create`, body: batchBody(params, "create"), mutating: true };
  if (name === TOOL_NAMES.batchUpdate) return { operation: "batch update objects", method: "POST", path: `${objectPath(requireString(params, "objectType"))}/batch/update`, body: batchBody(params, "update"), mutating: true };
  if (name === TOOL_NAMES.batchArchive) return { operation: "batch archive objects", method: "POST", path: `${objectPath(requireString(params, "objectType"))}/batch/archive`, body: batchBody(params, "archive"), mutating: true };
  if (name === TOOL_NAMES.propertiesList) return { operation: "list properties", method: "GET", path: `/crm/v3/properties/${encodeURIComponent(requireString(params, "objectType"))}`, query: compact({ archived: boolParam(params, "archived") }) };
  if (name === TOOL_NAMES.propertyGet) return { operation: "get property", method: "GET", path: `/crm/v3/properties/${encodeURIComponent(requireString(params, "objectType"))}/${encodeURIComponent(requireString(params, "propertyName"))}`, query: compact({ archived: boolParam(params, "archived") }) };
  if (name === TOOL_NAMES.propertyCreate) return { operation: "create property", method: "POST", path: `/crm/v3/properties/${encodeURIComponent(requireString(params, "objectType"))}`, body: jsonObject(params.property), mutating: true };
  if (name === TOOL_NAMES.propertyUpdate) return { operation: "update property", method: "PATCH", path: `/crm/v3/properties/${encodeURIComponent(requireString(params, "objectType"))}/${encodeURIComponent(requireString(params, "propertyName"))}`, body: jsonObject(params.patch), mutating: true };
  if (name === TOOL_NAMES.ownersList) return { operation: "list owners", method: "GET", path: "/crm/v3/owners", query: compact({ email: stringParam(params, "email"), after: stringParam(params, "after"), limit: numberParam(params, "limit"), archived: boolParam(params, "archived") }) };
  if (name === TOOL_NAMES.pipelinesList) return { operation: "list pipelines", method: "GET", path: `/crm/v3/pipelines/${encodeURIComponent(requireString(params, "objectType"))}` };
  if (name === TOOL_NAMES.pipelineGet) return { operation: "get pipeline", method: "GET", path: `/crm/v3/pipelines/${encodeURIComponent(requireString(params, "objectType"))}/${encodeURIComponent(requireString(params, "pipelineId"))}` };
  if (name === TOOL_NAMES.associationsList) return { operation: "list associations", method: "GET", path: `/crm/v4/objects/${encodeURIComponent(requireString(params, "fromObjectType"))}/${encodeURIComponent(requireString(params, "fromObjectId"))}/associations/${encodeURIComponent(requireString(params, "toObjectType"))}`, query: compact({ after: stringParam(params, "after"), limit: numberParam(params, "limit") }) };
  if (name === TOOL_NAMES.associationCreateDefault) return { operation: "create default association", method: "PUT", path: `/crm/v4/objects/${encodeURIComponent(requireString(params, "fromObjectType"))}/${encodeURIComponent(requireString(params, "fromObjectId"))}/associations/default/${encodeURIComponent(requireString(params, "toObjectType"))}/${encodeURIComponent(requireString(params, "toObjectId"))}`, mutating: true };
  if (name === TOOL_NAMES.associationCreateLabeled) return { operation: "create labeled association", method: "PUT", path: `/crm/v4/objects/${encodeURIComponent(requireString(params, "fromObjectType"))}/${encodeURIComponent(requireString(params, "fromObjectId"))}/associations/${encodeURIComponent(requireString(params, "toObjectType"))}/${encodeURIComponent(requireString(params, "toObjectId"))}`, body: arrayParam(params.associationTypes), mutating: true };
  if (name === TOOL_NAMES.associationRemove) return { operation: "remove association", method: "DELETE", path: `/crm/v4/objects/${encodeURIComponent(requireString(params, "fromObjectType"))}/${encodeURIComponent(requireString(params, "fromObjectId"))}/associations/${encodeURIComponent(requireString(params, "toObjectType"))}/${encodeURIComponent(requireString(params, "toObjectId"))}`, mutating: true };
  if (name === TOOL_NAMES.apiRequest) {
    if (!config.enableRawApiTool) throw new Error("hubspot.apiRequest is disabled in plugin settings.");
    const method = requireString(params, "method").toUpperCase();
    if (!["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) throw new Error("method must be GET, POST, PATCH, PUT, or DELETE");
    const path = requireString(params, "path");
    if (!API_PATH_ALLOWLIST.some((prefix) => path.startsWith(prefix))) {
      throw new Error("path is outside the HubSpot CRM allowlist.");
    }
    return {
      operation: "custom HubSpot API request",
      method: method as HubSpotRequestPlan["method"],
      path,
      query: jsonObject(params.query),
      body: method === "GET" ? undefined : jsonObject(params.body),
      mutating: method !== "GET",
    };
  }
  throw new Error(`Unknown HubSpot tool: ${name}`);
}

function registerTool(ctx: PluginContext, name: string) {
  ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
    const params = asObject(rawParams);
    const config = await getConfig(ctx);
    let plan: HubSpotRequestPlan;
    try {
      plan = planFor(name, params, config);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
    return executePlan(ctx, runCtx, plan);
  });
}

const plugin = definePlugin({
  async setup(ctx) {
    for (const tool of Object.values(TOOL_NAMES)) registerTool(ctx, tool);

    ctx.data.register(DATA_KEYS.status, async (params) => {
      const { config, errors, warnings } = validateConfig(await ctx.config.get());
      const companyId = stringParam(params, "companyId");
      const companyMatches = !config.connectedCompanyId || !companyId || config.connectedCompanyId === companyId;
      return {
        version: PLUGIN_VERSION,
        connected: isConnected(config) && companyMatches,
        authMode: config.authMode,
        connectedCompanyId: config.connectedCompanyId || null,
        connectedAt: config.connectedAt || null,
        portalId: config.portalId || null,
        dryRun: config.dryRun,
        enableRawApiTool: config.enableRawApiTool,
        scopes: config.enabledScopes,
        redirectUri: config.redirectUri || null,
        errors,
        warnings: companyMatches ? warnings : [...warnings, "HubSpot is connected for a different PaperClaw company."],
      };
    });

    ctx.data.register(DATA_KEYS.recentCommands, async (params) => {
      const companyId = stringParam(params, "companyId");
      if (!companyId) return { commands: [] };
      const commands = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
      return { commands: Array.isArray(commands) ? commands : [] };
    });

    ctx.actions.register(ACTION_KEYS.savePrivateAccessToken, async (params) => {
      const companyId = requireString(params, "companyId");
      const value = requireString(params, "privateAccessToken");
      return ctx.secrets.upsert({
        companyId,
        name: "hubspot-private-access-token",
        value,
        description: "HubSpot private app access token for the HubSpot plugin.",
      });
    });

    ctx.actions.register(ACTION_KEYS.saveClientSecret, async (params) => {
      const companyId = requireString(params, "companyId");
      const value = requireString(params, "clientSecret");
      return ctx.secrets.upsert({
        companyId,
        name: "hubspot-client-secret",
        value,
        description: "HubSpot OAuth client secret for the HubSpot plugin.",
      });
    });

    ctx.actions.register(ACTION_KEYS.startOauth, async (params) => {
      const config = normalizeConfig({ ...await ctx.config.get(), ...params, authMode: "oauth" });
      if (!config.clientId) throw new Error("HubSpot OAuth Client ID is required.");
      const redirectUri = stringParam(params, "redirectUri", config.redirectUri);
      if (!redirectUri) throw new Error("Redirect URI is required.");
      const state = createOauthState();
      return {
        authorizationUrl: createHubSpotAuthorizationUrl({
          clientId: config.clientId,
          redirectUri,
          state,
          scopes: config.enabledScopes.length ? config.enabledScopes : [...DEFAULT_SCOPES],
        }),
        state,
        redirectUri,
      };
    });

    ctx.actions.register(ACTION_KEYS.completeOauth, async (params) => {
      const companyId = requireString(params, "companyId");
      const config = normalizeConfig({ ...await ctx.config.get(), ...params, authMode: "oauth" });
      if (!config.clientSecretRef) throw new Error("HubSpot OAuth Client Secret Reference is required.");
      const client = new HubSpotClient(ctx, config);
      const token = await client.exchangeCode({
        code: requireString(params, "code"),
        redirectUri: requireString(params, "redirectUri"),
      });
      if (!token.refresh_token) throw new Error("HubSpot did not return a refresh token.");
      const secret = await ctx.secrets.upsert({
        companyId,
        name: "hubspot-refresh-token",
        value: token.refresh_token,
        description: "HubSpot OAuth refresh token for the HubSpot plugin.",
      });
      let portalId = "";
      if (token.access_token) {
        try {
          const details = await client.requestWithAccessToken({ operation: "get OAuth token details", method: "GET", path: `/oauth/v1/access-tokens/${encodeURIComponent(token.access_token)}` }, token.access_token);
          const payload = details.payload as { hub_id?: number | string; hubId?: number | string } | null;
          portalId = String(payload?.hub_id ?? payload?.hubId ?? "");
        } catch {
          portalId = "";
        }
      }
      return {
        refreshTokenSecretRef: secret.secretRef,
        portalId,
        expiresIn: token.expires_in ?? null,
        tokenType: token.token_type ?? "Bearer",
      };
    });

    ctx.actions.register(ACTION_KEYS.disconnect, async (params) => {
      const companyId = stringParam(params, "companyId");
      if (companyId) {
        await ctx.state.delete({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
      }
      return { ok: true };
    });
  },

  async onValidateConfig(config) {
    const validation = validateConfig(config);
    return {
      ok: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
