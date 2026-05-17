import { createHmac, timingSafeEqual } from "node:crypto";
import { DEFAULT_CONFIG } from "./constants.js";

export type RazorpayOperation =
  | "read"
  | "order"
  | "capture"
  | "refund"
  | "payment_link"
  | "customer"
  | "webhook";

export interface RazorpayConfig {
  apiBaseUrl: string;
  keyId: string;
  keySecretRef: string;
  webhookSecretRef: string;
  modeLabel: "test" | "live";
  dryRun: boolean;
  allowedOperations: RazorpayOperation[];
  allowedCurrencies: string[];
  maxOrderAmountSubunits: number;
  maxRefundAmountSubunits: number;
  timeoutMs: number;
  maxOutputBytes: number;
}

export interface RazorpayRequestPlan {
  operation: RazorpayOperation;
  summary: string;
  method: "GET" | "POST" | "PATCH";
  path: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  mutating: boolean;
  amountSubunits?: number | null;
  currency?: string | null;
}

export interface RazorpayRawResponse {
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

export function normalizeConfig(raw: Record<string, unknown> = {}): RazorpayConfig {
  const mode = stringValue(raw.modeLabel, DEFAULT_CONFIG.modeLabel).toLowerCase();
  return {
    apiBaseUrl: stringValue(raw.apiBaseUrl, DEFAULT_CONFIG.apiBaseUrl).replace(/\/+$/g, ""),
    keyId: stringValue(raw.keyId, DEFAULT_CONFIG.keyId),
    keySecretRef: stringValue(raw.keySecretRef, DEFAULT_CONFIG.keySecretRef),
    webhookSecretRef: stringValue(raw.webhookSecretRef, DEFAULT_CONFIG.webhookSecretRef),
    modeLabel: mode === "live" ? "live" : "test",
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    allowedOperations: stringArray(raw.allowedOperations, DEFAULT_CONFIG.allowedOperations) as RazorpayOperation[],
    allowedCurrencies: stringArray(raw.allowedCurrencies, DEFAULT_CONFIG.allowedCurrencies).map((currency) => currency.toUpperCase()),
    maxOrderAmountSubunits: numberValue(raw.maxOrderAmountSubunits, DEFAULT_CONFIG.maxOrderAmountSubunits, 0, 10_000_000_000),
    maxRefundAmountSubunits: numberValue(raw.maxRefundAmountSubunits, DEFAULT_CONFIG.maxRefundAmountSubunits, 0, 10_000_000_000),
    timeoutMs: numberValue(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 120_000),
    maxOutputBytes: numberValue(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
  };
}

export function validateConfig(raw: Record<string, unknown> = {}) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.keyId) errors.push("Razorpay Key ID is required.");
  if (!config.keySecretRef) errors.push("Razorpay Key Secret reference is required.");
  if (!/^https:\/\/api\.razorpay\.com\/v1$/.test(config.apiBaseUrl)) {
    warnings.push("Razorpay API base URL differs from the official v1 gateway.");
  }
  if (config.allowedCurrencies.length === 0) errors.push("At least one currency must be allowed.");
  if (!config.dryRun) warnings.push("Live mutations are enabled. Agents can create orders, capture payments, issue refunds, and manage payment links.");
  if (!config.webhookSecretRef) warnings.push("Webhook secret is not configured; incoming Razorpay webhooks will be rejected.");
  return { config, errors, warnings };
}

export function encodeBasicAuth(keyId: string, keySecret: string): string {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`, "utf8").toString("base64")}`;
}

export function buildApiUrl(config: RazorpayConfig, path: string, query?: Record<string, unknown>): string {
  const url = new URL(`${config.apiBaseUrl}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export function assertOperationAllowed(config: RazorpayConfig, operation: RazorpayOperation): void {
  if (!config.allowedOperations.includes(operation)) {
    throw new Error(`Razorpay operation "${operation}" is not enabled in plugin settings.`);
  }
}

export function assertCurrencyAllowed(config: RazorpayConfig, currency: unknown): string | null {
  if (currency === undefined || currency === null || currency === "") return null;
  const normalized = String(currency).trim().toUpperCase();
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

export function verifyWebhookSignature(rawBody: string, signature: string | undefined, secret: string): boolean {
  if (!signature || !/^[a-f0-9]+$/i.test(signature)) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const supplied = Buffer.from(signature, "hex");
  const expected = Buffer.from(digest, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
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

export function razorpayErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nested = record.error;
    if (nested && typeof nested === "object") {
      const err = nested as Record<string, unknown>;
      if (typeof err.description === "string") return err.description;
      if (typeof err.reason === "string") return err.reason;
      if (typeof err.code === "string") return err.code;
    }
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
  }
  return fallback;
}
