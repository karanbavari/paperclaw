import { createHmac, timingSafeEqual } from "node:crypto";
import { DEFAULT_CONFIG } from "./constants.js";

export type ShopifyOperation = "read" | "create" | "update" | "inventory" | "webhook" | "raw";

export interface ShopifyConfig {
  apiVersion: string;
  publicBaseUrl: string;
  appApiKey: string;
  appApiSecretRef: string;
  requestedScopes: string[];
  dryRun: boolean;
  enableRawGraphqlTool: boolean;
  allowedOperations: ShopifyOperation[];
  allowedShopDomains: string[];
  maxInventoryAdjustment: number;
  maxProductPriceChangePercent: number;
  maxOutputBytes: number;
  timeoutMs: number;
}

export interface ConnectedShop {
  shop: string;
  accessTokenSecretRef: string;
  scopes: string[];
  connectedAt: string;
  updatedAt: string;
}

export interface ShopifyGraphqlResult {
  data: unknown;
  extensions?: unknown;
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

export function normalizeConfig(raw: Record<string, unknown> = {}): ShopifyConfig {
  return {
    apiVersion: stringValue(raw.apiVersion, DEFAULT_CONFIG.apiVersion),
    publicBaseUrl: stringValue(raw.publicBaseUrl, DEFAULT_CONFIG.publicBaseUrl),
    appApiKey: stringValue(raw.appApiKey, DEFAULT_CONFIG.appApiKey),
    appApiSecretRef: stringValue(raw.appApiSecretRef, DEFAULT_CONFIG.appApiSecretRef),
    requestedScopes: stringArray(raw.requestedScopes, DEFAULT_CONFIG.requestedScopes),
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    enableRawGraphqlTool: typeof raw.enableRawGraphqlTool === "boolean"
      ? raw.enableRawGraphqlTool
      : DEFAULT_CONFIG.enableRawGraphqlTool,
    allowedOperations: stringArray(raw.allowedOperations, DEFAULT_CONFIG.allowedOperations) as ShopifyOperation[],
    allowedShopDomains: stringArray(raw.allowedShopDomains, DEFAULT_CONFIG.allowedShopDomains).map(normalizeShopDomain).filter(Boolean),
    maxInventoryAdjustment: numberValue(raw.maxInventoryAdjustment, DEFAULT_CONFIG.maxInventoryAdjustment, 0, 1_000_000),
    maxProductPriceChangePercent: numberValue(raw.maxProductPriceChangePercent, DEFAULT_CONFIG.maxProductPriceChangePercent, 0, 100),
    maxOutputBytes: numberValue(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
    timeoutMs: numberValue(raw.timeoutMs, DEFAULT_CONFIG.timeoutMs, 5_000, 120_000),
  };
}

export function validateConfig(raw: Record<string, unknown> = {}) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!config.appApiKey) errors.push("Shopify app API key is required.");
  if (!config.appApiSecretRef) errors.push("Shopify app secret reference is required.");
  if (!/^\d{4}-\d{2}$/.test(config.apiVersion)) errors.push("Shopify API version must look like 2026-04.");
  if (config.requestedScopes.length === 0) errors.push("At least one Shopify OAuth scope is required.");
  if (!config.dryRun) warnings.push("Live mutations are enabled. Agent product, inventory, and webhook changes will affect Shopify.");
  if (config.enableRawGraphqlTool) warnings.push("Raw GraphQL tool is enabled; use allowlists and reviews carefully.");
  return { config, errors, warnings };
}

export function normalizeShopDomain(input: unknown): string {
  const raw = typeof input === "string" ? input.trim().toLowerCase() : "";
  if (!raw) return "";
  let host = raw;
  try {
    host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname.toLowerCase();
  } catch {
    host = raw.split("/")[0]!.toLowerCase();
  }
  host = host.replace(/\.+$/g, "");
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(host)) return "";
  return host;
}

export function verifyShopifyHmac(params: URLSearchParams | Record<string, string | string[]>, secret: string): boolean {
  const entries: Array<[string, string]> = [];
  if (params instanceof URLSearchParams) {
    for (const [key, value] of params.entries()) {
      if (key !== "hmac" && key !== "signature") entries.push([key, value]);
    }
  } else {
    for (const [key, value] of Object.entries(params)) {
      if (key === "hmac" || key === "signature") continue;
      if (Array.isArray(value)) {
        for (const item of value) entries.push([key, item]);
      } else {
        entries.push([key, value]);
      }
    }
  }
  const supplied = params instanceof URLSearchParams ? params.get("hmac") : params.hmac;
  const suppliedHmac = Array.isArray(supplied) ? supplied[0] : supplied;
  if (!suppliedHmac || !/^[a-f0-9]+$/i.test(suppliedHmac)) return false;
  const message = entries
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const digest = createHmac("sha256", secret).update(message).digest("hex");
  const suppliedBuffer = Buffer.from(suppliedHmac, "hex");
  const digestBuffer = Buffer.from(digest, "hex");
  return suppliedBuffer.length === digestBuffer.length && timingSafeEqual(suppliedBuffer, digestBuffer);
}

export function buildAdminGraphqlUrl(shop: string, apiVersion: string): string {
  return `https://${shop}/admin/api/${apiVersion}/graphql.json`;
}

export function isAllowedShop(config: ShopifyConfig, shop: string): boolean {
  return config.allowedShopDomains.length === 0 || config.allowedShopDomains.includes(shop);
}

export function assertOperationAllowed(config: ShopifyConfig, operation: ShopifyOperation): void {
  if (!config.allowedOperations.includes(operation)) {
    throw new Error(`Shopify operation "${operation}" is not enabled in plugin settings.`);
  }
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
