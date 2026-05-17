import { randomUUID } from "node:crypto";
import {
  definePlugin,
  runWorker,
  type PluginApiRequestInput,
  type PluginApiResponse,
  type PluginContext,
  type PluginWebhookInput,
  type ToolResult,
  type ToolRunContext,
} from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, ROUTE_KEYS, STATE_KEYS, TOOL_NAMES } from "./constants.js";
import {
  assertOperationAllowed,
  buildAdminGraphqlUrl,
  isAllowedShop,
  normalizeConfig,
  normalizeShopDomain,
  truncateJson,
  validateConfig,
  verifyShopifyHmac,
  type ConnectedShop,
  type ShopifyConfig,
  type ShopifyGraphqlResult,
  type ShopifyOperation,
} from "./shopify-client.js";
import manifest from "./manifest.js";

type ToolParams = Record<string, unknown>;

interface GraphqlPlan {
  operation: ShopifyOperation;
  summary: string;
  shop: string;
  query: string;
  variables?: Record<string, unknown>;
  mutating: boolean;
}

interface PendingOAuthState {
  state: string;
  shop: string;
  companyId: string;
  createdAt: string;
  actorId: string;
}

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

function jsonObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function requireShop(params: ToolParams, config: ShopifyConfig) {
  const shop = normalizeShopDomain(params.shop);
  if (!shop) throw new Error("shop must be a valid *.myshopify.com domain.");
  if (!isAllowedShop(config, shop)) throw new Error(`Shop ${shop} is not allowed by plugin settings.`);
  return shop;
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function loadConnectedShops(ctx: PluginContext, companyId: string): Promise<ConnectedShop[]> {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.shops });
  if (!Array.isArray(existing)) return [];
  return existing.filter((shop): shop is ConnectedShop => {
    return typeof shop === "object" && shop !== null &&
      typeof (shop as ConnectedShop).shop === "string" &&
      typeof (shop as ConnectedShop).accessTokenSecretRef === "string";
  });
}

async function saveConnectedShop(ctx: PluginContext, companyId: string, nextShop: ConnectedShop) {
  const current = await loadConnectedShops(ctx, companyId);
  const next = [nextShop, ...current.filter((shop) => shop.shop !== nextShop.shop)];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.shops }, next);
}

async function getConnectedShop(ctx: PluginContext, companyId: string, shop: string): Promise<ConnectedShop> {
  const connected = await loadConnectedShops(ctx, companyId);
  const match = connected.find((item) => item.shop === shop);
  if (!match) throw new Error(`Shop ${shop} is not connected. Install the Shopify app through the plugin settings first.`);
  return match;
}

async function loadOAuthStates(ctx: PluginContext, companyId: string): Promise<PendingOAuthState[]> {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.oauthStates });
  if (!Array.isArray(existing)) return [];
  const cutoff = Date.now() - 10 * 60_000;
  return existing.filter((state): state is PendingOAuthState => {
    return typeof state === "object" && state !== null &&
      typeof (state as PendingOAuthState).state === "string" &&
      typeof (state as PendingOAuthState).shop === "string" &&
      new Date((state as PendingOAuthState).createdAt).getTime() > cutoff;
  });
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  summary: string;
  operation: ShopifyOperation;
  shop: string;
  mutating: boolean;
  dryRun: boolean;
  ok: boolean;
  runId?: string;
  agentId?: string;
}) {
  const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.recentCommands });
  const list = Array.isArray(existing) ? existing : [];
  await ctx.state.set({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.recentCommands }, [{
    ...input,
    createdAt: new Date().toISOString(),
  }, ...list].slice(0, 50));
}

async function auditCommand(
  ctx: PluginContext,
  runCtx: ToolRunContext,
  plan: GraphqlPlan,
  result: { ok: boolean; dryRun: boolean },
) {
  await rememberCommand(ctx, runCtx.companyId, {
    summary: plan.summary,
    operation: plan.operation,
    shop: plan.shop,
    mutating: plan.mutating,
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Shopify ${result.dryRun ? "dry-run" : "GraphQL"}: ${plan.summary}`,
    metadata: {
      pluginId: PLUGIN_ID,
      operation: plan.operation,
      shop: plan.shop,
      mutating: plan.mutating,
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function executeGraphql(
  ctx: PluginContext,
  config: ShopifyConfig,
  companyId: string,
  shopRecord: ConnectedShop,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<ShopifyGraphqlResult> {
  const token = await ctx.secrets.resolve(shopRecord.accessTokenSecretRef);
  const response = await ctx.http.fetch(buildAdminGraphqlUrl(shopRecord.shop, config.apiVersion), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": token,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    throw new Error(`Shopify GraphQL HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  const objectPayload = jsonObject(payload);
  if (Array.isArray(objectPayload.errors) && objectPayload.errors.length > 0) {
    throw new Error(`Shopify GraphQL returned errors: ${JSON.stringify(objectPayload.errors).slice(0, 800)}`);
  }
  const { value, truncated } = truncateJson({
    data: objectPayload.data ?? null,
    extensions: objectPayload.extensions ?? null,
  }, config.maxOutputBytes);
  return {
    data: jsonObject(value).data ?? value,
    extensions: jsonObject(value).extensions,
    truncated,
  };
}

async function executePlan(ctx: PluginContext, config: ShopifyConfig, runCtx: ToolRunContext, plan: GraphqlPlan): Promise<ToolResult> {
  try {
    assertOperationAllowed(config, plan.operation);
    if (config.dryRun && plan.mutating) {
      await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: true });
      return {
        content: `Dry run prepared for Shopify: ${plan.summary}. Shopify was not changed.`,
        data: {
          operation: plan.operation,
          shop: plan.shop,
          dryRun: true,
          query: plan.query,
          variables: plan.variables ?? {},
        },
      };
    }
    const shopRecord = await getConnectedShop(ctx, runCtx.companyId, plan.shop);
    const result = await executeGraphql(ctx, config, runCtx.companyId, shopRecord, plan.query, plan.variables);
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `Shopify command completed: ${plan.summary}.`,
      data: {
        operation: plan.operation,
        shop: plan.shop,
        dryRun: false,
        result: result.data,
        extensions: result.extensions ?? null,
        truncated: result.truncated,
      },
    };
  } catch (err) {
    await auditCommand(ctx, runCtx, plan, { ok: false, dryRun: config.dryRun && plan.mutating });
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function shopOverview(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "load Shopify shop overview",
    shop,
    mutating: false,
    query: `query ShopOverview {
      shop {
        name
        email
        currencyCode
        myshopifyDomain
        primaryDomain { host url }
        plan { displayName partnerDevelopment }
      }
      appInstallation { accessScopes { handle } }
    }`,
  };
}

function productsSearch(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "search Shopify products",
    shop,
    mutating: false,
    query: `query ProductsSearch($first: Int!, $query: String) {
      products(first: $first, query: $query) {
        edges {
          node {
            id title handle status totalInventory updatedAt
            variants(first: 10) { edges { node { id title sku price inventoryQuantity } } }
          }
        }
      }
    }`,
    variables: {
      first: numberParam(params, "first", 25, 1, 100),
      query: stringParam(params, "query") || null,
    },
  };
}

function productGet(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "get Shopify product",
    shop,
    mutating: false,
    query: `query ProductGet($id: ID!) {
      product(id: $id) {
        id title handle descriptionHtml status vendor productType tags totalInventory
        options { id name values }
        variants(first: 50) { edges { node { id title sku price inventoryQuantity inventoryItem { id tracked } } } }
      }
    }`,
    variables: { id: requireString(params, "productId") },
  };
}

function productCreate(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "create",
    summary: "create Shopify product",
    shop,
    mutating: true,
    query: `mutation ProductCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product { id title handle status }
        userErrors { field message }
      }
    }`,
    variables: { product: jsonObject(params.product) },
  };
}

function productUpdate(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "update",
    summary: "update Shopify product",
    shop,
    mutating: true,
    query: `mutation ProductUpdate($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id title handle status updatedAt }
        userErrors { field message }
      }
    }`,
    variables: { product: jsonObject(params.product) },
  };
}

function inventoryLevels(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "read Shopify inventory levels",
    shop,
    mutating: false,
    query: `query InventoryLevels($first: Int!, $query: String) {
      inventoryItems(first: $first, query: $query) {
        edges {
          node {
            id sku tracked
            inventoryLevels(first: 10) {
              edges {
                node {
                  id
                  location { id name }
                  quantities(names: ["available", "committed", "on_hand"]) { name quantity }
                }
              }
            }
          }
        }
      }
    }`,
    variables: {
      first: numberParam(params, "first", 25, 1, 100),
      query: stringParam(params, "query") || null,
    },
  };
}

function maxAbsoluteDelta(value: unknown): number {
  if (typeof value === "number") return Math.abs(value);
  if (Array.isArray(value)) return Math.max(0, ...value.map(maxAbsoluteDelta));
  if (typeof value === "object" && value !== null) {
    return Math.max(0, ...Object.entries(value as Record<string, unknown>)
      .filter(([key]) => /delta|quantity|adjust/i.test(key))
      .map(([, item]) => maxAbsoluteDelta(item)));
  }
  return 0;
}

function inventoryAdjust(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  const input = jsonObject(params.input);
  const maxDelta = maxAbsoluteDelta(input);
  if (maxDelta > config.maxInventoryAdjustment) {
    throw new Error(`Inventory adjustment ${maxDelta} exceeds configured limit ${config.maxInventoryAdjustment}.`);
  }
  return {
    operation: "inventory",
    summary: "adjust Shopify inventory quantities",
    shop,
    mutating: true,
    query: `mutation InventoryAdjust($input: InventoryAdjustQuantitiesInput!) {
      inventoryAdjustQuantities(input: $input) {
        inventoryAdjustmentGroup { createdAt reason changes { name delta } }
        userErrors { field message }
      }
    }`,
    variables: { input },
  };
}

function ordersSearch(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "search Shopify orders",
    shop,
    mutating: false,
    query: `query OrdersSearch($first: Int!, $query: String) {
      orders(first: $first, query: $query) {
        edges {
          node {
            id name createdAt displayFinancialStatus displayFulfillmentStatus
            totalPriceSet { shopMoney { amount currencyCode } }
            customer { displayName email }
          }
        }
      }
    }`,
    variables: {
      first: numberParam(params, "first", 25, 1, 100),
      query: stringParam(params, "query") || null,
    },
  };
}

function orderGet(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "get Shopify order",
    shop,
    mutating: false,
    query: `query OrderGet($id: ID!) {
      order(id: $id) {
        id name createdAt displayFinancialStatus displayFulfillmentStatus
        totalPriceSet { shopMoney { amount currencyCode } }
        lineItems(first: 50) { edges { node { title quantity sku originalUnitPriceSet { shopMoney { amount currencyCode } } } } }
      }
    }`,
    variables: { id: requireString(params, "orderId") },
  };
}

function collectionsSearch(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "read",
    summary: "search Shopify collections",
    shop,
    mutating: false,
    query: `query CollectionsSearch($first: Int!, $query: String) {
      collections(first: $first, query: $query) {
        edges { node { id title handle updatedAt productsCount { count } } }
      }
    }`,
    variables: {
      first: numberParam(params, "first", 25, 1, 100),
      query: stringParam(params, "query") || null,
    },
  };
}

function pageCreateOrUpdate(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  const pageId = stringParam(params, "pageId");
  return {
    operation: pageId ? "update" : "create",
    summary: pageId ? "update Shopify online store page" : "create Shopify online store page",
    shop,
    mutating: true,
    query: pageId
      ? `mutation PageUpdate($id: ID!, $page: PageUpdateInput!) {
          pageUpdate(id: $id, page: $page) { page { id title handle updatedAt } userErrors { field message } }
        }`
      : `mutation PageCreate($page: PageCreateInput!) {
          pageCreate(page: $page) { page { id title handle } userErrors { field message } }
        }`,
    variables: pageId ? { id: pageId, page: jsonObject(params.page) } : { page: jsonObject(params.page) },
  };
}

function webhookSubscriptionsList(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "webhook",
    summary: "list Shopify webhook subscriptions",
    shop,
    mutating: false,
    query: `query WebhookSubscriptions($first: Int!) {
      webhookSubscriptions(first: $first) {
        edges { node { id topic format endpoint { __typename } createdAt updatedAt } }
      }
    }`,
    variables: { first: numberParam(params, "first", 25, 1, 100) },
  };
}

function webhookSubscribe(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  const shop = requireShop(params, config);
  return {
    operation: "webhook",
    summary: "create Shopify webhook subscription",
    shop,
    mutating: true,
    query: `mutation WebhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $subscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $subscription) {
        webhookSubscription { id topic format }
        userErrors { field message }
      }
    }`,
    variables: {
      topic: requireString(params, "topic"),
      subscription: {
        callbackUrl: requireString(params, "callbackUrl"),
        format: stringParam(params, "format", "JSON"),
      },
    },
  };
}

function rawGraphql(params: ToolParams, config: ShopifyConfig): GraphqlPlan {
  if (!config.enableRawGraphqlTool) throw new Error("Raw Shopify GraphQL tool is disabled in plugin settings.");
  const shop = requireShop(params, config);
  const query = requireString(params, "query");
  const operation = stringParam(params, "operation", "raw") as ShopifyOperation;
  const mutating = /^\s*mutation\b/i.test(query);
  return {
    operation,
    summary: "run raw Shopify Admin GraphQL",
    shop,
    mutating,
    query,
    variables: jsonObject(params.variables),
  };
}

const builders: Record<string, (params: ToolParams, config: ShopifyConfig) => GraphqlPlan> = {
  [TOOL_NAMES.shopOverview]: shopOverview,
  [TOOL_NAMES.productsSearch]: productsSearch,
  [TOOL_NAMES.productGet]: productGet,
  [TOOL_NAMES.productCreate]: productCreate,
  [TOOL_NAMES.productUpdate]: productUpdate,
  [TOOL_NAMES.inventoryLevels]: inventoryLevels,
  [TOOL_NAMES.inventoryAdjust]: inventoryAdjust,
  [TOOL_NAMES.ordersSearch]: ordersSearch,
  [TOOL_NAMES.orderGet]: orderGet,
  [TOOL_NAMES.collectionsSearch]: collectionsSearch,
  [TOOL_NAMES.pageCreateOrUpdate]: pageCreateOrUpdate,
  [TOOL_NAMES.webhookSubscriptionsList]: webhookSubscriptionsList,
  [TOOL_NAMES.webhookSubscribe]: webhookSubscribe,
  [TOOL_NAMES.runGraphql]: rawGraphql,
};

let activeContext: PluginContext | null = null;

async function registerToolHandlers(ctx: PluginContext) {
  const declarations = new Map((manifest.tools ?? []).map((tool) => [tool.name, tool]));
  for (const [name, builder] of Object.entries(builders)) {
    const declaration = declarations.get(name);
    ctx.tools.register(name, {
      displayName: declaration?.displayName ?? name,
      description: declaration?.description ?? `Run ${name}`,
      parametersSchema: declaration?.parametersSchema ?? { type: "object" },
    }, async (params, runCtx) => {
      const config = await getConfig(ctx);
      const plan = builder(asObject(params), config);
      return executePlan(ctx, config, runCtx, plan);
    });
  }
}

function inferBaseUrl(input: PluginApiRequestInput, config: ShopifyConfig): string {
  const configured = config.publicBaseUrl.replace(/\/+$/g, "");
  if (configured) return configured;
  const host = input.headers.host ?? input.headers["x-forwarded-host"];
  if (!host) return "http://127.0.0.1:3100";
  const proto = input.headers["x-forwarded-proto"] ?? "http";
  return `${proto}://${host}`.replace(/\/+$/g, "");
}

async function handleOAuthStart(ctx: PluginContext, input: PluginApiRequestInput): Promise<PluginApiResponse> {
  const config = await getConfig(ctx);
  if (!config.appApiKey || !config.appApiSecretRef) {
    return { status: 400, body: { error: "Shopify app API key and app secret ref must be configured first." } };
  }
  const shop = normalizeShopDomain(input.query.shop);
  if (!shop) return { status: 400, body: { error: "A valid shop query parameter is required." } };
  if (!isAllowedShop(config, shop)) return { status: 403, body: { error: `Shop ${shop} is not allowed.` } };
  const state = randomUUID();
  const states = await loadOAuthStates(ctx, input.companyId);
  await ctx.state.set({ scopeKind: "company", scopeId: input.companyId, stateKey: STATE_KEYS.oauthStates }, [{
    state,
    shop,
    companyId: input.companyId,
    createdAt: new Date().toISOString(),
    actorId: input.actor.actorId,
  }, ...states].slice(0, 20));
  const callback = `${inferBaseUrl(input, config)}/api/plugins/${PLUGIN_ID}/api/oauth/callback`;
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", config.appApiKey);
  url.searchParams.set("scope", config.requestedScopes.join(","));
  url.searchParams.set("redirect_uri", callback);
  url.searchParams.set("state", state);
  return {
    body: {
      shop,
      scopes: config.requestedScopes,
      redirectUri: callback,
      authorizationUrl: url.toString(),
    },
  };
}

async function handleOAuthCallback(ctx: PluginContext, input: PluginApiRequestInput): Promise<PluginApiResponse> {
  const config = await getConfig(ctx);
  const shop = normalizeShopDomain(input.query.shop);
  const code = typeof input.query.code === "string" ? input.query.code : "";
  const state = typeof input.query.state === "string" ? input.query.state : "";
  if (!shop || !code || !state) return { status: 400, body: { error: "shop, code, and state are required." } };
  const appSecret = await ctx.secrets.resolve(config.appApiSecretRef);
  if (!verifyShopifyHmac(input.query, appSecret)) return { status: 401, body: { error: "Invalid Shopify OAuth HMAC." } };
  const states = await loadOAuthStates(ctx, input.companyId);
  if (!states.some((candidate) => candidate.state === state && candidate.shop === shop)) {
    return { status: 401, body: { error: "Invalid or expired OAuth state." } };
  }
  const tokenResponse = await ctx.http.fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: config.appApiKey,
      client_secret: appSecret,
      code,
    }),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  const tokenPayload = jsonObject(await tokenResponse.json().catch(() => ({})));
  if (!tokenResponse.ok || typeof tokenPayload.access_token !== "string") {
    return { status: 502, body: { error: "Shopify token exchange failed.", details: tokenPayload } };
  }
  const scopes = typeof tokenPayload.scope === "string"
    ? tokenPayload.scope.split(",").map((scope) => scope.trim()).filter(Boolean)
    : config.requestedScopes;
  const secret = await ctx.secrets.upsert({
    companyId: input.companyId,
    name: `shopify:${shop}:admin-access-token`,
    value: tokenPayload.access_token,
    externalRef: shop,
    description: `Shopify Admin API access token for ${shop}.`,
  });
  const existing = await loadConnectedShops(ctx, input.companyId);
  const previous = existing.find((item) => item.shop === shop);
  await saveConnectedShop(ctx, input.companyId, {
    shop,
    accessTokenSecretRef: secret.secretRef,
    scopes,
    connectedAt: previous?.connectedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await ctx.state.set({ scopeKind: "company", scopeId: input.companyId, stateKey: STATE_KEYS.oauthStates }, states.filter((item) => item.state !== state));
  await ctx.activity.log({
    companyId: input.companyId,
    message: `Shopify store connected: ${shop}`,
    metadata: { shop, scopes },
  });
  return {
    body: {
      ok: true,
      shop,
      scopes,
      message: "Shopify store connected. You can close this page and return to PaperClaw.",
    },
  };
}

async function registerDataHandlers(ctx: PluginContext) {
  ctx.data.register(DATA_KEYS.status, async (params) => {
    const companyId = stringParam(params, "companyId");
    const { config, errors, warnings } = validateConfig(await ctx.config.get());
    const shops = companyId ? await loadConnectedShops(ctx, companyId) : [];
    return {
      pluginId: PLUGIN_ID,
      version: PLUGIN_VERSION,
      configured: errors.length === 0,
      dryRun: config.dryRun,
      rawEnabled: config.enableRawGraphqlTool,
      apiVersion: config.apiVersion,
      requestedScopes: config.requestedScopes,
      allowedOperations: config.allowedOperations,
      allowedShopDomains: config.allowedShopDomains,
      shops: shops.map(({ accessTokenSecretRef: _secret, ...shop }) => shop),
      errors,
      warnings,
    };
  });

  ctx.data.register(DATA_KEYS.recentCommands, async (params) => {
    const companyId = stringParam(params, "companyId");
    if (!companyId) return { commands: [] };
    const existing = await ctx.state.get({ scopeKind: "company", scopeId: companyId, stateKey: STATE_KEYS.recentCommands });
    return { commands: Array.isArray(existing) ? existing.slice(0, 20) : [] };
  });
}

const plugin = definePlugin({
  async setup(ctx) {
    activeContext = ctx;
    await registerDataHandlers(ctx);
    await registerToolHandlers(ctx);
    ctx.logger.info("Shopify plugin setup complete");
  },

  async onValidateConfig(config) {
    const result = validateConfig(config);
    return {
      ok: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
    };
  },

  async onApiRequest(input) {
    if (!activeContext) return { status: 503, body: { error: "Shopify plugin is not ready." } };
    if (input.routeKey === ROUTE_KEYS.oauthStart) return handleOAuthStart(activeContext, input);
    if (input.routeKey === ROUTE_KEYS.oauthCallback) return handleOAuthCallback(activeContext, input);
    return { status: 404, body: { error: "Unknown Shopify plugin route." } };
  },

  async onWebhook(input: PluginWebhookInput) {
    // The endpoint is an audit landing zone. Agents create explicit webhook
    // subscriptions through the curated tool once operators choose a callback.
    // Signature verification requires a company/shop lookup, so the raw body is
    // intentionally not trusted for automated actions here.
    void input;
  },

  async onHealth() {
    return { status: "ok", message: "Shopify plugin worker is running." };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
