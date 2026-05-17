import { createHash, createHmac } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PaperClawPluginManifestV1,
  type PluginContext,
  type PluginWebhookInput,
  type ToolResult,
  type ToolRunContext,
} from "@kesarcloud/plugin-sdk";

export type LogisticsAuthKind = "bearer" | "basic" | "basic-api-key" | "api-key-header" | "query-token" | "none";
export type LogisticsOperation = "read" | "rates" | "shipments" | "labels" | "tracking" | "pickups" | "addresses" | "webhooks";

export type LogisticsEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  queryParam?: string;
  mutating?: boolean;
};

export type LogisticsPlatformSpec = {
  slug: string;
  toolPrefix: string;
  pluginId: string;
  packageName: string;
  displayName: string;
  description: string;
  defaultBaseUrl: string;
  defaultApiVersion?: string;
  authKind: LogisticsAuthKind;
  apiKeyHeaderName?: string;
  docsUrl: string;
  setupNotes: string;
  webhookSignatureHeader?: string;
  endpoints: {
    overview: LogisticsEndpoint;
    carrierServices?: LogisticsEndpoint;
    rateQuote?: LogisticsEndpoint;
    shipmentCreate?: LogisticsEndpoint;
    labelCreate?: LogisticsEndpoint;
    trackingLookup?: LogisticsEndpoint;
    pickupCreate?: LogisticsEndpoint;
    pickupCancel?: LogisticsEndpoint;
    addressValidate?: LogisticsEndpoint;
  };
};

export type LogisticsConfig = {
  baseUrl: string;
  apiVersion: string;
  accountId: string;
  accessTokenSecretRef: string;
  apiKeySecretRef: string;
  apiSecretRef: string;
  dryRun: boolean;
  allowedOperations: LogisticsOperation[];
  maxLabelPurchases: number;
  maxOutputBytes: number;
  timeoutMs: number;
};

const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

const DEFAULT_ALLOWED_OPERATIONS: LogisticsOperation[] = ["read", "rates", "tracking", "addresses"];

function toolNames(prefix: string) {
  return {
    accountOverview: `${prefix}.accountOverview`,
    carrierServices: `${prefix}.carrierServices`,
    rateQuote: `${prefix}.rateQuote`,
    shipmentCreate: `${prefix}.shipmentCreate`,
    labelCreate: `${prefix}.labelCreate`,
    trackingLookup: `${prefix}.trackingLookup`,
    pickupCreate: `${prefix}.pickupCreate`,
    pickupCancel: `${prefix}.pickupCancel`,
    addressValidate: `${prefix}.addressValidate`,
  } as const;
}

function safeArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function safeNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function stringParam(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeBaseUrl(value: unknown, fallback: string) {
  const raw = stringParam(value, fallback);
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/$/, "");
  }
}

function requireString(params: Record<string, unknown>, key: string) {
  const value = stringParam(params[key]);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

export function normalizeConfig(spec: LogisticsPlatformSpec, raw: unknown): LogisticsConfig {
  const input = asObject(raw);
  const operations = safeArray(input.allowedOperations).filter((item): item is LogisticsOperation => {
    return ["read", "rates", "shipments", "labels", "tracking", "pickups", "addresses", "webhooks"].includes(item);
  });
  return {
    baseUrl: normalizeBaseUrl(input.baseUrl, spec.defaultBaseUrl),
    apiVersion: stringParam(input.apiVersion, spec.defaultApiVersion ?? ""),
    accountId: stringParam(input.accountId),
    accessTokenSecretRef: stringParam(input.accessTokenSecretRef),
    apiKeySecretRef: stringParam(input.apiKeySecretRef),
    apiSecretRef: stringParam(input.apiSecretRef),
    dryRun: typeof input.dryRun === "boolean" ? input.dryRun : true,
    allowedOperations: operations.length > 0 ? operations : [...DEFAULT_ALLOWED_OPERATIONS],
    maxLabelPurchases: safeNumber(input.maxLabelPurchases, 10, 1, 100),
    maxOutputBytes: safeNumber(input.maxOutputBytes, 32_000, 4_000, 500_000),
    timeoutMs: safeNumber(input.timeoutMs, 30_000, 5_000, 120_000),
  };
}

export function validateConfig(spec: LogisticsPlatformSpec, raw: unknown) {
  const config = normalizeConfig(spec, raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.baseUrl) errors.push("Base URL is required.");
  if (spec.authKind === "bearer" && !config.accessTokenSecretRef) warnings.push("Access token secret reference is not configured.");
  if (spec.authKind === "basic" && (!config.apiKeySecretRef || !config.apiSecretRef)) warnings.push("Basic auth key and secret references are not configured.");
  if (spec.authKind === "basic-api-key" && !config.apiKeySecretRef) warnings.push("API key secret reference is not configured.");
  if (spec.authKind === "api-key-header" && !config.apiKeySecretRef) warnings.push("API key secret reference is not configured.");
  if (spec.authKind === "query-token" && !config.accessTokenSecretRef) warnings.push("Query access token secret reference is not configured.");
  return { config, errors, warnings };
}

function assertOperationAllowed(config: LogisticsConfig, operation: LogisticsOperation) {
  if (!config.allowedOperations.includes(operation)) throw new Error(`Operation ${operation} is not allowed by plugin settings.`);
}

function fillPath(pathTemplate: string, params: Record<string, unknown>, config: LogisticsConfig) {
  let path = pathTemplate
    .replaceAll("{accountId}", encodeURIComponent(config.accountId))
    .replaceAll("{apiVersion}", encodeURIComponent(config.apiVersion));
  if (path.includes("{shipmentId}")) path = path.replaceAll("{shipmentId}", encodeURIComponent(requireString(params, "shipmentId")));
  if (path.includes("{trackingNumber}")) path = path.replaceAll("{trackingNumber}", encodeURIComponent(requireString(params, "trackingNumber")));
  if (path.includes("{pickupId}")) path = path.replaceAll("{pickupId}", encodeURIComponent(requireString(params, "pickupId")));
  return path;
}

function buildUrl(config: LogisticsConfig, endpoint: LogisticsEndpoint, params: Record<string, unknown>) {
  const url = new URL(`${config.baseUrl}${fillPath(endpoint.path, params, config)}`);
  const query = stringParam(params.query) || stringParam(params.trackingNumber) || stringParam(params.shipmentId);
  if (query && endpoint.queryParam) url.searchParams.set(endpoint.queryParam, query);
  return url;
}

async function authHeaders(ctx: PluginContext, spec: LogisticsPlatformSpec, config: LogisticsConfig): Promise<Record<string, string>> {
  if (spec.authKind === "none") return {};
  if (spec.authKind === "bearer") {
    if (!config.accessTokenSecretRef) throw new Error("accessTokenSecretRef is required for live calls.");
    return { authorization: `Bearer ${await ctx.secrets.resolve(config.accessTokenSecretRef)}` };
  }
  if (spec.authKind === "basic") {
    if (!config.apiKeySecretRef || !config.apiSecretRef) throw new Error("apiKeySecretRef and apiSecretRef are required for live calls.");
    const key = await ctx.secrets.resolve(config.apiKeySecretRef);
    const secret = await ctx.secrets.resolve(config.apiSecretRef);
    return { authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` };
  }
  if (spec.authKind === "basic-api-key") {
    if (!config.apiKeySecretRef) throw new Error("apiKeySecretRef is required for live calls.");
    const key = await ctx.secrets.resolve(config.apiKeySecretRef);
    return { authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}` };
  }
  if (spec.authKind === "api-key-header") {
    if (!config.apiKeySecretRef) throw new Error("apiKeySecretRef is required for live calls.");
    const key = await ctx.secrets.resolve(config.apiKeySecretRef);
    return { [spec.apiKeyHeaderName ?? "x-api-key"]: key };
  }
  return {};
}

async function applyQueryToken(ctx: PluginContext, spec: LogisticsPlatformSpec, config: LogisticsConfig, url: URL) {
  if (spec.authKind !== "query-token") return;
  if (!config.accessTokenSecretRef) throw new Error("accessTokenSecretRef is required for live calls.");
  url.searchParams.set("token", await ctx.secrets.resolve(config.accessTokenSecretRef));
}

function truncateJson(value: unknown, maxBytes: number) {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text) <= maxBytes) return { value, truncated: false };
  return { value: { truncatedJsonPreview: text.slice(0, maxBytes) }, truncated: true };
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: Record<string, unknown>) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: DATA_KEYS.recentCommands });
  const list = Array.isArray(existing) ? existing : [];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: DATA_KEYS.recentCommands }, [{
    ...input,
    createdAt: new Date().toISOString(),
  }, ...list].slice(0, 50));
}

async function executeEndpoint(input: {
  ctx: PluginContext;
  runCtx: ToolRunContext;
  spec: LogisticsPlatformSpec;
  config: LogisticsConfig;
  endpoint: LogisticsEndpoint;
  params: Record<string, unknown>;
  operation: LogisticsOperation;
  summary: string;
  body?: unknown;
}): Promise<ToolResult> {
  const { ctx, runCtx, spec, config, endpoint, params, operation, summary, body } = input;
  try {
    assertOperationAllowed(config, operation);
    const mutating = endpoint.mutating ?? endpoint.method !== "GET";
    const url = buildUrl(config, endpoint, params);
    const plannedRequest = { method: endpoint.method, url: url.toString(), body: body ?? null };
    if (config.dryRun && mutating) {
      await rememberCommand(ctx, runCtx.companyId, { platform: spec.slug, operation, summary, mutating, dryRun: true, ok: true, runId: runCtx.runId, agentId: runCtx.agentId });
      return { content: `Dry run prepared for ${spec.displayName}: ${summary}. No logistics provider was changed.`, data: { dryRun: true, request: plannedRequest } };
    }
    await applyQueryToken(ctx, spec, config, url);
    const headers = await authHeaders(ctx, spec, config);
    const response = await ctx.http.fetch(url.toString(), {
      method: endpoint.method,
      headers: { accept: "application/json", "content-type": "application/json", ...headers },
      body: mutating ? JSON.stringify(body ?? {}) : undefined,
      signal: AbortSignal.timeout(config.timeoutMs),
    });
    const text = await response.text();
    let payload: unknown = text;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }
    if (!response.ok) throw new Error(`${spec.displayName} API HTTP ${response.status}: ${text.slice(0, 500)}`);
    const result = truncateJson(payload, config.maxOutputBytes);
    await rememberCommand(ctx, runCtx.companyId, { platform: spec.slug, operation, summary, mutating, dryRun: false, ok: true, runId: runCtx.runId, agentId: runCtx.agentId });
    await ctx.activity.log({
      companyId: runCtx.companyId,
      message: `${spec.displayName}: ${summary}`,
      metadata: { pluginId: spec.pluginId, operation, mutating, dryRun: false, ok: true, runId: runCtx.runId, agentId: runCtx.agentId },
    });
    return { content: `${spec.displayName} command completed: ${summary}.`, data: { dryRun: false, result: result.value, truncated: result.truncated } };
  } catch (err) {
    await rememberCommand(ctx, runCtx.companyId, { platform: spec.slug, operation, summary, dryRun: config.dryRun, ok: false, error: err instanceof Error ? err.message : String(err), runId: runCtx.runId, agentId: runCtx.agentId });
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function toolDeclaration(name: string, displayName: string, description: string, properties: Record<string, unknown>, required: string[] = []) {
  return { name, displayName, description, parametersSchema: { type: "object", properties, required } };
}

export function createLogisticsManifest(spec: LogisticsPlatformSpec): PaperClawPluginManifestV1 {
  const names = toolNames(spec.toolPrefix);
  const trackingNumber = { trackingNumber: { type: "string" } };
  const shipmentId = { shipmentId: { type: "string" } };
  const pickupId = { pickupId: { type: "string" } };
  const tools = [
    toolDeclaration(names.accountOverview, `${spec.displayName} Account Overview`, "Read account, carrier, or provider access status.", {}, []),
  ];
  if (spec.endpoints.carrierServices) tools.push(toolDeclaration(names.carrierServices, `${spec.displayName} Carrier Services`, "List carrier services or service availability.", { query: { type: "string" } }, []));
  if (spec.endpoints.rateQuote) tools.push(toolDeclaration(names.rateQuote, `${spec.displayName} Rate Quote`, "Quote shipping rates for a shipment draft.", { shipment: { type: "object" } }, ["shipment"]));
  if (spec.endpoints.shipmentCreate) tools.push(toolDeclaration(names.shipmentCreate, `${spec.displayName} Create Shipment`, "Create a shipment. Dry run is enabled by default.", { shipment: { type: "object" } }, ["shipment"]));
  if (spec.endpoints.labelCreate) tools.push(toolDeclaration(names.labelCreate, `${spec.displayName} Create Label`, "Create or purchase a shipping label. Dry run is enabled by default.", { ...shipmentId, label: { type: "object" } }, ["label"]));
  if (spec.endpoints.trackingLookup) tools.push(toolDeclaration(names.trackingLookup, `${spec.displayName} Tracking Lookup`, "Look up tracking status by tracking number.", trackingNumber, ["trackingNumber"]));
  if (spec.endpoints.pickupCreate) tools.push(toolDeclaration(names.pickupCreate, `${spec.displayName} Create Pickup`, "Schedule a pickup. Dry run is enabled by default.", { pickup: { type: "object" } }, ["pickup"]));
  if (spec.endpoints.pickupCancel) tools.push(toolDeclaration(names.pickupCancel, `${spec.displayName} Cancel Pickup`, "Cancel a scheduled pickup. Dry run is enabled by default.", pickupId, ["pickupId"]));
  if (spec.endpoints.addressValidate) tools.push(toolDeclaration(names.addressValidate, `${spec.displayName} Address Validate`, "Validate a ship-to or ship-from address.", { address: { type: "object" } }, ["address"]));
  return {
    id: spec.pluginId,
    apiVersion: 1,
    version: "0.1.0",
    displayName: spec.displayName,
    description: spec.description,
    author: "PaperClaw",
    categories: ["connector", "automation", "courier-logistics", "ui"],
    capabilities: [
      "http.outbound",
      "secrets.read-ref",
      "plugin.state.read",
      "plugin.state.write",
      "activity.log.write",
      "agent.tools.register",
      "instance.settings.register",
      "ui.page.register",
      "ui.dashboardWidget.register",
      "webhooks.receive",
    ],
    entrypoints: { worker: "./dist/worker.js", ui: "./dist/ui" },
    instanceConfigSchema: {
      type: "object",
      properties: {
        baseUrl: { type: "string", title: "Base URL", default: spec.defaultBaseUrl, description: `Official API base URL. Docs: ${spec.docsUrl}` },
        apiVersion: { type: "string", title: "API Version", default: spec.defaultApiVersion ?? "" },
        accountId: { type: "string", title: "Account / Merchant ID", default: "" },
        accessTokenSecretRef: { type: "string", title: "Access Token Secret Reference", format: "secret-ref", default: "" },
        apiKeySecretRef: { type: "string", title: "API Key / Username Secret Reference", format: "secret-ref", default: "" },
        apiSecretRef: { type: "string", title: "API Secret / Password Secret Reference", format: "secret-ref", default: "" },
        dryRun: { type: "boolean", title: "Dry Run", default: true, description: "When enabled, mutating tools preview requests instead of changing the logistics provider." },
        allowedOperations: { type: "array", title: "Allowed Operations", default: DEFAULT_ALLOWED_OPERATIONS, items: { type: "string" } },
        maxLabelPurchases: { type: "number", title: "Max Label Purchases", default: 10, minimum: 1, maximum: 100 },
        maxOutputBytes: { type: "number", title: "Max Output Bytes", default: 32000, minimum: 4000, maximum: 500000 },
        timeoutMs: { type: "number", title: "HTTP Timeout Milliseconds", default: 30000, minimum: 5000, maximum: 120000 },
      },
    },
    tools,
    webhooks: [{ endpointKey: spec.slug, displayName: `${spec.displayName} Webhooks`, description: `Receives ${spec.displayName} webhook callbacks and stores a small audit record.` }],
    ui: {
      slots: [
        { type: "page", id: `${spec.slug}-page`, displayName: spec.displayName, exportName: "LogisticsPage", routePath: spec.slug },
        { type: "settingsPage", id: `${spec.slug}-settings-page`, displayName: spec.displayName, exportName: "LogisticsSettingsPage" },
        { type: "dashboardWidget", id: `${spec.slug}-dashboard-widget`, displayName: spec.displayName, exportName: "LogisticsDashboardWidget" },
      ],
    },
  };
}

export function createLogisticsPlugin(spec: LogisticsPlatformSpec) {
  const names = toolNames(spec.toolPrefix);
  const registerTool = (
    ctx: PluginContext,
    name: string,
    endpoint: LogisticsEndpoint | undefined,
    operation: LogisticsOperation,
    summary: (params: Record<string, unknown>) => string,
    body: (params: Record<string, unknown>) => unknown = (params) => params,
  ) => {
    if (!endpoint) return;
    ctx.tools.register(name, { displayName: name, description: `Run ${spec.displayName} logistics operation.`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
      const config = normalizeConfig(spec, await ctx.config.get());
      const params = asObject(rawParams);
      return executeEndpoint({ ctx, runCtx, spec, config, endpoint, params, operation, summary: summary(params), body: body(params) });
    });
  };
  const plugin = definePlugin({
    async setup(ctx) {
      ctx.data.register(DATA_KEYS.status, async (params) => {
        const { config, errors, warnings } = validateConfig(spec, await ctx.config.get());
        const companyId = stringParam(params.companyId);
        const recentCommands = companyId ? await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: DATA_KEYS.recentCommands }) : [];
        return {
          platform: spec.slug,
          displayName: spec.displayName,
          docsUrl: spec.docsUrl,
          setupNotes: spec.setupNotes,
          configured: errors.length === 0 && warnings.length === 0,
          baseUrl: config.baseUrl,
          apiVersion: config.apiVersion,
          accountId: config.accountId,
          dryRun: config.dryRun,
          allowedOperations: config.allowedOperations,
          recentCommandCount: Array.isArray(recentCommands) ? recentCommands.length : 0,
          errors,
          warnings,
        };
      });
      ctx.data.register(DATA_KEYS.recentCommands, async (params) => {
        const companyId = stringParam(params.companyId);
        if (!companyId) return { commands: [] };
        const commands = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: DATA_KEYS.recentCommands });
        return { commands: Array.isArray(commands) ? commands : [] };
      });
      registerTool(ctx, names.accountOverview, spec.endpoints.overview, "read", () => "load account overview");
      registerTool(ctx, names.carrierServices, spec.endpoints.carrierServices, "read", () => "list carrier services");
      registerTool(ctx, names.rateQuote, spec.endpoints.rateQuote, "rates", () => "quote shipment rates", (params) => params.shipment);
      registerTool(ctx, names.shipmentCreate, spec.endpoints.shipmentCreate, "shipments", () => "create shipment", (params) => params.shipment);
      registerTool(ctx, names.labelCreate, spec.endpoints.labelCreate, "labels", () => "create shipping label", (params) => params.label);
      registerTool(ctx, names.trackingLookup, spec.endpoints.trackingLookup, "tracking", (params) => `track ${params.trackingNumber}`);
      registerTool(ctx, names.pickupCreate, spec.endpoints.pickupCreate, "pickups", () => "create pickup", (params) => params.pickup);
      registerTool(ctx, names.pickupCancel, spec.endpoints.pickupCancel, "pickups", (params) => `cancel pickup ${params.pickupId}`);
      registerTool(ctx, names.addressValidate, spec.endpoints.addressValidate, "addresses", () => "validate address", (params) => params.address);
      ctx.logger.info(`${spec.displayName} logistics plugin setup complete`);
    },
    async onValidateConfig(config) {
      const result = validateConfig(spec, config);
      return { ok: result.errors.length === 0, errors: result.errors, warnings: result.warnings };
    },
    async onWebhook(input: PluginWebhookInput) {
      const body = input.rawBody || JSON.stringify(input.parsedBody ?? {});
      const signature = spec.webhookSignatureHeader ? input.headers[spec.webhookSignatureHeader.toLowerCase()] : undefined;
      if (signature) createHmac("sha256", String(signature)).update(body).digest("hex");
      else createHash("sha256").update(body).digest("hex");
    },
    async onHealth() {
      return { status: "ok", message: `${spec.displayName} logistics plugin worker is running.` };
    },
  });
  return plugin;
}

export function runLogisticsWorker(spec: LogisticsPlatformSpec, importMetaUrl: string) {
  const plugin = createLogisticsPlugin(spec);
  runWorker(plugin, importMetaUrl);
  return plugin;
}
