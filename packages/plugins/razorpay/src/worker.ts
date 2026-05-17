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
  normalizeConfig,
  razorpayErrorMessage,
  truncateJson,
  validateConfig,
  verifyWebhookSignature,
  type RazorpayConfig,
  type RazorpayOperation,
  type RazorpayRequestPlan,
  type RazorpayRawResponse,
} from "./razorpay-client.js";
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
    count: numberParam(params, "count", 25, 1, 100),
    skip: numberParam(params, "skip", 0, 0, 100_000),
    from: params.from,
    to: params.to,
    receipt: stringParam(params, "receipt") || undefined,
  });
}

async function getConfig(ctx: PluginContext) {
  return normalizeConfig(await ctx.config.get());
}

async function rememberCommand(ctx: PluginContext, companyId: string, input: {
  summary: string;
  operation: RazorpayOperation;
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
  plan: RazorpayRequestPlan,
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
    message: `Razorpay ${result.dryRun ? "dry-run" : "request"}: ${plan.summary}`,
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

async function requestRazorpay(ctx: PluginContext, config: RazorpayConfig, plan: RazorpayRequestPlan): Promise<RazorpayRawResponse> {
  const keySecret = await ctx.secrets.resolve(config.keySecretRef);
  const response = await ctx.http.fetch(buildApiUrl(config, plan.path, plan.query), {
    method: plan.method,
    headers: {
      accept: "application/json",
      authorization: encodeBasicAuth(config.keyId, keySecret),
      ...(plan.body ? { "content-type": "application/json" } : {}),
    },
    body: plan.body ? JSON.stringify(plan.body) : undefined,
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
    throw new Error(`Razorpay ${plan.summary} failed (${response.status}): ${razorpayErrorMessage(payload, response.statusText)}`);
  }
  const { value, truncated } = truncateJson(payload, config.maxOutputBytes);
  return {
    status: response.status,
    statusText: response.statusText,
    payload: value,
    truncated,
  };
}

function guardPlan(config: RazorpayConfig, plan: RazorpayRequestPlan) {
  assertOperationAllowed(config, plan.operation);
  if (plan.currency) assertCurrencyAllowed(config, plan.currency);
  if (plan.amountSubunits !== undefined && plan.amountSubunits !== null) {
    const limit = plan.operation === "refund" ? config.maxRefundAmountSubunits : config.maxOrderAmountSubunits;
    assertAmountLimit(plan.amountSubunits, limit, "Amount");
  }
}

async function executePlan(ctx: PluginContext, runCtx: ToolRunContext, plan: RazorpayRequestPlan): Promise<ToolResult> {
  const config = await getConfig(ctx);
  try {
    guardPlan(config, plan);
    if (config.dryRun && plan.mutating) {
      await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: true });
      return {
        content: `Dry run prepared for Razorpay: ${plan.summary}. Razorpay was not changed.`,
        data: {
          operation: plan.operation,
          method: plan.method,
          path: plan.path,
          query: plan.query ?? null,
          body: plan.body ?? null,
          dryRun: true,
        },
      };
    }
    const result = await requestRazorpay(ctx, config, plan);
    await auditCommand(ctx, runCtx, plan, { ok: true, dryRun: false });
    return {
      content: `Razorpay request completed: ${plan.summary}.`,
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

function paymentsList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "list payments", method: "GET", path: "/payments", query: listQuery(params), mutating: false };
}

function paymentGet(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "get payment", method: "GET", path: `/payments/${encodeURIComponent(requireString(params, "paymentId"))}`, mutating: false };
}

function paymentCapture(params: Params, config: RazorpayConfig): RazorpayRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxOrderAmountSubunits, "Capture amount");
  const currency = assertCurrencyAllowed(config, requireString(params, "currency"));
  return {
    operation: "capture",
    summary: "capture payment",
    method: "POST",
    path: `/payments/${encodeURIComponent(requireString(params, "paymentId"))}/capture`,
    body: { amount, currency },
    amountSubunits: amount,
    currency,
    mutating: true,
  };
}

function paymentUpdateNotes(params: Params): RazorpayRequestPlan {
  return {
    operation: "capture",
    summary: "update payment notes",
    method: "PATCH",
    path: `/payments/${encodeURIComponent(requireString(params, "paymentId"))}`,
    body: { notes: jsonObject(params.notes) },
    mutating: true,
  };
}

function ordersList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "list orders", method: "GET", path: "/orders", query: listQuery(params), mutating: false };
}

function orderCreate(params: Params, config: RazorpayConfig): RazorpayRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxOrderAmountSubunits, "Order amount");
  const currency = assertCurrencyAllowed(config, requireString(params, "currency"));
  const body = compact({
    amount,
    currency,
    receipt: stringParam(params, "receipt") || undefined,
    notes: Object.keys(jsonObject(params.notes)).length > 0 ? jsonObject(params.notes) : undefined,
    partial_payment: boolParam(params, "partial_payment"),
  });
  return { operation: "order", summary: "create order", method: "POST", path: "/orders", body, amountSubunits: amount, currency, mutating: true };
}

function orderGet(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "get order", method: "GET", path: `/orders/${encodeURIComponent(requireString(params, "orderId"))}`, mutating: false };
}

function orderUpdateNotes(params: Params): RazorpayRequestPlan {
  return {
    operation: "order",
    summary: "update order notes",
    method: "PATCH",
    path: `/orders/${encodeURIComponent(requireString(params, "orderId"))}`,
    body: { notes: jsonObject(params.notes) },
    mutating: true,
  };
}

function orderPayments(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "fetch order payments", method: "GET", path: `/orders/${encodeURIComponent(requireString(params, "orderId"))}/payments`, mutating: false };
}

function refundsList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "list refunds", method: "GET", path: "/refunds", query: listQuery(params), mutating: false };
}

function refundGet(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "get refund", method: "GET", path: `/refunds/${encodeURIComponent(requireString(params, "refundId"))}`, mutating: false };
}

function refundCreate(params: Params, config: RazorpayConfig): RazorpayRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxRefundAmountSubunits, "Refund amount");
  const body = compact({
    amount: amount ?? undefined,
    speed: stringParam(params, "speed") || undefined,
    receipt: stringParam(params, "receipt") || undefined,
    notes: Object.keys(jsonObject(params.notes)).length > 0 ? jsonObject(params.notes) : undefined,
  });
  return {
    operation: "refund",
    summary: "create refund",
    method: "POST",
    path: `/payments/${encodeURIComponent(requireString(params, "paymentId"))}/refund`,
    body,
    amountSubunits: amount,
    mutating: true,
  };
}

function refundUpdateNotes(params: Params): RazorpayRequestPlan {
  return {
    operation: "refund",
    summary: "update refund notes",
    method: "PATCH",
    path: `/refunds/${encodeURIComponent(requireString(params, "refundId"))}`,
    body: { notes: jsonObject(params.notes) },
    mutating: true,
  };
}

function paymentRefundsList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "fetch payment refunds", method: "GET", path: `/payments/${encodeURIComponent(requireString(params, "paymentId"))}/refunds`, mutating: false };
}

function paymentLinksList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "list payment links", method: "GET", path: "/payment_links", query: listQuery(params), mutating: false };
}

function paymentLinkCreate(params: Params, config: RazorpayConfig): RazorpayRequestPlan {
  const amount = assertAmountLimit(params.amount, config.maxOrderAmountSubunits, "Payment link amount");
  const currency = assertCurrencyAllowed(config, requireString(params, "currency"));
  const body = compact({
    amount,
    currency,
    description: stringParam(params, "description") || undefined,
    customer: Object.keys(jsonObject(params.customer)).length > 0 ? jsonObject(params.customer) : undefined,
    notify: Object.keys(jsonObject(params.notify)).length > 0 ? jsonObject(params.notify) : undefined,
    reminder_enable: boolParam(params, "reminder_enable"),
    notes: Object.keys(jsonObject(params.notes)).length > 0 ? jsonObject(params.notes) : undefined,
    callback_url: stringParam(params, "callback_url") || undefined,
    callback_method: stringParam(params, "callback_method") || undefined,
  });
  return { operation: "payment_link", summary: "create payment link", method: "POST", path: "/payment_links", body, amountSubunits: amount, currency, mutating: true };
}

function paymentLinkGet(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "get payment link", method: "GET", path: `/payment_links/${encodeURIComponent(requireString(params, "paymentLinkId"))}`, mutating: false };
}

function paymentLinkUpdate(params: Params, config: RazorpayConfig): RazorpayRequestPlan {
  const patch = jsonObject(params.patch);
  const amount = assertAmountLimit(patch.amount, config.maxOrderAmountSubunits, "Payment link amount");
  const currency = assertCurrencyAllowed(config, patch.currency);
  return {
    operation: "payment_link",
    summary: "update payment link",
    method: "PATCH",
    path: `/payment_links/${encodeURIComponent(requireString(params, "paymentLinkId"))}`,
    body: patch,
    amountSubunits: amount,
    currency,
    mutating: true,
  };
}

function paymentLinkCancel(params: Params): RazorpayRequestPlan {
  return {
    operation: "payment_link",
    summary: "cancel payment link",
    method: "POST",
    path: `/payment_links/${encodeURIComponent(requireString(params, "paymentLinkId"))}/cancel`,
    mutating: true,
  };
}

function paymentLinkNotify(params: Params): RazorpayRequestPlan {
  const medium = requireString(params, "medium");
  if (!["sms", "email"].includes(medium)) throw new Error("medium must be sms or email.");
  return {
    operation: "payment_link",
    summary: "notify payment link",
    method: "POST",
    path: `/payment_links/${encodeURIComponent(requireString(params, "paymentLinkId"))}/notify_by/${medium}`,
    mutating: true,
  };
}

function customersList(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "list customers", method: "GET", path: "/customers", query: listQuery(params), mutating: false };
}

function customerCreate(params: Params): RazorpayRequestPlan {
  return {
    operation: "customer",
    summary: "create customer",
    method: "POST",
    path: "/customers",
    body: compact({
      name: stringParam(params, "name") || undefined,
      email: stringParam(params, "email") || undefined,
      contact: stringParam(params, "contact") || undefined,
      fail_existing: boolParam(params, "fail_existing"),
      notes: Object.keys(jsonObject(params.notes)).length > 0 ? jsonObject(params.notes) : undefined,
    }),
    mutating: true,
  };
}

function customerGet(params: Params): RazorpayRequestPlan {
  return { operation: "read", summary: "get customer", method: "GET", path: `/customers/${encodeURIComponent(requireString(params, "customerId"))}`, mutating: false };
}

function customerUpdate(params: Params): RazorpayRequestPlan {
  return {
    operation: "customer",
    summary: "update customer",
    method: "PATCH",
    path: `/customers/${encodeURIComponent(requireString(params, "customerId"))}`,
    body: jsonObject(params.patch),
    mutating: true,
  };
}

const builders: Record<string, (params: Params, config: RazorpayConfig) => RazorpayRequestPlan> = {
  [TOOL_NAMES.paymentsList]: paymentsList,
  [TOOL_NAMES.paymentGet]: paymentGet,
  [TOOL_NAMES.paymentCapture]: paymentCapture,
  [TOOL_NAMES.paymentUpdateNotes]: paymentUpdateNotes,
  [TOOL_NAMES.ordersList]: ordersList,
  [TOOL_NAMES.orderCreate]: orderCreate,
  [TOOL_NAMES.orderGet]: orderGet,
  [TOOL_NAMES.orderUpdateNotes]: orderUpdateNotes,
  [TOOL_NAMES.orderPayments]: orderPayments,
  [TOOL_NAMES.refundsList]: refundsList,
  [TOOL_NAMES.refundGet]: refundGet,
  [TOOL_NAMES.refundCreate]: refundCreate,
  [TOOL_NAMES.refundUpdateNotes]: refundUpdateNotes,
  [TOOL_NAMES.paymentRefundsList]: paymentRefundsList,
  [TOOL_NAMES.paymentLinksList]: paymentLinksList,
  [TOOL_NAMES.paymentLinkCreate]: paymentLinkCreate,
  [TOOL_NAMES.paymentLinkGet]: paymentLinkGet,
  [TOOL_NAMES.paymentLinkUpdate]: paymentLinkUpdate,
  [TOOL_NAMES.paymentLinkCancel]: paymentLinkCancel,
  [TOOL_NAMES.paymentLinkNotify]: paymentLinkNotify,
  [TOOL_NAMES.customersList]: customersList,
  [TOOL_NAMES.customerCreate]: customerCreate,
  [TOOL_NAMES.customerGet]: customerGet,
  [TOOL_NAMES.customerUpdate]: customerUpdate,
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
  const event = typeof payload.event === "string" ? payload.event : "unknown";
  const contains = asObject(payload.payload);
  const entityTypes = Object.keys(contains);
  return {
    eventId,
    event,
    entityTypes,
    receivedAt: new Date().toISOString(),
  };
}

let activeContext: PluginContext | null = null;

async function handleWebhook(input: PluginWebhookInput) {
  if (!activeContext) throw new Error("Razorpay plugin is not ready.");
  const config = await getConfig(activeContext);
  if (!config.webhookSecretRef) throw new Error("Razorpay webhook secret is not configured.");
  const signature = headerValue(input.headers, "x-razorpay-signature");
  const eventId = headerValue(input.headers, "x-razorpay-event-id") || input.requestId;
  const webhookSecret = await activeContext.secrets.resolve(config.webhookSecretRef);
  if (!verifyWebhookSignature(input.rawBody, signature, webhookSecret)) {
    throw new Error("Invalid Razorpay webhook signature.");
  }

  const processed = await activeContext.state.get({ scopeKind: "instance", stateKey: STATE_KEYS.processedWebhookEvents });
  const processedIds = Array.isArray(processed) ? processed.map(String) : [];
  if (processedIds.includes(eventId)) return;

  const parsed = input.parsedBody ?? JSON.parse(input.rawBody);
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
    ctx.logger.info("Razorpay plugin setup complete");
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
    return { status: "ok", message: "Razorpay plugin worker is running." };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
