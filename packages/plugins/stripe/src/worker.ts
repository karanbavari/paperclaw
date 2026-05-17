import {
  definePlugin,
  runWorker,
  type PluginContext,
  type PluginWebhookInput,
  type ToolResult,
  type ToolRunContext,
} from "@kesarcloud/plugin-sdk";
import { DATA_KEYS, PLUGIN_ID, PLUGIN_VERSION, STATE_KEYS, TOOL_NAMES } from "./constants.js";
import {
  assertAmountLimit,
  assertCurrencyAllowed,
  assertOperationAllowed,
  buildApiUrl,
  encodeBasicAuth,
  encodeStripeForm,
  normalizeConfig,
  stripeErrorMessage,
  truncateJson,
  validateConfig,
  verifyStripeWebhookSignature,
  type StripeConfig,
  type StripeOperation,
  type StripeRequestPlan,
  type StripeRawResponse,
} from "./stripe-client.js";
import manifest from "./manifest.js";

type Params = Record<string, unknown>;

const COMMAND_HISTORY_LIMIT = 50;
const WEBHOOK_HISTORY_LIMIT = 50;

function asObject(value: unknown): Params {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function stringParam(params: Params, key: string, fallback = "") {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberParam(params: Params, key: string, fallback: number, min: number, max: number) {
  const value = params[key];
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function boolParam(params: Params, key: string): boolean | undefined {
  return typeof params[key] === "boolean" ? params[key] as boolean : undefined;
}

function requireString(params: Params, key: string) {
  const value = stringParam(params, key);
  if (!value) throw new Error(`${key} is required`);
  return value;
}

function jsonObject(value: unknown): Params {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Params : {};
}

function compact(value: Params): Params {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null && item !== ""));
}

function listQuery(params: Params): Params {
  return compact({
    limit: numberParam(params, "limit", 25, 1, 100),
    customer: stringParam(params, "customer") || undefined,
    payment_intent: stringParam(params, "payment_intent") || undefined,
    charge: stringParam(params, "charge") || undefined,
    product: stringParam(params, "product") || undefined,
    currency: stringParam(params, "currency") || undefined,
    email: stringParam(params, "email") || undefined,
    status: stringParam(params, "status") || undefined,
    active: boolParam(params, "active"),
    starting_after: stringParam(params, "starting_after") || undefined,
    ending_before: stringParam(params, "ending_before") || undefined,
    created: Object.keys(jsonObject(params.created)).length > 0 ? jsonObject(params.created) : undefined,
  });
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  summary: string;
  operation: StripeOperation;
  method: string;
  path: string;
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
  }, ...list].slice(0, COMMAND_HISTORY_LIMIT));
}

async function auditCommand(
  ctx: PluginContext,
  runCtx: ToolRunContext,
  plan: StripeRequestPlan,
  result: { ok: boolean; dryRun: boolean },
) {
  await rememberCommand(ctx, runCtx.companyId, {
    summary: plan.summary,
    operation: plan.operation,
    method: plan.method,
    path: plan.path,
    mutating: plan.mutating,
    dryRun: result.dryRun,
    ok: result.ok,
    runId: runCtx.runId,
    agentId: runCtx.agentId,
  });
  await ctx.activity.log({
    companyId: runCtx.companyId,
    message: `Stripe ${result.dryRun ? "dry-run" : "request"}: ${plan.summary}`,
    metadata: {
      pluginId: PLUGIN_ID,
      operation: plan.operation,
      method: plan.method,
      path: plan.path,
      mutating: plan.mutating,
      dryRun: result.dryRun,
      ok: result.ok,
      runId: runCtx.runId,
      agentId: runCtx.agentId,
    },
  });
}

async function requestStripe(ctx: PluginContext, config: StripeConfig, plan: StripeRequestPlan): Promise<StripeRawResponse> {
  const secretKey = await ctx.secrets.resolve(config.secretKeyRef);
  const body = plan.body ? encodeStripeForm(plan.body) : undefined;
  const response = await ctx.http.fetch(buildApiUrl(config, plan.path, plan.query), {
    method: plan.method,
    headers: {
      accept: "application/json",
      authorization: encodeBasicAuth(secretKey),
      ...(body ? { "content-type": "application/x-www-form-urlencoded" } : {}),
      ...(plan.idempotencyKey ? { "idempotency-key": plan.idempotencyKey } : {}),
    },
    body,
    signal: AbortSignal.timeout(config.timeoutMs),
  });
  const text = await response.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }
  if (!response.ok) {
    throw new Error(`Stripe ${plan.summary} failed (${response.status}): ${stripeErrorMessage(payload, response.statusText)}`);
  }
  const { value, truncated } = truncateJson(payload, config.maxOutputBytes);
  return { status: response.status, statusText: response.statusText, payload: value, truncated };
}

function maxNestedAmount(value: unknown): number {
  if (Array.isArray(value)) return Math.max(0, ...value.map(maxNestedAmount));
  if (value && typeof value === "object") {
    const amounts = Object.entries(value as Params).map(([key, child]) => {
      if (/^(amount|unit_amount|amount_to_capture)$/i.test(key)) {
        const parsed = typeof child === "number" ? child : Number.parseInt(String(child ?? ""), 10);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return maxNestedAmount(child);
    });
    return Math.max(0, ...amounts);
  }
  return 0;
}

function guardPlan(config: StripeConfig, plan: StripeRequestPlan) {
  assertOperationAllowed(config, plan.operation);
  if (plan.currency) assertCurrencyAllowed(config, plan.currency);
  if (plan.amountSubunits !== undefined && plan.amountSubunits !== null) {
    const limit = plan.operation === "refund" ? config.maxRefundAmountSubunits : config.maxPaymentAmountSubunits;
    assertAmountLimit(plan.amountSubunits, limit, "Amount");
  }
}

function dryRunIdempotencyKey(plan: StripeRequestPlan): string | null {
  if (plan.idempotencyKey) return plan.idempotencyKey;
  if (!plan.mutating) return null;
  return `dry-run:${plan.operation}:${plan.method}:${plan.path}`;
}

async function executePlan(ctx: PluginContext, runCtx: ToolRunContext, plan: StripeRequestPlan): Promise<ToolResult> {
  const config = await getConfig(ctx);
  try {
    guardPlan(config, plan);
    if (config.dryRun && plan.mutating) {
      await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: true });
      return {
        content: `Dry run prepared for Stripe: ${plan.summary}. Stripe was not changed.`,
        data: {
          operation: plan.operation,
          method: plan.method,
          path: plan.path,
          query: plan.query ?? null,
          body: plan.body ?? null,
          encodedBody: plan.body ? encodeStripeForm(plan.body) : null,
          idempotencyKey: dryRunIdempotencyKey(plan),
          dryRun: true,
        },
      };
    }
    const result = await requestStripe(ctx, config, plan);
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `Stripe request completed: ${plan.summary}.`,
      data: {
        operation: plan.operation,
        method: plan.method,
        path: plan.path,
        result: result.payload,
        status: result.status,
        truncated: result.truncated,
      },
    };
  } catch (error) {
    await auditCommand(ctx, runCtx, plan, { ok: false, dryRun: config.dryRun && plan.mutating });
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

function paymentIntentsList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list PaymentIntents", method: "GET", path: "/payment_intents", query: listQuery(params), mutating: false };
}

function paymentIntentGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get PaymentIntent", method: "GET", path: `/payment_intents/${encodeURIComponent(requireString(params, "paymentIntentId"))}`, mutating: false };
}

function paymentIntentCreate(params: Params, config: StripeConfig): StripeRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxPaymentAmountSubunits, "Payment amount");
  const currency = assertCurrencyAllowed(config, requireString(params, "currency"));
  const body = compact({
    amount,
    currency,
    customer: stringParam(params, "customer") || undefined,
    description: stringParam(params, "description") || undefined,
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
    automatic_payment_methods: Object.keys(jsonObject(params.automatic_payment_methods)).length > 0 ? jsonObject(params.automatic_payment_methods) : undefined,
  });
  return { operation: "payment_intent", summary: "create PaymentIntent", method: "POST", path: "/payment_intents", body, amountSubunits: amount, currency, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function paymentIntentUpdate(params: Params, config: StripeConfig): StripeRequestPlan {
  const patch = jsonObject(params.patch);
  const amount = assertAmountLimit(patch.amount, config.maxPaymentAmountSubunits, "Payment amount");
  const currency = assertCurrencyAllowed(config, patch.currency);
  return { operation: "payment_intent", summary: "update PaymentIntent", method: "POST", path: `/payment_intents/${encodeURIComponent(requireString(params, "paymentIntentId"))}`, body: patch, amountSubunits: amount, currency, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function paymentIntentCapture(params: Params, config: StripeConfig): StripeRequestPlan {
  const amount = assertAmountLimit(params.amount_to_capture, config.maxPaymentAmountSubunits, "Capture amount");
  const body = compact({ amount_to_capture: amount ?? undefined });
  return { operation: "payment_intent", summary: "capture PaymentIntent", method: "POST", path: `/payment_intents/${encodeURIComponent(requireString(params, "paymentIntentId"))}/capture`, body, amountSubunits: amount, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function paymentIntentCancel(params: Params): StripeRequestPlan {
  const body = compact({ cancellation_reason: stringParam(params, "cancellation_reason") || undefined });
  return { operation: "payment_intent", summary: "cancel PaymentIntent", method: "POST", path: `/payment_intents/${encodeURIComponent(requireString(params, "paymentIntentId"))}/cancel`, body, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function refundsList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list refunds", method: "GET", path: "/refunds", query: listQuery(params), mutating: false };
}

function refundGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get refund", method: "GET", path: `/refunds/${encodeURIComponent(requireString(params, "refundId"))}`, mutating: false };
}

function refundCreate(params: Params, config: StripeConfig): StripeRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxRefundAmountSubunits, "Refund amount");
  const body = compact({
    payment_intent: stringParam(params, "payment_intent") || undefined,
    charge: stringParam(params, "charge") || undefined,
    amount: amount ?? undefined,
    reason: stringParam(params, "reason") || undefined,
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
  });
  if (!body.payment_intent && !body.charge) throw new Error("payment_intent or charge is required.");
  return { operation: "refund", summary: "create refund", method: "POST", path: "/refunds", body, amountSubunits: amount, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function refundCancel(params: Params): StripeRequestPlan {
  return { operation: "refund", summary: "cancel refund", method: "POST", path: `/refunds/${encodeURIComponent(requireString(params, "refundId"))}/cancel`, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function checkoutSessionsList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list Checkout Sessions", method: "GET", path: "/checkout/sessions", query: listQuery(params), mutating: false };
}

function checkoutSessionGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get Checkout Session", method: "GET", path: `/checkout/sessions/${encodeURIComponent(requireString(params, "checkoutSessionId"))}`, mutating: false };
}

function checkoutSessionCreate(params: Params, config: StripeConfig): StripeRequestPlan {
  const lineItems = Array.isArray(params.line_items) ? params.line_items : [];
  if (lineItems.length === 0) throw new Error("line_items is required.");
  const maxAmount = maxNestedAmount(lineItems);
  if (maxAmount > 0) assertAmountLimit(maxAmount, config.maxPaymentAmountSubunits, "Checkout line item amount");
  for (const item of lineItems) {
    const priceData = jsonObject(jsonObject(item).price_data);
    if (priceData.currency) assertCurrencyAllowed(config, priceData.currency);
  }
  const body = compact({
    mode: requireString(params, "mode"),
    line_items: lineItems,
    success_url: requireString(params, "success_url"),
    cancel_url: stringParam(params, "cancel_url") || undefined,
    customer: stringParam(params, "customer") || undefined,
    customer_email: stringParam(params, "customer_email") || undefined,
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
  });
  return { operation: "checkout_session", summary: "create Checkout Session", method: "POST", path: "/checkout/sessions", body, amountSubunits: maxAmount || null, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function checkoutSessionExpire(params: Params): StripeRequestPlan {
  return { operation: "checkout_session", summary: "expire Checkout Session", method: "POST", path: `/checkout/sessions/${encodeURIComponent(requireString(params, "checkoutSessionId"))}/expire`, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function checkoutSessionLineItems(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list Checkout Session line items", method: "GET", path: `/checkout/sessions/${encodeURIComponent(requireString(params, "checkoutSessionId"))}/line_items`, query: listQuery(params), mutating: false };
}

function customersList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list customers", method: "GET", path: "/customers", query: listQuery(params), mutating: false };
}

function customerGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get customer", method: "GET", path: `/customers/${encodeURIComponent(requireString(params, "customerId"))}`, mutating: false };
}

function customerCreate(params: Params): StripeRequestPlan {
  const body = compact({
    name: stringParam(params, "name") || undefined,
    email: stringParam(params, "email") || undefined,
    phone: stringParam(params, "phone") || undefined,
    description: stringParam(params, "description") || undefined,
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
  });
  return { operation: "customer", summary: "create customer", method: "POST", path: "/customers", body, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function customerUpdate(params: Params): StripeRequestPlan {
  return { operation: "customer", summary: "update customer", method: "POST", path: `/customers/${encodeURIComponent(requireString(params, "customerId"))}`, body: jsonObject(params.patch), idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function productsList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list products", method: "GET", path: "/products", query: listQuery(params), mutating: false };
}

function productGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get product", method: "GET", path: `/products/${encodeURIComponent(requireString(params, "productId"))}`, mutating: false };
}

function productCreate(params: Params): StripeRequestPlan {
  const body = compact({
    name: requireString(params, "name"),
    description: stringParam(params, "description") || undefined,
    active: boolParam(params, "active"),
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
  });
  return { operation: "product", summary: "create product", method: "POST", path: "/products", body, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function productUpdate(params: Params): StripeRequestPlan {
  return { operation: "product", summary: "update product", method: "POST", path: `/products/${encodeURIComponent(requireString(params, "productId"))}`, body: jsonObject(params.patch), idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function pricesList(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "list prices", method: "GET", path: "/prices", query: listQuery(params), mutating: false };
}

function priceGet(params: Params): StripeRequestPlan {
  return { operation: "read", summary: "get price", method: "GET", path: `/prices/${encodeURIComponent(requireString(params, "priceId"))}`, mutating: false };
}

function priceCreate(params: Params, config: StripeConfig): StripeRequestPlan {
  const amount = assertAmountLimit(params.unit_amount, config.maxPaymentAmountSubunits, "Price amount");
  const currency = assertCurrencyAllowed(config, requireString(params, "currency"));
  const body = compact({
    unit_amount: amount,
    currency,
    product: requireString(params, "product"),
    recurring: Object.keys(jsonObject(params.recurring)).length > 0 ? jsonObject(params.recurring) : undefined,
    nickname: stringParam(params, "nickname") || undefined,
    metadata: Object.keys(jsonObject(params.metadata)).length > 0 ? jsonObject(params.metadata) : undefined,
  });
  return { operation: "price", summary: "create price", method: "POST", path: "/prices", body, amountSubunits: amount, currency, idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

function priceUpdate(params: Params): StripeRequestPlan {
  return { operation: "price", summary: "update price", method: "POST", path: `/prices/${encodeURIComponent(requireString(params, "priceId"))}`, body: jsonObject(params.patch), idempotencyKey: stringParam(params, "idempotencyKey") || null, mutating: true };
}

const builders: Record<string, (params: Params, config: StripeConfig) => StripeRequestPlan> = {
  [TOOL_NAMES.paymentIntentsList]: paymentIntentsList,
  [TOOL_NAMES.paymentIntentGet]: paymentIntentGet,
  [TOOL_NAMES.paymentIntentCreate]: paymentIntentCreate,
  [TOOL_NAMES.paymentIntentUpdate]: paymentIntentUpdate,
  [TOOL_NAMES.paymentIntentCapture]: paymentIntentCapture,
  [TOOL_NAMES.paymentIntentCancel]: paymentIntentCancel,
  [TOOL_NAMES.refundsList]: refundsList,
  [TOOL_NAMES.refundGet]: refundGet,
  [TOOL_NAMES.refundCreate]: refundCreate,
  [TOOL_NAMES.refundCancel]: refundCancel,
  [TOOL_NAMES.checkoutSessionsList]: checkoutSessionsList,
  [TOOL_NAMES.checkoutSessionGet]: checkoutSessionGet,
  [TOOL_NAMES.checkoutSessionCreate]: checkoutSessionCreate,
  [TOOL_NAMES.checkoutSessionExpire]: checkoutSessionExpire,
  [TOOL_NAMES.checkoutSessionLineItems]: checkoutSessionLineItems,
  [TOOL_NAMES.customersList]: customersList,
  [TOOL_NAMES.customerGet]: customerGet,
  [TOOL_NAMES.customerCreate]: customerCreate,
  [TOOL_NAMES.customerUpdate]: customerUpdate,
  [TOOL_NAMES.productsList]: productsList,
  [TOOL_NAMES.productGet]: productGet,
  [TOOL_NAMES.productCreate]: productCreate,
  [TOOL_NAMES.productUpdate]: productUpdate,
  [TOOL_NAMES.pricesList]: pricesList,
  [TOOL_NAMES.priceGet]: priceGet,
  [TOOL_NAMES.priceCreate]: priceCreate,
  [TOOL_NAMES.priceUpdate]: priceUpdate,
};

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
      return executePlan(ctx, runCtx, plan);
    });
  }
}

function headerValue(headers: Record<string, string | string[]>, key: string): string {
  const value = headers[key] ?? headers[key.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
}

function summarizeWebhook(parsedBody: unknown, eventId: string) {
  const payload = asObject(parsedBody);
  return {
    eventId,
    event: typeof payload.type === "string" ? payload.type : "unknown",
    objectType: typeof asObject(payload.data).object === "object"
      ? String(asObject(asObject(payload.data).object).object ?? "object")
      : "object",
    receivedAt: new Date().toISOString(),
  };
}

let activeContext: PluginContext | null = null;

async function handleWebhook(input: PluginWebhookInput) {
  if (!activeContext) throw new Error("Stripe plugin is not ready.");
  const config = await getConfig(activeContext);
  if (!config.webhookSecretRef) throw new Error("Stripe webhook signing secret is not configured.");
  const signatureHeader = headerValue(input.headers, "stripe-signature");
  const webhookSecret = await activeContext.secrets.resolve(config.webhookSecretRef);
  if (!verifyStripeWebhookSignature({
    rawBody: input.rawBody,
    signatureHeader,
    secret: webhookSecret,
    toleranceSeconds: config.webhookToleranceSeconds,
  })) {
    throw new Error("Invalid Stripe webhook signature.");
  }

  const parsed = input.parsedBody ?? JSON.parse(input.rawBody);
  const eventId = String(asObject(parsed).id ?? input.requestId);
  const processed = await activeContext.state.get({ scopeKind: "instance", stateKey: STATE_KEYS.processedWebhookEvents });
  const processedIds = Array.isArray(processed) ? processed.map(String) : [];
  if (processedIds.includes(eventId)) return;

  const event = summarizeWebhook(parsed, eventId);
  const existing = await activeContext.state.get({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks });
  const list = Array.isArray(existing) ? existing : [];
  await activeContext.state.set({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks }, [event, ...list].slice(0, WEBHOOK_HISTORY_LIMIT));
  await activeContext.state.set({ scopeKind: "instance", stateKey: STATE_KEYS.processedWebhookEvents }, [eventId, ...processedIds].slice(0, 500));
}

async function registerDataHandlers(ctx: PluginContext) {
  ctx.data.register(DATA_KEYS.status, async () => {
    const { config, errors, warnings } = validateConfig(await ctx.config.get());
    const webhooks = await ctx.state.get({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks });
    return {
      pluginId: PLUGIN_ID,
      version: PLUGIN_VERSION,
      configured: errors.length === 0,
      modeLabel: config.modeLabel,
      dryRun: config.dryRun,
      apiBaseUrl: config.apiBaseUrl,
      allowedOperations: config.allowedOperations,
      allowedCurrencies: config.allowedCurrencies,
      webhookConfigured: Boolean(config.webhookSecretRef),
      recentWebhookCount: Array.isArray(webhooks) ? webhooks.length : 0,
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

  ctx.data.register(DATA_KEYS.recentWebhooks, async () => {
    const existing = await ctx.state.get({ scopeKind: "instance", stateKey: STATE_KEYS.recentWebhooks });
    return { webhooks: Array.isArray(existing) ? existing.slice(0, 20) : [] };
  });
}

const plugin = definePlugin({
  async setup(ctx) {
    activeContext = ctx;
    await registerDataHandlers(ctx);
    await registerToolHandlers(ctx);
    ctx.logger.info("Stripe plugin setup complete");
  },

  async onValidateConfig(config) {
    const result = validateConfig(config);
    return {
      ok: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
    };
  },

  async onWebhook(input) {
    await handleWebhook(input);
  },

  async onHealth() {
    return { status: "ok", message: "Stripe plugin worker is running." };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
