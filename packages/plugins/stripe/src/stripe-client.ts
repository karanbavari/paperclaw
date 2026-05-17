import { createHmac, timingSafeEqual } from "node:crypto";
import { DEFAULT_CONFIG } from "./constants.js";

export type StripeOperation =
  | "read"
  | "payment_intent"
  | "refund"
  | "checkout_session"
  | "customer"
  | "product"
  | "price"
  | "webhook";

export interface StripeConfig {
  apiBaseUrl: string;
  secretKeyRef: string;
  webhookSecretRef: string;
  modeLabel: "test" | "live";
  dryRun: boolean;
  allowedOperations: StripeOperation[];
  allowedCurrencies: string[];
  maxPaymentAmountSubunits: number;
  maxRefundAmountSubunits: number;
  webhookToleranceSeconds: number;
  timeoutMs: number;
  maxOutputBytes: number;
}

export interface StripeRequestPlan {
  operation: StripeOperation;
  summary: string;
  method: "GET" | "POST";
  path: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  mutating: boolean;
  amountSubunits?: number | null;
  currency?: string | null;
  idempotencyKey?: string | null;
}

export interface StripeRawResponse {
  status: number;
  statusText: string;
  payload: unknown;
  truncated: boolean;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown, fallback: readonly string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function numberValue(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

export function normalizeConfig(raw: Record<string, unknown> = {}): StripeConfig {
  const mode = stringValue(raw.modeLabel, DEFAULT_CONFIG.modeLabel).toLowerCase();
  return {
    apiBaseUrl: stringValue(raw.apiBaseUrl, DEFAULT_CONFIG.apiBaseUrl).replace(/\/+$/g, ""),
    secretKeyRef: stringValue(raw.secretKeyRef, DEFAULT_CONFIG.secretKeyRef),
    webhookSecretRef: stringValue(raw.webhookSecretRef, DEFAULT_CONFIG.webhookSecretRef),
    modeLabel: mode === "live" ? "live" : "test",
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    allowedOperations: stringArray(raw.allowedOperations, DEFAULT_CONFIG.allowedOperations) as StripeOperation[],
    allowedCurrencies: stringArray(raw.allowedCurrencies, DEFAULT_CONFIG.allowedCurrencies).map((currency) => currency.toLowerCase()),
    maxPaymentAmountSubunits: numberValue(raw.maxPaymentAmountSubunits, DEFAULT_CONFIG.maxPaymentAmountSubunits, 0, 10_000_000_000),
    maxRefundAmountSubunits: numberValue(raw.maxRefundAmountSubunits, DEFAULT_CONFIG.maxRefundAmountSubunits, 0, 10_000_000_000),
    webhookToleranceSeconds: numberValue(raw.webhookToleranceSeconds, DEFAULT_CONFIG.webhookToleranceSeconds, 0, 86_400),
    timeoutMs: numberValue(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 120_000),
    maxOutputBytes: numberValue(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
  };
}

export function validateConfig(raw: Record<string, unknown> = {}) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.secretKeyRef) errors.push("Stripe secret key reference is required.");
  if (!/^https:\/\/api\.stripe\.com\/v1$/.test(config.apiBaseUrl)) {
    warnings.push("Stripe API base URL differs from the official v1 gateway.");
  }
  if (config.allowedCurrencies.length === 0) errors.push("At least one currency must be allowed.");
  if (!config.dryRun) warnings.push("Live mutations are enabled. Agents can create/capture/cancel PaymentIntents, issue refunds, and manage Checkout Sessions.");
  if (!config.webhookSecretRef) warnings.push("Webhook signing secret is not configured; incoming Stripe webhooks will be rejected.");
  return { config, errors, warnings };
}

export function encodeBasicAuth(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`, "utf8").toString("base64")}`;
}

export function encodeStripeForm(value: Record<string, unknown>): string {
  const params = new URLSearchParams();
  appendFormEntries(params, "", value);
  return params.toString();
}

function appendFormEntries(params: URLSearchParams, prefix: string, value: unknown): void {
  if (value === undefined || value === null || value === "") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendFormEntries(params, `${prefix}[${index}]`, item);
    });
    return;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      appendFormEntries(params, prefix ? `${prefix}[${key}]` : key, child);
    }
    return;
  }
  params.append(prefix, String(value));
}

export function buildApiUrl(config: StripeConfig, path: string, query?: Record<string, unknown>): string {
  const url = new URL(`${config.apiBaseUrl}${path}`);
  const encoded = encodeStripeForm(query ?? {});
  if (encoded) url.search = encoded;
  return url.toString();
}

export function assertOperationAllowed(config: StripeConfig, operation: StripeOperation): void {
  if (!config.allowedOperations.includes(operation)) {
    throw new Error(`Stripe operation "${operation}" is not enabled in plugin settings.`);
  }
}

export function assertCurrencyAllowed(config: StripeConfig, currency: unknown): string | null {
  if (currency === undefined || currency === null || currency === "") return null;
  const normalized = String(currency).trim().toLowerCase();
  if (!normalized) return null;
  if (!config.allowedCurrencies.includes(normalized)) {
    throw new Error(`Currency ${normalized} is not enabled in plugin settings.`);
  }
  return normalized;
}

export function assertAmountLimit(value: unknown, limit: number, label: string): number | null {
  if (value === undefined || value === null || value === "") return null;
  const amount = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(amount) || amount < 0 || Math.floor(amount) !== amount) {
    throw new Error(`${label} must be a non-negative integer in currency subunits.`);
  }
  if (amount > limit) {
    throw new Error(`${label} ${amount} exceeds configured limit ${limit}.`);
  }
  return amount;
}

export function verifyStripeWebhookSignature(input: {
  rawBody: string;
  signatureHeader: string | undefined;
  secret: string;
  toleranceSeconds: number;
  nowSeconds?: number;
}): boolean {
  const parsed = parseStripeSignature(input.signatureHeader);
  if (!parsed.timestamp || parsed.signatures.length === 0) return false;
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (input.toleranceSeconds > 0 && Math.abs(now - parsed.timestamp) > input.toleranceSeconds) return false;
  const signedPayload = `${parsed.timestamp}.${input.rawBody}`;
  const digest = createHmac("sha256", input.secret).update(signedPayload).digest("hex");
  const expected = Buffer.from(digest, "hex");
  return parsed.signatures.some((signature) => {
    if (!/^[a-f0-9]+$/i.test(signature)) return false;
    const supplied = Buffer.from(signature, "hex");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}

function parseStripeSignature(header: string | undefined): { timestamp: number | null; signatures: string[] } {
  const parts = String(header ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  let timestamp: number | null = null;
  const signatures: string[] = [];
  for (const part of parts) {
    const [key, value] = part.split("=", 2);
    if (key === "t") {
      const parsed = Number.parseInt(value ?? "", 10);
      if (Number.isFinite(parsed)) timestamp = parsed;
    }
    if (key === "v1" && value) signatures.push(value);
  }
  return { timestamp, signatures };
}

export function truncateJson(value: unknown, maxBytes: number): { value: unknown; truncated: boolean } {
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return { value, truncated: false };
  return {
    value: {
      truncated: true,
      preview: text.slice(0, maxBytes),
    },
    truncated: true,
  };
}

export function stripeErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = record.error;
    if (nested && typeof nested === "object") {
      const err = nested as Record<string, unknown>;
      if (typeof err.message === "string") return err.message;
      if (typeof err.code === "string") return err.code;
      if (typeof err.type === "string") return err.type;
    }
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}
