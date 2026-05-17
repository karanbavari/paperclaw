export const PLUGIN_ID = "paperclaw.stripe";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "stripe";

export const EXPORT_NAMES = {
  page: "StripePage",
  settingsPage: "StripeSettingsPage",
  dashboardWidget: "StripeDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "stripe-page",
  settingsPage: "stripe-settings-page",
  dashboardWidget: "stripe-dashboard-widget",
} as const;

export const DATA_KEYS = {
  status: "status",
  recentCommands: "recent-commands",
  recentWebhooks: "recent-webhooks",
} as const;

export const STATE_KEYS = {
  recentCommands: "recent-commands",
  recentWebhooks: "recent-webhooks",
  processedWebhookEvents: "processed-webhook-events",
} as const;

export const TOOL_NAMES = {
  paymentIntentsList: "stripe.paymentIntentsList",
  paymentIntentGet: "stripe.paymentIntentGet",
  paymentIntentCreate: "stripe.paymentIntentCreate",
  paymentIntentUpdate: "stripe.paymentIntentUpdate",
  paymentIntentCapture: "stripe.paymentIntentCapture",
  paymentIntentCancel: "stripe.paymentIntentCancel",
  refundsList: "stripe.refundsList",
  refundGet: "stripe.refundGet",
  refundCreate: "stripe.refundCreate",
  refundCancel: "stripe.refundCancel",
  checkoutSessionsList: "stripe.checkoutSessionsList",
  checkoutSessionGet: "stripe.checkoutSessionGet",
  checkoutSessionCreate: "stripe.checkoutSessionCreate",
  checkoutSessionExpire: "stripe.checkoutSessionExpire",
  checkoutSessionLineItems: "stripe.checkoutSessionLineItems",
  customersList: "stripe.customersList",
  customerGet: "stripe.customerGet",
  customerCreate: "stripe.customerCreate",
  customerUpdate: "stripe.customerUpdate",
  productsList: "stripe.productsList",
  productGet: "stripe.productGet",
  productCreate: "stripe.productCreate",
  productUpdate: "stripe.productUpdate",
  pricesList: "stripe.pricesList",
  priceGet: "stripe.priceGet",
  priceCreate: "stripe.priceCreate",
  priceUpdate: "stripe.priceUpdate",
} as const;

export const DEFAULT_ALLOWED_OPERATIONS = [
  "read",
  "payment_intent",
  "refund",
  "checkout_session",
  "customer",
  "product",
  "price",
  "webhook",
] as const;

export const DEFAULT_CONFIG = {
  apiBaseUrl: "https://api.stripe.com/v1",
  secretKeyRef: "",
  webhookSecretRef: "",
  modeLabel: "test",
  dryRun: true,
  allowedOperations: [...DEFAULT_ALLOWED_OPERATIONS],
  allowedCurrencies: ["usd", "inr"],
  maxPaymentAmountSubunits: 10_000_000,
  maxRefundAmountSubunits: 10_000_000,
  webhookToleranceSeconds: 300,
  timeoutMs: 30_000,
  maxOutputBytes: 32_000,
} as const;
