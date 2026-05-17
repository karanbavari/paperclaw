import { randomBytes } from "node:crypto";
import type { PaperClawPluginManifestV1, PluginContext, ToolResult, ToolRunContext } from "@kesarcloud/plugin-sdk";
import { definePlugin, runWorker } from "@kesarcloud/plugin-sdk";
import { productivityActionKeys, productivityDataKeys, type ProductivityDefinition, type ProductivityAuthMode, type ProductivityEndpoint } from "./shared.js";

export { productivityActionKeys, productivityDataKeys, type ProductivityDefinition, type ProductivityEndpoint } from "./shared.js";

export type ProductivityConfig = {
  authMode: ProductivityAuthMode;
  accessTokenSecretRef: string;
  clientId: string;
  clientSecretRef: string;
  refreshTokenSecretRef: string;
  connectedCompanyId: string;
  connectedAt: string;
  connectedAccountId: string;
  redirectUri: string;
  enabledScopes: string[];
  dryRun: boolean;
  enableRawApiTool: boolean;
  requestTimeoutMs: number;
  maxOutputBytes: number;
};

export type ProductivityRequestPlan = {
  operation: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  mutating?: boolean;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

type Params = Record<string, unknown>;

const COMMAND_HISTORY_KEY = "recent-commands";

export function dataKey(definition: ProductivityDefinition, suffix: string) {
  return `${definition.routePath}.${suffix}`;
}

function base64Url(input: Buffer) {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function oauthState() {
  return base64Url(randomBytes(24));
}

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

function arrayParam(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function stringArrayParam(params: Params, key: string) {
  return arrayParam(params[key]).map((entry) => String(entry).trim()).filter(Boolean);
}

function jsonObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function compact(value: Params) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function normalizeConfig(definition: ProductivityDefinition, raw: Record<string, unknown>): ProductivityConfig {
  return {
    authMode: raw.authMode === "oauth" ? "oauth" : "token",
    accessTokenSecretRef: typeof raw.accessTokenSecretRef === "string" ? raw.accessTokenSecretRef.trim() : "",
    clientId: typeof raw.clientId === "string" ? raw.clientId.trim() : "",
    clientSecretRef: typeof raw.clientSecretRef === "string" ? raw.clientSecretRef.trim() : "",
    refreshTokenSecretRef: typeof raw.refreshTokenSecretRef === "string" ? raw.refreshTokenSecretRef.trim() : "",
    connectedCompanyId: typeof raw.connectedCompanyId === "string" ? raw.connectedCompanyId.trim() : "",
    connectedAt: typeof raw.connectedAt === "string" ? raw.connectedAt.trim() : "",
    connectedAccountId: typeof raw.connectedAccountId === "string" ? raw.connectedAccountId.trim() : "",
    redirectUri: typeof raw.redirectUri === "string" ? raw.redirectUri.trim() : "",
    enabledScopes: Array.isArray(raw.enabledScopes) ? raw.enabledScopes.map(String).filter(Boolean) : [...definition.defaultScopes],
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : true,
    enableRawApiTool: typeof raw.enableRawApiTool === "boolean" ? raw.enableRawApiTool : false,
    requestTimeoutMs: asNumber(raw.requestTimeoutMs, 30_000, 5_000, 120_000),
    maxOutputBytes: asNumber(raw.maxOutputBytes, 80_000, 4_000, 500_000),
  };
}

function validateConfig(definition: ProductivityDefinition, raw: Record<string, unknown>) {
  const config = normalizeConfig(definition, raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (config.authMode === "token" && !config.accessTokenSecretRef) warnings.push(`${definition.displayName} access token is not configured.`);
  if (config.authMode === "oauth") {
    if (!definition.authUrl || !definition.tokenUrl) errors.push(`${definition.displayName} does not have OAuth endpoints configured.`);
    if (!config.clientId) warnings.push(`${definition.displayName} OAuth Client ID is not configured.`);
    if (!config.clientSecretRef) warnings.push(`${definition.displayName} OAuth Client Secret Reference is not configured.`);
    if (!config.refreshTokenSecretRef) warnings.push(`${definition.displayName} OAuth is not connected yet.`);
    if (!config.redirectUri) warnings.push("Redirect URI is not configured; the settings page can infer one from the current browser URL.");
  }
  if (config.dryRun) warnings.push("Dry Run is enabled. Mutating tools return planned requests without changing the external app.");
  return { config, errors, warnings };
}

function isConnected(config: ProductivityConfig) {
  return config.authMode === "oauth"
    ? Boolean(config.clientId && config.clientSecretRef && config.refreshTokenSecretRef)
    : Boolean(config.accessTokenSecretRef);
}

function toolName(definition: ProductivityDefinition, key: string) {
  return `${definition.routePath}.${key}`;
}

function manifestParameters(endpoint: ProductivityEndpoint) {
  const properties: Record<string, unknown> = {};
  for (const key of endpoint.required ?? []) properties[key] = { type: "string" };
  for (const key of endpoint.queryParams ?? []) properties[key] = { type: "string" };
  if (endpoint.bodyParam) properties[endpoint.bodyParam] = { type: "object" };
  return { type: "object", properties, required: endpoint.required ?? [] };
}

export function createProductivityManifest(definition: ProductivityDefinition): PaperClawPluginManifestV1 {
  return {
    id: definition.id,
    apiVersion: 1,
    version: definition.version,
    displayName: definition.displayName,
    description: definition.description,
    author: "PaperClaw",
    categories: ["productivity", "connector", "automation", "workspace"],
    capabilities: [
      "http.outbound",
      "secrets.read-ref",
      "secrets.write-ref",
      "agent.tools.register",
      "plugin.state.read",
      "plugin.state.write",
      "activity.log.write",
      "instance.settings.register",
      "ui.page.register",
      "ui.dashboardWidget.register",
    ],
    entrypoints: { worker: "./dist/worker.js", ui: "./dist/ui" },
    instanceConfigSchema: {
      type: "object",
      properties: {
        authMode: { type: "string", title: "Auth Mode", default: "token", enum: ["token", "oauth"] },
        accessTokenSecretRef: { type: "string", format: "secret-ref", title: `${definition.tokenLabel} Reference`, default: "" },
        clientId: { type: "string", title: `${definition.oauthLabel} Client ID`, default: "" },
        clientSecretRef: { type: "string", format: "secret-ref", title: `${definition.oauthLabel} Client Secret Reference`, default: "" },
        refreshTokenSecretRef: { type: "string", format: "secret-ref", title: `${definition.oauthLabel} Refresh Token Reference`, default: "" },
        connectedCompanyId: { type: "string", title: "Connected Company ID", default: "" },
        connectedAt: { type: "string", title: "Connected At", default: "" },
        connectedAccountId: { type: "string", title: definition.connectedLabel, default: "" },
        redirectUri: { type: "string", title: "Redirect URI", default: "" },
        enabledScopes: { type: "array", title: "OAuth Scopes", default: definition.defaultScopes, items: { type: "string" } },
        dryRun: { type: "boolean", title: "Dry Run", default: true },
        enableRawApiTool: { type: "boolean", title: "Enable Raw API Tool", default: false },
        requestTimeoutMs: { type: "number", title: "HTTP Timeout Milliseconds", default: 30_000, minimum: 5_000, maximum: 120_000 },
        maxOutputBytes: { type: "number", title: "Max Output Bytes", default: 80_000, minimum: 4_000, maximum: 500_000 },
      },
    },
    tools: [
      ...definition.endpoints.map((endpoint) => ({
        name: toolName(definition, endpoint.key),
        displayName: endpoint.displayName,
        description: endpoint.description,
        parametersSchema: manifestParameters(endpoint),
      })),
      {
        name: toolName(definition, "apiRequest"),
        displayName: `${definition.displayName} API Request`,
        description: "Run a guarded raw API request. Disabled by default.",
        parametersSchema: {
          type: "object",
          properties: { method: { type: "string" }, path: { type: "string" }, query: { type: "object" }, body: { type: "object" } },
          required: ["method", "path"],
        },
      },
    ],
    ui: {
      slots: [
        { type: "page", id: `${definition.routePath}-page`, displayName: definition.displayName, exportName: "ProductivityPage", routePath: definition.routePath, order: 70 },
        { type: "settingsPage", id: `${definition.routePath}-settings-page`, displayName: definition.displayName, exportName: "ProductivitySettingsPage", order: 70 },
        { type: "dashboardWidget", id: `${definition.routePath}-dashboard-widget`, displayName: definition.displayName, exportName: "ProductivityDashboardWidget", order: 70 },
      ],
      launchers: [{ id: `${definition.routePath}-page`, displayName: definition.displayName, placementZone: "sidebar", action: { type: "navigate", target: definition.routePath } }],
    },
  };
}

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error_description === "string") return record.error_description;
    if (typeof record.error === "string") return record.error;
    if (typeof record.detail === "string") return record.detail;
  }
  return fallback;
}

function fillPath(pathTemplate: string, params: Params) {
  return pathTemplate.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key: string) => encodeURIComponent(requireString(params, key)));
}

function buildPlan(definition: ProductivityDefinition, name: string, params: Params, config: ProductivityConfig): ProductivityRequestPlan {
  const rawTool = toolName(definition, "apiRequest");
  if (name === rawTool) {
    if (!config.enableRawApiTool) throw new Error(`${rawTool} is disabled in plugin settings.`);
    const method = requireString(params, "method").toUpperCase();
    if (!["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) throw new Error("method must be GET, POST, PATCH, PUT, or DELETE");
    const path = requireString(params, "path");
    if (!definition.rawPathPrefixes.some((prefix) => path.startsWith(prefix))) throw new Error("path is outside the plugin allowlist.");
    return {
      operation: "custom API request",
      method: method as ProductivityRequestPlan["method"],
      path,
      query: jsonObject(params.query),
      body: method === "GET" ? undefined : jsonObject(params.body),
      mutating: method !== "GET",
    };
  }
  const endpoint = definition.endpoints.find((candidate) => toolName(definition, candidate.key) === name);
  if (!endpoint) throw new Error(`Unknown ${definition.displayName} tool: ${name}`);
  const query: Record<string, unknown> = {};
  for (const key of endpoint.queryParams ?? []) {
    const arrayValue = stringArrayParam(params, key);
    query[key] = arrayValue.length ? arrayValue.join(",") : params[key];
  }
  return {
    operation: endpoint.displayName,
    method: endpoint.method,
    path: fillPath(endpoint.path, params),
    query: compact(query),
    body: endpoint.bodyParam ? jsonObject(params[endpoint.bodyParam]) : undefined,
    mutating: endpoint.mutating,
  };
}

async function tokenRequest(ctx: PluginContext, definition: ProductivityDefinition, config: ProductivityConfig, body: Record<string, string>): Promise<TokenResponse> {
  if (!definition.tokenUrl) throw new Error(`${definition.displayName} OAuth token URL is not configured.`);
  const clientSecret = await ctx.secrets.resolve(config.clientSecretRef);
  const headers: Record<string, string> = { accept: "application/json", "content-type": "application/x-www-form-urlencoded" };
  const form = { ...body };
  if (definition.tokenAuthStyle === "basic") {
    headers.authorization = `Basic ${Buffer.from(`${config.clientId}:${clientSecret}`, "utf8").toString("base64")}`;
  } else {
    form.client_id = config.clientId;
    form.client_secret = clientSecret;
  }
  const response = await ctx.http.fetch(definition.tokenUrl, {
    method: "POST",
    headers,
    body: new URLSearchParams(form).toString(),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`${definition.displayName} OAuth token request failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
  return payload as TokenResponse;
}

async function resolveAccessToken(ctx: PluginContext, definition: ProductivityDefinition, config: ProductivityConfig, companyId: string) {
  if (!isConnected(config)) throw new Error(`${definition.displayName} is not connected.`);
  if (config.authMode === "token") return ctx.secrets.resolve(config.accessTokenSecretRef);
  const refreshToken = await ctx.secrets.resolve(config.refreshTokenSecretRef);
  const token = await tokenRequest(ctx, definition, config, { grant_type: "refresh_token", refresh_token: refreshToken });
  if (token.refresh_token && token.refresh_token !== refreshToken) {
    await ctx.secrets.upsert({
      companyId,
      name: `${definition.routePath}-refresh-token`,
      value: token.refresh_token,
      description: `${definition.displayName} OAuth refresh token.`,
    });
  }
  if (!token.access_token) throw new Error(`${definition.displayName} did not return an access token.`);
  return token.access_token;
}

async function request(ctx: PluginContext, definition: ProductivityDefinition, config: ProductivityConfig, plan: ProductivityRequestPlan, companyId: string) {
  const accessToken = await resolveAccessToken(ctx, definition, config, companyId);
  const url = new URL(`${definition.apiBaseUrl.replace(/\/+$/, "")}${plan.path}`);
  for (const [key, value] of Object.entries(plan.query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  const hasBody = plan.body !== undefined;
  const response = await ctx.http.fetch(url.toString(), {
    method: plan.method,
    headers: { accept: "application/json", authorization: `Bearer ${accessToken}`, ...(hasBody ? { "content-type": "application/json" } : {}) },
    body: hasBody ? JSON.stringify(plan.body) : undefined,
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });
  const payload = await safeJson(response);
  if (!response.ok) throw new Error(`${definition.displayName} ${plan.operation} failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
  return {
    status: response.status,
    payload,
    rateLimit: {
      limit: response.headers.get("x-ratelimit-limit") ?? response.headers.get("x-rate-limit-limit"),
      remaining: response.headers.get("x-ratelimit-remaining") ?? response.headers.get("x-rate-limit-remaining"),
      reset: response.headers.get("x-ratelimit-reset") ?? response.headers.get("x-rate-limit-reset"),
      retryAfter: response.headers.get("retry-after"),
    },
  };
}

function summarize(value: unknown, maxOutputBytes: number) {
  const serialized = JSON.stringify(value);
  if (serialized.length <= maxOutputBytes) return value;
  return { payloadTruncated: true, payloadPreview: serialized.slice(0, maxOutputBytes) };
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: Params) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
  const list = Array.isArray(existing) ? existing : [];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY }, [{ ...input, createdAt: new Date().toISOString() }, ...list].slice(0, 50));
}

async function audit(ctx: PluginContext, definition: ProductivityDefinition, runCtx: ToolRunContext, plan: ProductivityRequestPlan, result: { ok: boolean; dryRun: boolean }) {
  await rememberCommand(ctx, runCtx.companyId, { operation: plan.operation, mutating: Boolean(plan.mutating), dryRun: result.dryRun, ok: result.ok, runId: runCtx.runId, agentId: runCtx.agentId });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `${definition.displayName} ${result.dryRun ? "dry-run" : "request"}: ${plan.operation}`,
    metadata: { operation: plan.operation, method: plan.method, path: plan.path, mutating: Boolean(plan.mutating), dryRun: result.dryRun, ok: result.ok, runId: runCtx.runId, agentId: runCtx.agentId },
  });
}

async function executePlan(ctx: PluginContext, definition: ProductivityDefinition, runCtx: ToolRunContext, plan: ProductivityRequestPlan): Promise<ToolResult> {
  const config = normalizeConfig(definition, await ctx.config.get());
  if (!isConnected(config)) throw new Error(`${definition.displayName} is not connected.`);
  if (config.connectedCompanyId && config.connectedCompanyId !== runCtx.companyId) throw new Error(`${definition.displayName} is connected for a different PaperClaw company.`);
  if (config.dryRun && plan.mutating) {
    await audit(ctx, definition, runCtx, plan, { ok: true, dryRun: true });
    return { content: `Dry run prepared for ${definition.displayName}: ${plan.operation}.`, data: { ...plan, dryRun: true } };
  }
  try {
    const response = await request(ctx, definition, config, plan, runCtx.companyId);
    await audit(ctx, definition, runCtx, plan, { ok: true, dryRun: false });
    return { content: `${definition.displayName} request completed: ${plan.operation}.`, data: summarize(response, config.maxOutputBytes) };
  } catch (error) {
    await audit(ctx, definition, runCtx, plan, { ok: false, dryRun: false });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export function createProductivityPlugin(definition: ProductivityDefinition) {
  return definePlugin({
    async setup(ctx) {
      const toolNames = [...definition.endpoints.map((endpoint) => toolName(definition, endpoint.key)), toolName(definition, "apiRequest")];
      for (const name of toolNames) {
        ctx.tools.register(name, { displayName: name, description: `Run ${name}`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
          let plan: ProductivityRequestPlan;
          try {
            const config = normalizeConfig(definition, await ctx.config.get());
            plan = buildPlan(definition, name, asObject(rawParams), config);
          } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
          }
          return executePlan(ctx, definition, runCtx, plan);
        });
      }
      ctx.data.register(productivityDataKeys.status, async (params) => {
        const { config, errors, warnings } = validateConfig(definition, await ctx.config.get());
        const companyId = stringParam(asObject(params), "companyId");
        const companyMatches = !config.connectedCompanyId || !companyId || config.connectedCompanyId === companyId;
        return {
          version: definition.version,
          connected: isConnected(config) && companyMatches,
          authMode: config.authMode,
          connectedCompanyId: config.connectedCompanyId || null,
          connectedAt: config.connectedAt || null,
          connectedAccountId: config.connectedAccountId || null,
          dryRun: config.dryRun,
          enableRawApiTool: config.enableRawApiTool,
          scopes: config.enabledScopes,
          redirectUri: config.redirectUri || null,
          errors,
          warnings: companyMatches ? warnings : [...warnings, `${definition.displayName} is connected for a different PaperClaw company.`],
        };
      });
      ctx.data.register(productivityDataKeys.recentCommands, async (params) => {
        const companyId = stringParam(asObject(params), "companyId");
        if (!companyId) return { commands: [] };
        const commands = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
        return { commands: Array.isArray(commands) ? commands : [] };
      });
      ctx.actions.register(productivityActionKeys.saveAccessToken, async (params) => ctx.secrets.upsert({
        companyId: requireString(asObject(params), "companyId"),
        name: `${definition.routePath}-access-token`,
        value: requireString(asObject(params), "accessToken"),
        description: `${definition.displayName} access token.`,
      }));
      ctx.actions.register(productivityActionKeys.saveClientSecret, async (params) => ctx.secrets.upsert({
        companyId: requireString(asObject(params), "companyId"),
        name: `${definition.routePath}-client-secret`,
        value: requireString(asObject(params), "clientSecret"),
        description: `${definition.displayName} OAuth client secret.`,
      }));
      ctx.actions.register(productivityActionKeys.startOauth, async (params) => {
        if (!definition.authUrl) throw new Error(`${definition.displayName} OAuth authorization URL is not configured.`);
        const config = normalizeConfig(definition, { ...await ctx.config.get(), ...asObject(params), authMode: "oauth" });
        if (!config.clientId) throw new Error(`${definition.displayName} OAuth Client ID is required.`);
        const redirectUri = stringParam(asObject(params), "redirectUri", config.redirectUri);
        if (!redirectUri) throw new Error("Redirect URI is required.");
        const state = oauthState();
        const url = new URL(definition.authUrl);
        url.searchParams.set("client_id", config.clientId);
        url.searchParams.set("redirect_uri", redirectUri);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("scope", (config.enabledScopes.length ? config.enabledScopes : definition.defaultScopes).join(" "));
        url.searchParams.set("state", state);
        return { authorizationUrl: url.toString(), state, redirectUri };
      });
      ctx.actions.register(productivityActionKeys.completeOauth, async (params) => {
        const input = asObject(params);
        const companyId = requireString(input, "companyId");
        const config = normalizeConfig(definition, { ...await ctx.config.get(), ...input, authMode: "oauth" });
        const token = await tokenRequest(ctx, definition, config, { grant_type: "authorization_code", code: requireString(input, "code"), redirect_uri: requireString(input, "redirectUri") });
        if (!token.refresh_token && !token.access_token) throw new Error(`${definition.displayName} did not return a usable token.`);
        const secret = await ctx.secrets.upsert({
          companyId,
          name: `${definition.routePath}-refresh-token`,
          value: token.refresh_token ?? token.access_token!,
          description: `${definition.displayName} OAuth token.`,
        });
        return { refreshTokenSecretRef: secret.secretRef, expiresIn: token.expires_in ?? null, tokenType: token.token_type ?? "Bearer", scope: token.scope ?? "" };
      });
      ctx.actions.register(productivityActionKeys.disconnect, async (params) => {
        const companyId = stringParam(asObject(params), "companyId");
        if (companyId) await ctx.state.delete({ scopeKind: "company", scopeId: companyId, stateKey: COMMAND_HISTORY_KEY });
        return { ok: true };
      });
    },
    async onValidateConfig(config) {
      const validation = validateConfig(definition, config);
      return { ok: validation.errors.length === 0, errors: validation.errors, warnings: validation.warnings };
    },
  });
}

export function runProductivityWorker(definition: ProductivityDefinition, importMetaUrl: string) {
  runWorker(createProductivityPlugin(definition), importMetaUrl);
}
