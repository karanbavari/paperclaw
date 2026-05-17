import type { PluginContext } from "@kesarcloud/plugin-sdk";
import { DEFAULT_CONFIG, DEFAULT_SCOPES } from "./constants.js";

export type HubSpotAuthMode = "private_token" | "oauth";

export type HubSpotConfig = {
  authMode: HubSpotAuthMode;
  privateAccessTokenSecretRef: string;
  clientId: string;
  clientSecretRef: string;
  refreshTokenSecretRef: string;
  connectedCompanyId: string;
  connectedAt: string;
  portalId: string;
  redirectUri: string;
  enabledScopes: string[];
  dryRun: boolean;
  enableRawApiTool: boolean;
  requestTimeoutMs: number;
  maxOutputBytes: number;
};

export type HubSpotRequestPlan = {
  operation: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  query?: Record<string, unknown>;
  body?: unknown;
  mutating?: boolean;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

type RawResponse = {
  status: number;
  statusText: string;
  payload: unknown;
  rateLimit: {
    daily: string | null;
    dailyRemaining: string | null;
    secondly: string | null;
    secondlyRemaining: string | null;
    intervalMilliseconds: string | null;
    max: string | null;
    remaining: string | null;
    retryAfter: string | null;
  };
};

const API_BASE_URL = "https://api.hubapi.com";
const TOKEN_URL = `${API_BASE_URL}/oauth/v1/token`;

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [...DEFAULT_SCOPES];
  return value.map((entry) => String(entry).trim()).filter(Boolean);
}

function authMode(value: unknown): HubSpotAuthMode {
  return value === "oauth" ? "oauth" : "private_token";
}

export function normalizeConfig(raw: Record<string, unknown>): HubSpotConfig {
  return {
    authMode: authMode(raw.authMode),
    privateAccessTokenSecretRef: typeof raw.privateAccessTokenSecretRef === "string" ? raw.privateAccessTokenSecretRef.trim() : DEFAULT_CONFIG.privateAccessTokenSecretRef,
    clientId: typeof raw.clientId === "string" ? raw.clientId.trim() : DEFAULT_CONFIG.clientId,
    clientSecretRef: typeof raw.clientSecretRef === "string" ? raw.clientSecretRef.trim() : DEFAULT_CONFIG.clientSecretRef,
    refreshTokenSecretRef: typeof raw.refreshTokenSecretRef === "string" ? raw.refreshTokenSecretRef.trim() : DEFAULT_CONFIG.refreshTokenSecretRef,
    connectedCompanyId: typeof raw.connectedCompanyId === "string" ? raw.connectedCompanyId.trim() : DEFAULT_CONFIG.connectedCompanyId,
    connectedAt: typeof raw.connectedAt === "string" ? raw.connectedAt.trim() : DEFAULT_CONFIG.connectedAt,
    portalId: typeof raw.portalId === "string" ? raw.portalId.trim() : DEFAULT_CONFIG.portalId,
    redirectUri: typeof raw.redirectUri === "string" ? raw.redirectUri.trim() : DEFAULT_CONFIG.redirectUri,
    enabledScopes: asStringArray(raw.enabledScopes),
    dryRun: typeof raw.dryRun === "boolean" ? raw.dryRun : DEFAULT_CONFIG.dryRun,
    enableRawApiTool: typeof raw.enableRawApiTool === "boolean" ? raw.enableRawApiTool : DEFAULT_CONFIG.enableRawApiTool,
    requestTimeoutMs: asNumber(raw.requestTimeoutMs, DEFAULT_CONFIG.requestTimeoutMs, 5_000, 120_000),
    maxOutputBytes: asNumber(raw.maxOutputBytes, DEFAULT_CONFIG.maxOutputBytes, 4_000, 500_000),
  };
}

export function validateConfig(raw: Record<string, unknown>) {
  const config = normalizeConfig(raw);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (config.authMode === "private_token" && !config.privateAccessTokenSecretRef) {
    warnings.push("HubSpot private app access token is not configured.");
  }
  if (config.authMode === "oauth") {
    if (!config.clientId) warnings.push("HubSpot OAuth Client ID is not configured.");
    if (!config.clientSecretRef) warnings.push("HubSpot OAuth Client Secret Reference is not configured.");
    if (!config.refreshTokenSecretRef) warnings.push("HubSpot OAuth is not connected yet.");
    if (!config.redirectUri) warnings.push("Redirect URI is not configured; the settings page can infer one from the current browser URL.");
    if (config.refreshTokenSecretRef && (!config.clientId || !config.clientSecretRef)) {
      errors.push("HubSpot refresh token is configured but client ID or client secret is missing.");
    }
  }
  if (config.dryRun) warnings.push("Dry Run is enabled. Mutating HubSpot tools will return planned requests without changing HubSpot.");

  return { config, errors, warnings };
}

export function isConnected(config: HubSpotConfig) {
  if (config.authMode === "oauth") {
    return Boolean(config.clientId && config.clientSecretRef && config.refreshTokenSecretRef);
  }
  return Boolean(config.privateAccessTokenSecretRef);
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
    if (typeof record.message === "string") return record.message;
    if (typeof record.error_description === "string") return record.error_description;
    if (typeof record.error === "string") return record.error;
    const errors = Array.isArray(record.errors) ? record.errors : [];
    const first = errors[0];
    if (first && typeof first === "object" && typeof (first as { message?: unknown }).message === "string") {
      return (first as { message: string }).message;
    }
  }
  return fallback;
}

export class HubSpotClient {
  constructor(
    private readonly ctx: PluginContext,
    private readonly config: HubSpotConfig,
  ) {}

  async exchangeCode(input: {
    code: string;
    redirectUri: string;
  }): Promise<TokenResponse> {
    const clientSecret = await this.ctx.secrets.resolve(this.config.clientSecretRef);
    return this.tokenRequest({
      grant_type: "authorization_code",
      client_id: this.config.clientId,
      client_secret: clientSecret,
      redirect_uri: input.redirectUri,
      code: input.code,
    });
  }

  async request(plan: HubSpotRequestPlan, companyId: string): Promise<RawResponse> {
    const accessToken = await this.resolveAccessToken(companyId);
    return this.requestWithAccessToken(plan, accessToken);
  }

  async requestWithAccessToken(plan: HubSpotRequestPlan, accessToken: string): Promise<RawResponse> {
    if (!plan.path.startsWith("/")) throw new Error("HubSpot API path must start with /.");
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
      },
      body: hasBody ? JSON.stringify(plan.body) : undefined,
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`HubSpot ${plan.operation} failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return {
      status: response.status,
      statusText: response.statusText,
      payload,
      rateLimit: {
        daily: response.headers.get("x-hubspot-ratelimit-daily"),
        dailyRemaining: response.headers.get("x-hubspot-ratelimit-daily-remaining"),
        secondly: response.headers.get("x-hubspot-ratelimit-secondly"),
        secondlyRemaining: response.headers.get("x-hubspot-ratelimit-secondly-remaining"),
        intervalMilliseconds: response.headers.get("x-hubspot-ratelimit-interval-milliseconds"),
        max: response.headers.get("x-hubspot-ratelimit-max"),
        remaining: response.headers.get("x-hubspot-ratelimit-remaining"),
        retryAfter: response.headers.get("retry-after"),
      },
    };
  }

  private async resolveAccessToken(companyId: string) {
    if (!isConnected(this.config)) throw new Error("HubSpot is not connected.");
    if (this.config.authMode === "private_token") {
      return this.ctx.secrets.resolve(this.config.privateAccessTokenSecretRef);
    }
    const [clientSecret, refreshToken] = await Promise.all([
      this.ctx.secrets.resolve(this.config.clientSecretRef),
      this.ctx.secrets.resolve(this.config.refreshTokenSecretRef),
    ]);
    const token = await this.tokenRequest({
      grant_type: "refresh_token",
      client_id: this.config.clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    });
    if (token.refresh_token && token.refresh_token !== refreshToken) {
      await this.ctx.secrets.upsert({
        companyId,
        name: "hubspot-refresh-token",
        value: token.refresh_token,
        description: "HubSpot OAuth refresh token for the HubSpot plugin.",
      });
    }
    if (!token.access_token) throw new Error("HubSpot did not return an access token.");
    return token.access_token;
  }

  private async tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
    const response = await this.ctx.http.fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body).toString(),
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`HubSpot OAuth token request failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return payload as TokenResponse;
  }
}

export function summarizeResult(response: RawResponse, maxOutputBytes: number) {
  const summary = {
    status: response.status,
    payload: response.payload,
    rateLimit: response.rateLimit,
  };
  const serialized = JSON.stringify(summary);
  if (serialized.length <= maxOutputBytes) return summary;
  return {
    status: response.status,
    payloadTruncated: true,
    payloadPreview: serialized.slice(0, maxOutputBytes),
    rateLimit: response.rateLimit,
  };
}
