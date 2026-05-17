export const PLUGIN_ID = "paperclaw.shopify";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "shopify";

export const EXPORT_NAMES = {
  page: "ShopifyPage",
  settingsPage: "ShopifySettingsPage",
  dashboardWidget: "ShopifyDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "shopify-page",
  settingsPage: "shopify-settings-page",
  dashboardWidget: "shopify-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const ROUTE_KEYS = {
  oauthStart: "oauth.start",
  oauthCallback: "oauth.callback",
} as const;

export const STATE_KEYS = {
  shops: "shops",
  oauthStates: "oauth-states",
  recentCommands: "recent-commands",
  lastWebhook: "last-webhook",
} as const;

export const TOOL_NAMES = {
  shopOverview: "shopify.shopOverview",
  productsSearch: "shopify.productsSearch",
  productGet: "shopify.productGet",
  productCreate: "shopify.productCreate",
  productUpdate: "shopify.productUpdate",
  inventoryLevels: "shopify.inventoryLevels",
  inventoryAdjust: "shopify.inventoryAdjust",
  ordersSearch: "shopify.ordersSearch",
  orderGet: "shopify.orderGet",
  collectionsSearch: "shopify.collectionsSearch",
  pageCreateOrUpdate: "shopify.pageCreateOrUpdate",
  webhookSubscriptionsList: "shopify.webhookSubscriptionsList",
  webhookSubscribe: "shopify.webhookSubscribe",
  runGraphql: "shopify.runGraphql",
} as const;

export const DEFAULT_ALLOWED_OPERATIONS = [
  "read",
  "create",
  "update",
  "inventory",
  "webhook",
] as const;

export const DEFAULT_SCOPES = [
  "read_products",
  "write_products",
  "read_inventory",
  "write_inventory",
  "read_orders",
] as const;

export const DEFAULT_CONFIG = {
  apiVersion: "2026-04",
  publicBaseUrl: "",
  appApiKey: "",
  appApiSecretRef: "",
  requestedScopes: [...DEFAULT_SCOPES],
  dryRun: true,
  enableRawGraphqlTool: false,
  allowedOperations: [...DEFAULT_ALLOWED_OPERATIONS],
  allowedShopDomains: [] as string[],
  maxInventoryAdjustment: 100,
  maxProductPriceChangePercent: 25,
  maxOutputBytes: 32_000,
  timeoutMs: 30_000,
};
