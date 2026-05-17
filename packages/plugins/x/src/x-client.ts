import type { PluginContext } from "@kesarcloud/plugin-sdk";
import { DEFAULT_CONFIG, DEFAULT_SCOPES } from "./constants.js";

export type XConfig = {
  clientId: string;
  clientSecretRef: string;
  refreshTokenSecretRef: string;
  connectedCompanyId: string;
  connectedAt: string;
  connectedUserId: string;
  connectedUsername: string;
  connectedDisplayName: string;
  redirectUri: string;
  enabledScopes: string[];
  dryRun: boolean;
  maxPollAttempts: number;
  requestTimeoutMs: number;
};

export type XRequestPlan = {
  operation: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
  mutating?: boolean;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

type RawResponse = {
  status: number;
  statusText: string;
  payload: unknown;
  rateLimit: {
    limit: string | null;
    remaining: string | null;
    reset: string | null;
  };
};

const API_BASE_URL = "https://api.x.com";
const TOKEN_URL = `${API_BASE_URL}/2/oauth2/token`;

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [...DEFAULT_SCOPES];
  return value.map((entry) => String(entry).trim()).filter(Boolean);
}

export function normalizeConfig(raw: Record<string, unknown>): XConfig {
  return {
    clientId: typeof raw.clientId === "string" ? raw.clientId.trim() : DEFAULT_CONFIG.clientId,
    clientSecretRef: typeof raw.clientSecretRef === "string" ? raw.clientSecretRef.trim() : DEFAULT_CONFIG.clientSecretRef,
    refreshTokenSecretRef: typeof raw.refreshTokenSecretRef === "string" ? raw.refreshTokenSecretRef.trim() : DEFAULT_CONFIG.refreshTokenSecretRef,
    connectedCompanyId: typeof raw.connectedCompanyId === "string" ? raw.connectedCompanyId.trim() : DEFAULT_CONFIG.connectedCompanyId,
    connectedAt: typeof raw.connectedAt === "string" ? raw.connectedAt.trim() : DEFAULT_CONFIG.connectedAt,
    connectedUserId: typeof raw.connectedUserId === "string" ? raw.connectedUserId.trim() : DEFAULT_CONFIG.connectedUserId,
    connectedUsername: typeof raw.connectedUsername === "string" ? raw.connectedUsername.trim() : DEFAULT_CONFIG.connectedUsername,
    connectedDisplayName: typeof raw.connectedDisplayName === "string" ? raw.connectedDisplayName.trim() : DEFAULT_CONFIG.connectedDisplayName,
    redirectUri: typeof raw.redirectUri === "string" ? raw.redirectUri.trim() : DEFAULT_CONFIG.redirectUri,
    enabledScopes: asStringArray(raw.enabledScopes),
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    maxPollAttempts: asNumber(raw.maxPollAttempts, DEFAULT_CONFIG.maxPollAttempts, 1, 30),
    requestTimeoutMs: asNumber(raw.requestTimeoutMs, DEFAULT_CONFIG.requestTimeoutMs, 5_000, 120_000),
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.clientId) warnings.push("X Client ID is not configured.");
  if (!config.clientSecretRef) warnings.push("X Client Secret Reference is not configured.");
  if (!config.refreshTokenSecretRef) warnings.push("X is not connected yet.");
  if (!config.redirectUri) warnings.push("Redirect URI is not configured; the settings page can infer one from the current browser URL.");
  if (config.dryRun) warnings.push("Dry Run is enabled. Mutating X tools will return planned requests without changing X.");
  if (config.refreshTokenSecretRef && (!config.clientId || !config.clientSecretRef)) {
    errors.push("X refresh token is configured but client ID or client secret is missing.");
  }

  return { config, errors, warnings };
}

export function isConnected(config: XConfig) {
  return Boolean(config.clientId && config.clientSecretRef && config.refreshTokenSecretRef);
}

function encodeBasicAuth(clientId: string, clientSecret: string) {
  return Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");
}

async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.title === "string") return record.title;
    if (typeof record.error_description === "string") return record.error_description;
    if (typeof record.error === "string") return record.error;
    const errors = Array.isArray(record.errors) ? record.errors : [];
    const first = errors[0];
    if (first && typeof first === "object") {
      const nested = first as Record<string, unknown>;
      if (typeof nested.detail === "string") return nested.detail;
      if (typeof nested.title === "string") return nested.title;
      if (typeof nested.message === "string") return nested.message;
    }
  }
  return fallback;
}

export class XClient {
  constructor(
    private readonly ctx: PluginContext,
    private readonly config: XConfig,
  ) {}

  async exchangeCode(input: {
    code: string;
    codeVerifier: string;
    redirectUri: string;
  }): Promise<TokenResponse> {
    const clientSecret = await this.ctx.secrets.resolve(this.config.clientSecretRef);
    return this.tokenRequest({
      grant_type: "authorization_code",
      code: input.code,
      client_id: this.config.clientId,
      redirect_uri: input.redirectUri,
      code_verifier: input.codeVerifier,
    }, clientSecret);
  }

  async refreshAccessToken(companyId: string): Promise<TokenResponse> {
    if (!isConnected(this.config)) throw new Error("X is not connected.");
    const [clientSecret, refreshToken] = await Promise.all([
      this.ctx.secrets.resolve(this.config.clientSecretRef),
      this.ctx.secrets.resolve(this.config.refreshTokenSecretRef),
    ]);
    const token = await this.tokenRequest({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: this.config.clientId,
    }, clientSecret);
    if (token.refresh_token && token.refresh_token !== refreshToken) {
      await this.ctx.secrets.upsert({
        companyId,
        name: "x-refresh-token",
        value: token.refresh_token,
        description: "X OAuth refresh token for the X plugin.",
      });
    }
    return token;
  }

  async request(plan: XRequestPlan, companyId: string): Promise<RawResponse> {
    const token = await this.refreshAccessToken(companyId);
    const accessToken = token.access_token;
    if (!accessToken) throw new Error("X did not return an access token.");
    return this.requestWithAccessToken(plan, accessToken);
  }

  async requestWithAccessToken(plan: XRequestPlan, accessToken: string): Promise<RawResponse> {
    if (!plan.path.startsWith("/2/")) throw new Error("X API requests must use a /2/* path.");
    const url = new URL(`${API_BASE_URL}${plan.path}`);
    for (const [key, value] of Object.entries(plan.query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    const hasBody = plan.body !== undefined;
    const response = await this.ctx.http.fetch(url.toString(), {
      method: plan.method,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        ...(hasBody ? { "content-type": "application/json" } : {}),
        ...plan.headers,
      },
      body: hasBody ? JSON.stringify(plan.body) : undefined,
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`X ${plan.operation} failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return {
      status: response.status,
      statusText: response.statusText,
      payload,
      rateLimit: {
        limit: response.headers.get("x-rate-limit-limit"),
        remaining: response.headers.get("x-rate-limit-remaining"),
        reset: response.headers.get("x-rate-limit-reset"),
      },
    };
  }

  private async tokenRequest(body: Record<string, string>, clientSecret: string): Promise<TokenResponse> {
    const response = await this.ctx.http.fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Basic ${encodeBasicAuth(this.config.clientId, clientSecret)}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body).toString(),
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`X OAuth token request failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return payload as TokenResponse;
  }
}

export function summarizeResult(response: RawResponse) {
  return {
    status: response.status,
    payload: response.payload,
    rateLimit: response.rateLimit,
  };
}
