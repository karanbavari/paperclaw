import type { PaperClawPluginManifestV1 } from "@kesarcloud/plugin-sdk";
import {
  DEFAULT_ALLOWED_OPERATIONS,
  DEFAULT_CONFIG,
  EXPORT_NAMES,
  PAGE_ROUTE,
  PLUGIN_ID,
  PLUGIN_VERSION,
  SLOT_IDS,
  TOOL_NAMES,
} from "./constants.js";

const idParam = { type: "string" } as const;
const amountParam = { type: "number", minimum: 0 } as const;
const currencyParam = { type: "string", default: "INR" } as const;
const notesParam = { type: "object" } as const;
const countParam = { type: "number", minimum: 1, maximum: 100, default: 25 } as const;
const skipParam = { type: "number", minimum: 0, default: 0 } as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Razorpay",
  description: "Connects PaperClaw agents to Razorpay merchant APIs for orders, payments, refunds, payment links, customers, and webhooks.",
  author: "PaperClaw",
  categories: ["connector", "automation", "workspace", "ui"],
  capabilities: [
    "agent.tools.register",
    "http.outbound",
    "secrets.read-ref",
    "plugin.state.read",
    "plugin.state.write",
    "activity.log.write",
    "instance.settings.register",
    "ui.page.register",
    "ui.dashboardWidget.register",
    "webhooks.receive",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  instanceConfigSchema: {
    type: "object",
    properties: {
      apiBaseUrl: {
        type: "string",
        title: "API Base URL",
        default: DEFAULT_CONFIG.apiBaseUrl,
      },
      keyId: {
        type: "string",
        title: "Razorpay Key ID",
        default: DEFAULT_CONFIG.keyId,
      },
      keySecretRef: {
        type: "string",
        title: "Razorpay Key Secret",
        format: "secret-ref",
        default: DEFAULT_CONFIG.keySecretRef,
      },
      webhookSecretRef: {
        type: "string",
        title: "Webhook Secret",
        format: "secret-ref",
        default: DEFAULT_CONFIG.webhookSecretRef,
      },
      modeLabel: {
        type: "string",
        title: "Mode",
        default: DEFAULT_CONFIG.modeLabel,
        enum: ["test", "live"],
      },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating Razorpay tools return the planned request without changing Razorpay.",
      },
      allowedOperations: {
        type: "array",
        title: "Allowed Operations",
        default: DEFAULT_ALLOWED_OPERATIONS,
        items: { type: "string" },
      },
      allowedCurrencies: {
        type: "array",
        title: "Allowed Currencies",
        default: DEFAULT_CONFIG.allowedCurrencies,
        items: { type: "string" },
      },
      maxOrderAmountSubunits: {
        type: "number",
        title: "Max Order Amount Subunits",
        default: DEFAULT_CONFIG.maxOrderAmountSubunits,
        minimum: 0,
      },
      maxRefundAmountSubunits: {
        type: "number",
        title: "Max Refund Amount Subunits",
        default: DEFAULT_CONFIG.maxRefundAmountSubunits,
        minimum: 0,
      },
      timeoutMs: {
        type: "number",
        title: "HTTP Timeout Milliseconds",
        default: DEFAULT_CONFIG.timeoutMs,
        minimum: 5000,
        maximum: 120000,
      },
      maxOutputBytes: {
        type: "number",
        title: "Max Output Bytes",
        default: DEFAULT_CONFIG.maxOutputBytes,
        minimum: 4000,
        maximum: 500000,
      },
    },
  },
  webhooks: [
    {
      endpointKey: "razorpay",
      displayName: "Razorpay Webhooks",
      description: "Receives Razorpay webhook callbacks and verifies X-Razorpay-Signature.",
    },
  ],
  tools: [
    { name: TOOL_NAMES.paymentsList, displayName: "List Payments", description: "Fetch Razorpay payments.", parametersSchema: { type: "object", properties: { count: countParam, skip: skipParam, from: amountParam, to: amountParam } } },
    { name: TOOL_NAMES.paymentGet, displayName: "Get Payment", description: "Fetch a payment by ID.", parametersSchema: { type: "object", properties: { paymentId: idParam }, required: ["paymentId"] } },
    { name: TOOL_NAMES.paymentCapture, displayName: "Capture Payment", description: "Capture an authorized payment. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { paymentId: idParam, amount: amountParam, currency: currencyParam }, required: ["paymentId", "amount", "currency"] } },
    { name: TOOL_NAMES.paymentUpdateNotes, displayName: "Update Payment Notes", description: "Update payment notes.", parametersSchema: { type: "object", properties: { paymentId: idParam, notes: notesParam }, required: ["paymentId", "notes"] } },
    { name: TOOL_NAMES.ordersList, displayName: "List Orders", description: "Fetch Razorpay orders.", parametersSchema: { type: "object", properties: { count: countParam, skip: skipParam, from: amountParam, to: amountParam, receipt: idParam } } },
    { name: TOOL_NAMES.orderCreate, displayName: "Create Order", description: "Create a Razorpay order. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { amount: amountParam, currency: currencyParam, receipt: idParam, notes: notesParam, partial_payment: { type: "boolean" } }, required: ["amount", "currency"] } },
    { name: TOOL_NAMES.orderGet, displayName: "Get Order", description: "Fetch an order by ID.", parametersSchema: { type: "object", properties: { orderId: idParam }, required: ["orderId"] } },
    { name: TOOL_NAMES.orderUpdateNotes, displayName: "Update Order Notes", description: "Update order notes.", parametersSchema: { type: "object", properties: { orderId: idParam, notes: notesParam }, required: ["orderId", "notes"] } },
    { name: TOOL_NAMES.orderPayments, displayName: "Order Payments", description: "Fetch payments made for an order.", parametersSchema: { type: "object", properties: { orderId: idParam }, required: ["orderId"] } },
    { name: TOOL_NAMES.refundsList, displayName: "List Refunds", description: "Fetch all refunds.", parametersSchema: { type: "object", properties: { count: countParam, skip: skipParam, from: amountParam, to: amountParam } } },
    { name: TOOL_NAMES.refundGet, displayName: "Get Refund", description: "Fetch a refund by ID.", parametersSchema: { type: "object", properties: { refundId: idParam }, required: ["refundId"] } },
    { name: TOOL_NAMES.refundCreate, displayName: "Create Refund", description: "Create full or partial refund for a payment. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { paymentId: idParam, amount: amountParam, speed: idParam, receipt: idParam, notes: notesParam }, required: ["paymentId"] } },
    { name: TOOL_NAMES.refundUpdateNotes, displayName: "Update Refund Notes", description: "Update refund notes.", parametersSchema: { type: "object", properties: { refundId: idParam, notes: notesParam }, required: ["refundId", "notes"] } },
    { name: TOOL_NAMES.paymentRefundsList, displayName: "Payment Refunds", description: "Fetch refunds for a payment.", parametersSchema: { type: "object", properties: { paymentId: idParam }, required: ["paymentId"] } },
    { name: TOOL_NAMES.paymentLinksList, displayName: "List Payment Links", description: "Fetch payment links.", parametersSchema: { type: "object", properties: { count: countParam, skip: skipParam } } },
    { name: TOOL_NAMES.paymentLinkCreate, displayName: "Create Payment Link", description: "Create a payment link. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { amount: amountParam, currency: currencyParam, description: idParam, customer: notesParam, notify: notesParam, reminder_enable: { type: "boolean" }, notes: notesParam, callback_url: idParam, callback_method: idParam }, required: ["amount", "currency"] } },
    { name: TOOL_NAMES.paymentLinkGet, displayName: "Get Payment Link", description: "Fetch a payment link by ID.", parametersSchema: { type: "object", properties: { paymentLinkId: idParam }, required: ["paymentLinkId"] } },
    { name: TOOL_NAMES.paymentLinkUpdate, displayName: "Update Payment Link", description: "Update a payment link.", parametersSchema: { type: "object", properties: { paymentLinkId: idParam, patch: notesParam }, required: ["paymentLinkId", "patch"] } },
    { name: TOOL_NAMES.paymentLinkCancel, displayName: "Cancel Payment Link", description: "Cancel a payment link.", parametersSchema: { type: "object", properties: { paymentLinkId: idParam }, required: ["paymentLinkId"] } },
    { name: TOOL_NAMES.paymentLinkNotify, displayName: "Notify Payment Link", description: "Resend payment link notification by sms or email.", parametersSchema: { type: "object", properties: { paymentLinkId: idParam, medium: { type: "string", enum: ["sms", "email"] } }, required: ["paymentLinkId", "medium"] } },
    { name: TOOL_NAMES.customersList, displayName: "List Customers", description: "Fetch customers.", parametersSchema: { type: "object", properties: { count: countParam, skip: skipParam } } },
    { name: TOOL_NAMES.customerCreate, displayName: "Create Customer", description: "Create a Razorpay customer.", parametersSchema: { type: "object", properties: { name: idParam, email: idParam, contact: idParam, fail_existing: { type: "boolean" }, notes: notesParam } } },
    { name: TOOL_NAMES.customerGet, displayName: "Get Customer", description: "Fetch a customer by ID.", parametersSchema: { type: "object", properties: { customerId: idParam }, required: ["customerId"] } },
    { name: TOOL_NAMES.customerUpdate, displayName: "Update Customer", description: "Update a Razorpay customer.", parametersSchema: { type: "object", properties: { customerId: idParam, patch: notesParam }, required: ["customerId", "patch"] } },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "Razorpay", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE, order: 55 },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "Razorpay", exportName: EXPORT_NAMES.settingsPage, order: 55 },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "Razorpay", exportName: EXPORT_NAMES.dashboardWidget, order: 55 },
    ],
  },
};

export default manifest;
