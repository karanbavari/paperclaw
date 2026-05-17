export const PLUGIN_ID = "paperclaw.razorpay";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "razorpay";

export const EXPORT_NAMES = {
  page: "RazorpayPage",
  settingsPage: "RazorpaySettingsPage",
  dashboardWidget: "RazorpayDashboardWidget",
} as const;

export const SLOT_IDS = {
  page: "razorpay-page",
  settingsPage: "razorpay-settings-page",
  dashboardWidget: "razorpay-dashboard-widget",
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
  paymentsList: "razorpay.paymentsList",
  paymentGet: "razorpay.paymentGet",
  paymentCapture: "razorpay.paymentCapture",
  paymentUpdateNotes: "razorpay.paymentUpdateNotes",
  ordersList: "razorpay.ordersList",
  orderCreate: "razorpay.orderCreate",
  orderGet: "razorpay.orderGet",
  orderUpdateNotes: "razorpay.orderUpdateNotes",
  orderPayments: "razorpay.orderPayments",
  refundsList: "razorpay.refundsList",
  refundGet: "razorpay.refundGet",
  refundCreate: "razorpay.refundCreate",
  refundUpdateNotes: "razorpay.refundUpdateNotes",
  paymentRefundsList: "razorpay.paymentRefundsList",
  paymentLinksList: "razorpay.paymentLinksList",
  paymentLinkCreate: "razorpay.paymentLinkCreate",
  paymentLinkGet: "razorpay.paymentLinkGet",
  paymentLinkUpdate: "razorpay.paymentLinkUpdate",
  paymentLinkCancel: "razorpay.paymentLinkCancel",
  paymentLinkNotify: "razorpay.paymentLinkNotify",
  customersList: "razorpay.customersList",
  customerCreate: "razorpay.customerCreate",
  customerGet: "razorpay.customerGet",
  customerUpdate: "razorpay.customerUpdate",
} as const;

export const DEFAULT_ALLOWED_OPERATIONS = [
  "read",
  "order",
  "capture",
  "refund",
  "payment_link",
  "customer",
  "webhook",
] as const;

export const DEFAULT_CONFIG = {
  apiBaseUrl: "https://api.razorpay.com/v1",
  keyId: "",
  keySecretRef: "",
  webhookSecretRef: "",
  modeLabel: "test",
  dryRun: true,
  allowedOperations: [...DEFAULT_ALLOWED_OPERATIONS],
  allowedCurrencies: ["INR"],
  maxOrderAmountSubunits: 10_000_000,
  maxRefundAmountSubunits: 10_000_000,
  timeoutMs: 30_000,
  maxOutputBytes: 32_000,
} as const;
