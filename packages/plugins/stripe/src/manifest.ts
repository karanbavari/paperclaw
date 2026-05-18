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
const currencyParam = { type: "string", default: "usd" } as const;
const objectParam = { type: "object" } as const;
const arrayParam = { type: "array" } as const;
const limitParam = { type: "number", minimum: 1, maximum: 100, default: 25 } as const;

const manifest: PaperClawPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Stripe",
  description: "Connects PaperClaw agents to Stripe merchant APIs for PaymentIntents, refunds, Checkout Sessions, customers, products, prices, and webhooks.",
  author: "PaperClaw",
  categories: ["finance", "connector", "automation", "workspace", "ui"],
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
      apiBaseUrl: { type: "string", title: "API Base URL", default: DEFAULT_CONFIG.apiBaseUrl },
      secretKeyRef: { type: "string", title: "Stripe Secret Key", format: "secret-ref", default: DEFAULT_CONFIG.secretKeyRef },
      webhookSecretRef: { type: "string", title: "Webhook Signing Secret", format: "secret-ref", default: DEFAULT_CONFIG.webhookSecretRef },
      modeLabel: { type: "string", title: "Mode", default: DEFAULT_CONFIG.modeLabel, enum: ["test", "live"] },
      dryRun: {
        type: "boolean",
        title: "Dry Run",
        default: DEFAULT_CONFIG.dryRun,
        description: "When enabled, mutating Stripe tools return the planned request without changing Stripe.",
      },
      allowedOperations: { type: "array", title: "Allowed Operations", default: DEFAULT_ALLOWED_OPERATIONS, items: { type: "string" } },
      allowedCurrencies: { type: "array", title: "Allowed Currencies", default: DEFAULT_CONFIG.allowedCurrencies, items: { type: "string" } },
      maxPaymentAmountSubunits: { type: "number", title: "Max Payment Amount Subunits", default: DEFAULT_CONFIG.maxPaymentAmountSubunits, minimum: 0 },
      maxRefundAmountSubunits: { type: "number", title: "Max Refund Amount Subunits", default: DEFAULT_CONFIG.maxRefundAmountSubunits, minimum: 0 },
      webhookToleranceSeconds: { type: "number", title: "Webhook Tolerance Seconds", default: DEFAULT_CONFIG.webhookToleranceSeconds, minimum: 0, maximum: 86400 },
      timeoutMs: { type: "number", title: "HTTP Timeout Milliseconds", default: DEFAULT_CONFIG.timeoutMs, minimum: 5000, maximum: 120000 },
      maxOutputBytes: { type: "number", title: "Max Output Bytes", default: DEFAULT_CONFIG.maxOutputBytes, minimum: 4000, maximum: 500000 },
    },
  },
  webhooks: [
    {
      endpointKey: "stripe",
      displayName: "Stripe Webhooks",
      description: "Receives Stripe webhook callbacks and verifies Stripe-Signature.",
    },
  ],
  tools: [
    { name: TOOL_NAMES.paymentIntentsList, displayName: "List PaymentIntents", description: "List Stripe PaymentIntents.", parametersSchema: { type: "object", properties: { limit: limitParam, customer: idParam, created: objectParam, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.paymentIntentGet, displayName: "Get PaymentIntent", description: "Fetch a PaymentIntent by ID.", parametersSchema: { type: "object", properties: { paymentIntentId: idParam }, required: ["paymentIntentId"] } },
    { name: TOOL_NAMES.paymentIntentCreate, displayName: "Create PaymentIntent", description: "Create a PaymentIntent. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { amount: amountParam, currency: currencyParam, customer: idParam, description: idParam, metadata: objectParam, automatic_payment_methods: objectParam, idempotencyKey: idParam }, required: ["amount", "currency"] } },
    { name: TOOL_NAMES.paymentIntentUpdate, displayName: "Update PaymentIntent", description: "Update a PaymentIntent.", parametersSchema: { type: "object", properties: { paymentIntentId: idParam, patch: objectParam, idempotencyKey: idParam }, required: ["paymentIntentId", "patch"] } },
    { name: TOOL_NAMES.paymentIntentCapture, displayName: "Capture PaymentIntent", description: "Capture an uncaptured PaymentIntent.", parametersSchema: { type: "object", properties: { paymentIntentId: idParam, amount_to_capture: amountParam, idempotencyKey: idParam }, required: ["paymentIntentId"] } },
    { name: TOOL_NAMES.paymentIntentCancel, displayName: "Cancel PaymentIntent", description: "Cancel a PaymentIntent.", parametersSchema: { type: "object", properties: { paymentIntentId: idParam, cancellation_reason: idParam, idempotencyKey: idParam }, required: ["paymentIntentId"] } },
    { name: TOOL_NAMES.refundsList, displayName: "List Refunds", description: "List Stripe refunds.", parametersSchema: { type: "object", properties: { limit: limitParam, payment_intent: idParam, charge: idParam, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.refundGet, displayName: "Get Refund", description: "Fetch a refund by ID.", parametersSchema: { type: "object", properties: { refundId: idParam }, required: ["refundId"] } },
    { name: TOOL_NAMES.refundCreate, displayName: "Create Refund", description: "Create a refund. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { payment_intent: idParam, charge: idParam, amount: amountParam, reason: idParam, metadata: objectParam, idempotencyKey: idParam } } },
    { name: TOOL_NAMES.refundCancel, displayName: "Cancel Refund", description: "Cancel a pending refund.", parametersSchema: { type: "object", properties: { refundId: idParam, idempotencyKey: idParam }, required: ["refundId"] } },
    { name: TOOL_NAMES.checkoutSessionsList, displayName: "List Checkout Sessions", description: "List Checkout Sessions.", parametersSchema: { type: "object", properties: { limit: limitParam, customer: idParam, payment_intent: idParam, status: idParam, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.checkoutSessionGet, displayName: "Get Checkout Session", description: "Fetch a Checkout Session by ID.", parametersSchema: { type: "object", properties: { checkoutSessionId: idParam }, required: ["checkoutSessionId"] } },
    { name: TOOL_NAMES.checkoutSessionCreate, displayName: "Create Checkout Session", description: "Create a Checkout Session. Dry run is enabled by default.", parametersSchema: { type: "object", properties: { mode: idParam, line_items: arrayParam, success_url: idParam, cancel_url: idParam, customer: idParam, customer_email: idParam, metadata: objectParam, idempotencyKey: idParam }, required: ["mode", "line_items", "success_url"] } },
    { name: TOOL_NAMES.checkoutSessionExpire, displayName: "Expire Checkout Session", description: "Expire an open Checkout Session.", parametersSchema: { type: "object", properties: { checkoutSessionId: idParam, idempotencyKey: idParam }, required: ["checkoutSessionId"] } },
    { name: TOOL_NAMES.checkoutSessionLineItems, displayName: "Checkout Session Line Items", description: "List line items for a Checkout Session.", parametersSchema: { type: "object", properties: { checkoutSessionId: idParam, limit: limitParam }, required: ["checkoutSessionId"] } },
    { name: TOOL_NAMES.customersList, displayName: "List Customers", description: "List Stripe customers.", parametersSchema: { type: "object", properties: { limit: limitParam, email: idParam, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.customerGet, displayName: "Get Customer", description: "Fetch a customer by ID.", parametersSchema: { type: "object", properties: { customerId: idParam }, required: ["customerId"] } },
    { name: TOOL_NAMES.customerCreate, displayName: "Create Customer", description: "Create a customer.", parametersSchema: { type: "object", properties: { name: idParam, email: idParam, phone: idParam, description: idParam, metadata: objectParam, idempotencyKey: idParam } } },
    { name: TOOL_NAMES.customerUpdate, displayName: "Update Customer", description: "Update a customer.", parametersSchema: { type: "object", properties: { customerId: idParam, patch: objectParam, idempotencyKey: idParam }, required: ["customerId", "patch"] } },
    { name: TOOL_NAMES.productsList, displayName: "List Products", description: "List Stripe products.", parametersSchema: { type: "object", properties: { limit: limitParam, active: { type: "boolean" }, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.productGet, displayName: "Get Product", description: "Fetch a product by ID.", parametersSchema: { type: "object", properties: { productId: idParam }, required: ["productId"] } },
    { name: TOOL_NAMES.productCreate, displayName: "Create Product", description: "Create a product.", parametersSchema: { type: "object", properties: { name: idParam, description: idParam, active: { type: "boolean" }, metadata: objectParam, idempotencyKey: idParam }, required: ["name"] } },
    { name: TOOL_NAMES.productUpdate, displayName: "Update Product", description: "Update a product.", parametersSchema: { type: "object", properties: { productId: idParam, patch: objectParam, idempotencyKey: idParam }, required: ["productId", "patch"] } },
    { name: TOOL_NAMES.pricesList, displayName: "List Prices", description: "List Stripe prices.", parametersSchema: { type: "object", properties: { limit: limitParam, active: { type: "boolean" }, product: idParam, currency: currencyParam, starting_after: idParam, ending_before: idParam } } },
    { name: TOOL_NAMES.priceGet, displayName: "Get Price", description: "Fetch a price by ID.", parametersSchema: { type: "object", properties: { priceId: idParam }, required: ["priceId"] } },
    { name: TOOL_NAMES.priceCreate, displayName: "Create Price", description: "Create a price.", parametersSchema: { type: "object", properties: { unit_amount: amountParam, currency: currencyParam, product: idParam, recurring: objectParam, nickname: idParam, metadata: objectParam, idempotencyKey: idParam }, required: ["unit_amount", "currency", "product"] } },
    { name: TOOL_NAMES.priceUpdate, displayName: "Update Price", description: "Update a price.", parametersSchema: { type: "object", properties: { priceId: idParam, patch: objectParam, idempotencyKey: idParam }, required: ["priceId", "patch"] } },
  ],
  ui: {
    slots: [
      { type: "page", id: SLOT_IDS.page, displayName: "Stripe", exportName: EXPORT_NAMES.page, routePath: PAGE_ROUTE, order: 56 },
      { type: "settingsPage", id: SLOT_IDS.settingsPage, displayName: "Stripe", exportName: EXPORT_NAMES.settingsPage, order: 56 },
      { type: "dashboardWidget", id: SLOT_IDS.dashboardWidget, displayName: "Stripe", exportName: EXPORT_NAMES.dashboardWidget, order: 56 },
    ],
  },
};

export default manifest;
