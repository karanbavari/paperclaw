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

export type EcommerceAuthKind = "bearer" | "basic" | "api-key-header" | "query-token" | "none";
export type EcommerceOperation = "read" | "create" | "update" | "inventory" | "orders" | "customers" | "webhooks";

export type EcommerceEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH";
  path: string;
  queryParam?: string;
  requires?: EcommerceOperation;
  mutating?: boolean;
};

export type EcommercePlatformSpec = {
  slug: string;
  toolPrefix: string;
  pluginId: string;
  packageName: string;
  displayName: string;
  description: string;
  defaultBaseUrl: string;
  defaultApiVersion?: string;
  authKind: EcommerceAuthKind;
  apiKeyHeaderName?: string;
  apiSecretHeaderName?: string;
  docsUrl: string;
  setupNotes: string;
  webhookSignatureHeader?: string;
  endpoints: {
    overview: EcommerceEndpoint;
    productsSearch: EcommerceEndpoint;
    productGet: EcommerceEndpoint;
    productCreate?: EcommerceEndpoint;
    productUpdate?: EcommerceEndpoint;
    inventoryRead?: EcommerceEndpoint;
    inventoryUpdate?: EcommerceEndpoint;
    ordersSearch?: EcommerceEndpoint;
    orderGet?: EcommerceEndpoint;
    orderUpdate?: EcommerceEndpoint;
    customersSearch?: EcommerceEndpoint;
  };
};

export type EcommerceConfig = {
  baseUrl: string;
  apiVersion: string;
  storeId: string;
  accessTokenSecretRef: string;
  apiKeySecretRef: string;
  apiSecretRef: string;
  dryRun: boolean;
  allowedOperations: EcommerceOperation[];
  maxMutationItems: number;
  maxOutputBytes: number;
  timeoutMs: number;
};

const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
  recentWebhooks: "recent-webhooks",
} as const;

const DEFAULT_ALLOWED_OPERATIONS: EcommerceOperation[] = ["read", "create", "update", "inventory", "orders", "customers", "webhooks"];

function toolNames(prefix: string) {
  return {
    storeOverview: `${prefix}.storeOverview`,
    productsSearch: `${prefix}.productsSearch`,
    productGet: `${prefix}.productGet`,
    productCreate: `${prefix}.productCreate`,
    productUpdate: `${prefix}.productUpdate`,
    inventoryRead: `${prefix}.inventoryRead`,
    inventoryUpdate: `${prefix}.inventoryUpdate`,
    ordersSearch: `${prefix}.ordersSearch`,
    orderGet: `${prefix}.orderGet`,
    orderUpdate: `${prefix}.orderUpdate`,
    customersSearch: `${prefix}.customersSearch`,
  } as const;
}

function slotIds(slug: string) {
  return {
    page: `${slug}-page`,
    settingsPage: `${slug}-settings-page`,
    dashboardWidget: `${slug}-dashboard-widget`,
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

function requireString(params: Record<string, unknown>, key: string) {
  const value = stringParam(params[key]);
  if (!value) throw new Error(`${key} is required`);
  return value;
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

export function normalizeConfig(spec: EcommercePlatformSpec, raw: unknown): EcommerceConfig {
  const input = asObject(raw);
  const operations = safeArray(input.allowedOperations).filter((item): item is EcommerceOperation => {
    return DEFAULT_ALLOWED_OPERATIONS.includes(item as EcommerceOperation);
  });
  return {
    baseUrl: normalizeBaseUrl(input.baseUrl, spec.defaultBaseUrl),
    apiVersion: stringParam(input.apiVersion, spec.defaultApiVersion ?? ""),
    storeId: stringParam(input.storeId),
    accessTokenSecretRef: stringParam(input.accessTokenSecretRef),
    apiKeySecretRef: stringParam(input.apiKeySecretRef),
    apiSecretRef: stringParam(input.apiSecretRef),
    dryRun: typeof input.dryRun === "boolean" ? input.dryRun : true,
    allowedOperations: operations.length > 0 ? operations : [...DEFAULT_ALLOWED_OPERATIONS],
    maxMutationItems: safeNumber(input.maxMutationItems, 50, 1, 500),
    maxOutputBytes: safeNumber(input.maxOutputBytes, 32_000, 4_000, 500_000),
    timeoutMs: safeNumber(input.timeoutMs, 30_000, 5_000, 120_000),
  };
}

export function validateConfig(spec: EcommercePlatformSpec, raw: unknown) {
  const config = normalizeConfig(spec, raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.baseUrl) errors.push("Base URL is required.");
  if (spec.authKind === "bearer" && !config.accessTokenSecretRef) warnings.push("Access token secret reference is not configured.");
  if (spec.authKind === "basic" && (!config.apiKeySecretRef || !config.apiSecretRef)) warnings.push("Basic auth key and secret references are not configured.");
  if (spec.authKind === "api-key-header" && !config.apiKeySecretRef) warnings.push("API key secret reference is not configured.");
  if (spec.authKind === "query-token" && !config.accessTokenSecretRef) warnings.push("Query access token secret reference is not configured.");
  return { config, errors, warnings };
}

function assertOperationAllowed(config: EcommerceConfig, operation: EcommerceOperation) {
  if (!config.allowedOperations.includes(operation)) throw new Error(`Operation ${operation} is not allowed by plugin settings.`);
}

function fillPath(pathTemplate: string, params: Record<string, unknown>, config: EcommerceConfig) {
  let path = pathTemplate
    .replaceAll("{storeId}", encodeURIComponent(config.storeId))
    .replaceAll("{apiVersion}", encodeURIComponent(config.apiVersion));
  if (path.includes("{productId}")) path = path.replaceAll("{productId}", encodeURIComponent(requireString(params, "productId")));
  if (path.includes("{orderId}")) path = path.replaceAll("{orderId}", encodeURIComponent(requireString(params, "orderId")));
  return path;
}

function buildUrl(config: EcommerceConfig, endpoint: EcommerceEndpoint, params: Record<string, unknown>) {
  const url = new URL(`${config.baseUrl}${fillPath(endpoint.path, params, config)}`);
  const query = stringParam(params.query);
  const limit = safeNumber(params.limit, 25, 1, 100);
  if (query && endpoint.queryParam) url.searchParams.set(endpoint.queryParam, query);
  url.searchParams.set("limit", String(limit));
  return url;
}

async function authHeaders(ctx: PluginContext, spec: EcommercePlatformSpec, config: EcommerceConfig): Promise<Record<string, string>> {
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
  if (spec.authKind === "api-key-header") {
    if (!config.apiKeySecretRef) throw new Error("apiKeySecretRef is required for live calls.");
    const key = await ctx.secrets.resolve(config.apiKeySecretRef);
    return { [spec.apiKeyHeaderName ?? "x-api-key"]: key };
  }
  return {};
}

async function applyQueryToken(ctx: PluginContext, spec: EcommercePlatformSpec, config: EcommerceConfig, url: URL) {
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
  spec: EcommercePlatformSpec;
  config: EcommerceConfig;
  endpoint: EcommerceEndpoint;
  params: Record<string, unknown>;
  operation: EcommerceOperation;
  summary: string;
  body?: unknown;
}): Promise<ToolResult> {
  const { ctx, runCtx, spec, config, endpoint, params, operation, summary, body } = input;
  try {
    assertOperationAllowed(config, operation);
    const mutating = endpoint.mutating ?? endpoint.method !== "GET";
    const url = buildUrl(config, endpoint, params);
    const plannedRequest = {
      method: endpoint.method,
      url: url.toString(),
      body: body ?? null,
    };
    if (config.dryRun && mutating) {
      await rememberCommand(ctx, runCtx.companyId, { platform: spec.slug, operation, summary, mutating, dryRun: true, ok: true, runId: runCtx.runId, agentId: runCtx.agentId });
      return { content: `Dry run prepared for ${spec.displayName}: ${summary}. No external ecommerce platform was changed.`, data: { dryRun: true, request: plannedRequest } };
    }
    await applyQueryToken(ctx, spec, config, url);
    const headers = await authHeaders(ctx, spec, config);
    const response = await ctx.http.fetch(url.toString(), {
      method: endpoint.method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        ...headers,
      },
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
  return {
    name,
    displayName,
    description,
    parametersSchema: { type: "object", properties, required },
  };
}

export function createEcommerceManifest(spec: EcommercePlatformSpec): PaperClawPluginManifestV1 {
  const names = toolNames(spec.toolPrefix);
  const slots = slotIds(spec.slug);
  const commonProperties = {
    query: { type: "string" },
    limit: { type: "number", minimum: 1, maximum: 100 },
  };
  const productId = { productId: { type: "string" } };
  const orderId = { orderId: { type: "string" } };
  const tools = [
    toolDeclaration(names.storeOverview, `${spec.displayName} Store Overview`, "Read store identity and API access status.", {}, []),
    toolDeclaration(names.productsSearch, `Search ${spec.displayName} Products`, "Search products/catalog items.", commonProperties, []),
    toolDeclaration(names.productGet, `Get ${spec.displayName} Product`, "Get a product/catalog item by id.", productId, ["productId"]),
  ];
  if (spec.endpoints.productCreate) tools.push(toolDeclaration(names.productCreate, `Create ${spec.displayName} Product`, "Create a product. Dry run is enabled by default.", { product: { type: "object" } }, ["product"]));
  if (spec.endpoints.productUpdate) tools.push(toolDeclaration(names.productUpdate, `Update ${spec.displayName} Product`, "Update a product. Dry run is enabled by default.", { ...productId, product: { type: "object" } }, ["productId", "product"]));
  if (spec.endpoints.inventoryRead) tools.push(toolDeclaration(names.inventoryRead, `Read ${spec.displayName} Inventory`, "Read inventory availability.", { ...commonProperties, ...productId }, []));
  if (spec.endpoints.inventoryUpdate) tools.push(toolDeclaration(names.inventoryUpdate, `Update ${spec.displayName} Inventory`, "Update inventory. Dry run is enabled by default.", { ...productId, inventory: { type: "object" } }, ["productId", "inventory"]));
  if (spec.endpoints.ordersSearch) tools.push(toolDeclaration(names.ordersSearch, `Search ${spec.displayName} Orders`, "Search ecommerce orders.", commonProperties, []));
  if (spec.endpoints.orderGet) tools.push(toolDeclaration(names.orderGet, `Get ${spec.displayName} Order`, "Get an order by id.", orderId, ["orderId"]));
  if (spec.endpoints.orderUpdate) tools.push(toolDeclaration(names.orderUpdate, `Update ${spec.displayName} Order`, "Update order status or fulfillment. Dry run is enabled by default.", { ...orderId, order: { type: "object" } }, ["orderId", "order"]));
  if (spec.endpoints.customersSearch) tools.push(toolDeclaration(names.customersSearch, `Search ${spec.displayName} Customers`, "Search customers.", commonProperties, []));

  return {
    id: spec.pluginId,
    apiVersion: 1,
    version: "0.1.0",
    displayName: spec.displayName,
    description: spec.description,
    author: "PaperClaw",
    categories: ["connector", "automation", "ecommerce", "ui"],
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
        storeId: { type: "string", title: "Store / Project ID", default: "" },
        accessTokenSecretRef: { type: "string", title: "Access Token Secret Reference", format: "secret-ref", default: "" },
        apiKeySecretRef: { type: "string", title: "API Key / Username Secret Reference", format: "secret-ref", default: "" },
        apiSecretRef: { type: "string", title: "API Secret / Password Secret Reference", format: "secret-ref", default: "" },
        dryRun: { type: "boolean", title: "Dry Run", default: true, description: "When enabled, mutating tools preview requests instead of changing the ecommerce platform." },
        allowedOperations: { type: "array", title: "Allowed Operations", default: DEFAULT_ALLOWED_OPERATIONS, items: { type: "string" } },
        maxMutationItems: { type: "number", title: "Max Mutation Items", default: 50, minimum: 1, maximum: 500 },
        maxOutputBytes: { type: "number", title: "Max Output Bytes", default: 32000, minimum: 4000, maximum: 500000 },
        timeoutMs: { type: "number", title: "HTTP Timeout Milliseconds", default: 30000, minimum: 5000, maximum: 120000 },
      },
    },
    tools,
    webhooks: [{ endpointKey: spec.slug, displayName: `${spec.displayName} Webhooks`, description: `Receives ${spec.displayName} webhook callbacks and stores a small audit record.` }],
    ui: {
      slots: [
        { type: "page", id: slots.page, displayName: spec.displayName, exportName: "EcommercePage", routePath: spec.slug },
        { type: "settingsPage", id: slots.settingsPage, displayName: spec.displayName, exportName: "EcommerceSettingsPage" },
        { type: "dashboardWidget", id: slots.dashboardWidget, displayName: spec.displayName, exportName: "EcommerceDashboardWidget" },
      ],
    },
  };
}

export function createEcommercePlugin(spec: EcommercePlatformSpec) {
  const names = toolNames(spec.toolPrefix);
  const registerTool = (
    ctx: PluginContext,
    name: string,
    endpoint: EcommerceEndpoint | undefined,
    operation: EcommerceOperation,
    summary: (params: Record<string, unknown>) => string,
    body: (params: Record<string, unknown>) => unknown = (params) => params,
  ) => {
    if (!endpoint) return;
    ctx.tools.register(name, { displayName: name, description: `Run ${spec.displayName} ecommerce operation.`, parametersSchema: { type: "object" } }, async (rawParams, runCtx) => {
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
          storeId: config.storeId,
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
      registerTool(ctx, names.storeOverview, spec.endpoints.overview, "read", () => "load store overview");
      registerTool(ctx, names.productsSearch, spec.endpoints.productsSearch, "read", () => "search products");
      registerTool(ctx, names.productGet, spec.endpoints.productGet, "read", (params) => `get product ${params.productId}`);
      registerTool(ctx, names.productCreate, spec.endpoints.productCreate, "create", () => "create product", (params) => params.product);
      registerTool(ctx, names.productUpdate, spec.endpoints.productUpdate, "update", (params) => `update product ${params.productId}`, (params) => params.product);
      registerTool(ctx, names.inventoryRead, spec.endpoints.inventoryRead, "inventory", () => "read inventory");
      registerTool(ctx, names.inventoryUpdate, spec.endpoints.inventoryUpdate, "inventory", (params) => `update inventory for product ${params.productId}`, (params) => params.inventory);
      registerTool(ctx, names.ordersSearch, spec.endpoints.ordersSearch, "orders", () => "search orders");
      registerTool(ctx, names.orderGet, spec.endpoints.orderGet, "orders", (params) => `get order ${params.orderId}`);
      registerTool(ctx, names.orderUpdate, spec.endpoints.orderUpdate, "orders", (params) => `update order ${params.orderId}`, (params) => params.order);
      registerTool(ctx, names.customersSearch, spec.endpoints.customersSearch, "customers", () => "search customers");
      ctx.logger.info(`${spec.displayName} ecommerce plugin setup complete`);
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
      return { status: "ok", message: `${spec.displayName} ecommerce plugin worker is running.` };
    },
  });
  return plugin;
}

export function runEcommerceWorker(spec: EcommercePlatformSpec, importMetaUrl: string) {
  const plugin = createEcommercePlugin(spec);
  runWorker(plugin, importMetaUrl);
  return plugin;
}
