import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_ALLOWED_OPERATIONS,
  DEFAULT_CONFIG,
  DEFAULT_SCOPES,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  ROUTE_KEYS,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const shopProperty = {
  type: "string",
  title: "Shop domain",
  description: "A *.myshopify.com domain, for example demo-store.myshopify.com.",
} as const;

const firstProperty = {
  type: "number",
  title: "Limit",
  default: 25,
  minimum: 1,
  maximum: 100,
} as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Shopify",
  description: "Connects PaperClaw agents to Shopify stores through OAuth and the Admin GraphQL API.",
  author: "PaperClaw",
  categories: ["connector", "automation", "workspace", "ui"],
  capabilities: [
    "agent.tools.register",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "instance.settings.register",
    "ui.page.register",
    "ui.dashboardWidget.register",
    "http.outbound",
    "secrets.read-ref",
    "secrets.write-ref",
    "api.routes.register",
    "webhooks.receive",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      publicBaseUrl: {
        type: "string",
        title: "Public Base URL",
        default: DEFAULT_CONFIG.publicBaseUrl,
        description: "Public PaperClaw URL used for Shopify OAuth callbacks when host headers are not enough.",
      },
      appApiKey: {
        type: "string",
        title: "Shopify App API Key",
        default: DEFAULT_CONFIG.appApiKey,
      },
      appApiSecretRef: {
        type: "string",
        title: "Shopify App Secret",
        format: "secret-ref",
        default: DEFAULT_CONFIG.appApiSecretRef,
        description: "Secret reference containing the app client secret used for OAuth HMAC checks and token exchange.",
      },
      apiVersion: {
        type: "string",
        title: "Admin API Version",
        default: DEFAULT_CONFIG.apiVersion,
      },
      requestedScopes: {
        type: "array",
        title: "OAuth Scopes",
        default: DEFAULT_SCOPES,
        items: { type: "string" },
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating tools preview GraphQL instead of changing Shopify.",
      },
      enableRawGraphqlTool: {
        type: "boolean",
        title: "Enable Raw GraphQL Tool",
        default: DEFAULT_CONFIG.enableRawGraphqlTool,
      },
      allowedOperations: {
        type: "array",
        title: "Allowed Operations",
        default: DEFAULT_ALLOWED_OPERATIONS,
        items: { type: "string" },
      },
      allowedShopDomains: {
        type: "array",
        title: "Allowed Shop Domains",
        default: DEFAULT_CONFIG.allowedShopDomains,
        items: { type: "string" },
        description: "Optional allowlist of *.myshopify.com domains. Empty means any connected shop.",
      },
      maxInventoryAdjustment: {
        type: "number",
        title: "Max Inventory Adjustment",
        default: DEFAULT_CONFIG.maxInventoryAdjustment,
        minimum: 0,
        maximum: 1000000,
      },
      maxProductPriceChangePercent: {
        type: "number",
        title: "Max Product Price Change Percent",
        default: DEFAULT_CONFIG.maxProductPriceChangePercent,
        minimum: 0,
        maximum: 100,
      },
      maxOutputBytes: {
        type: "number",
        title: "Max Output Bytes",
        default: DEFAULT_CONFIG.maxOutputBytes,
        minimum: 4000,
        maximum: 500000,
      },
      timeoutMs: {
        type: "number",
        title: "HTTP Timeout Milliseconds",
        default: DEFAULT_CONFIG.timeoutMs,
        minimum: 5000,
        maximum: 120000,
      },
    },
  },
  apiRoutes: [
    {
      routeKey: ROUTE_KEYS.oauthStart,
      method: "GET",
      path: "/oauth/start",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "query", key: "companyId" },
    },
    {
      routeKey: ROUTE_KEYS.oauthCallback,
      method: "GET",
      path: "/oauth/callback",
      auth: "board",
      capability: "api.routes.register",
      companyResolution: { from: "query", key: "companyId" },
    },
  ],
  webhooks: [
    {
      endpointKey: "shopify",
      displayName: "Shopify Webhooks",
      description: "Receives Shopify webhook callbacks and stores a small audit record.",
    },
  ],
  tools: [
    {
      name: TOOL_NAMES.shopOverview,
      displayName: "Shopify Shop Overview",
      description: "Read high-level shop identity, currency, plan, and API access status.",
      parametersSchema: { type: "object", properties: { shop: shopProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.productsSearch,
      displayName: "Search Products",
      description: "Search Shopify products with optional GraphQL query syntax.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, query: { type: "string" }, first: firstProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.productGet,
      displayName: "Get Product",
      description: "Get a product by GraphQL gid.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, productId: { type: "string" } }, required: ["shop", "productId"] },
    },
    {
      name: TOOL_NAMES.productCreate,
      displayName: "Create Product",
      description: "Create a product. Dry run is enabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, product: { type: "object" } }, required: ["shop", "product"] },
    },
    {
      name: TOOL_NAMES.productUpdate,
      displayName: "Update Product",
      description: "Update a product. Dry run is enabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, product: { type: "object" } }, required: ["shop", "product"] },
    },
    {
      name: TOOL_NAMES.inventoryLevels,
      displayName: "Inventory Levels",
      description: "Read inventory items and available quantities.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, query: { type: "string" }, first: firstProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.inventoryAdjust,
      displayName: "Adjust Inventory",
      description: "Adjust inventory quantities through Shopify Admin GraphQL. Dry run is enabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, input: { type: "object" } }, required: ["shop", "input"] },
    },
    {
      name: TOOL_NAMES.ordersSearch,
      displayName: "Search Orders",
      description: "Search orders by Shopify query syntax.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, query: { type: "string" }, first: firstProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.orderGet,
      displayName: "Get Order",
      description: "Get an order by GraphQL gid.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, orderId: { type: "string" } }, required: ["shop", "orderId"] },
    },
    {
      name: TOOL_NAMES.collectionsSearch,
      displayName: "Search Collections",
      description: "Search Shopify collections.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, query: { type: "string" }, first: firstProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.pageCreateOrUpdate,
      displayName: "Create or Update Page",
      description: "Create or update an online store page. Dry run is enabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, pageId: { type: "string" }, page: { type: "object" } }, required: ["shop", "page"] },
    },
    {
      name: TOOL_NAMES.webhookSubscriptionsList,
      displayName: "List Webhook Subscriptions",
      description: "List webhook subscriptions created by this app.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, first: firstProperty }, required: ["shop"] },
    },
    {
      name: TOOL_NAMES.webhookSubscribe,
      displayName: "Subscribe Webhook",
      description: "Create a Shopify webhook subscription. Dry run is enabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, topic: { type: "string" }, callbackUrl: { type: "string" }, format: { type: "string" } }, required: ["shop", "topic", "callbackUrl"] },
    },
    {
      name: TOOL_NAMES.runGraphql,
      displayName: "Run Shopify GraphQL",
      description: "Run governed raw Shopify Admin GraphQL. Disabled by default.",
      parametersSchema: { type: "object", properties: { shop: shopProperty, query: { type: "string" }, variables: { type: "object" }, operation: { type: "string" } }, required: ["shop", "query"] },
    },
  ],
  ui: {
    slots: [
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "Shopify",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
        order: 50,
      },
      {
        type: "settingsPage",
        id: SLOT_IDS.settingsPage,
        displayName: "Shopify",
        exportName: EXPORT_NAMES.settingsPage,
        order: 50,
      },
      {
        type: "dashboardWidget",
        id: SLOT_IDS.dashboardWidget,
        displayName: "Shopify",
        exportName: EXPORT_NAMES.dashboardWidget,
        order: 50,
      },
    ],
  },
};

export default manifest;
