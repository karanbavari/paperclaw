import type { PluginContext } from "@kesarcloud/plugin-sdk";
import { DEFAULT_CONFIG, DEFAULT_SCOPES } from "./constants.js";

export type CanvaConfig = {
  clientId: string;
  clientSecretRef: string;
  refreshTokenSecretRef: string;
  connectedCompanyId: string;
  connectedAt: string;
  connectedUserId: string;
  connectedDisplayName: string;
  redirectUri: string;
  enabledScopes: string[];
  dryRun: boolean;
  maxPollAttempts: number;
  requestTimeoutMs: number;
};

export type CanvaRequestPlan = {
  operation: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
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
};

const API_BASE_URL = "https://api.canva.com/rest";
const TOKEN_URL = `${API_BASE_URL}/v1/oauth/token`;

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return [...DEFAULT_SCOPES];
  return value.map((entry) => String(entry).trim()).filter(Boolean);
}

export function normalizeConfig(raw: Record<string, unknown>): CanvaConfig {
  return {
    clientId: typeof raw.clientId === "string" ? raw.clientId.trim() : DEFAULT_CONFIG.clientId,
    clientSecretRef: typeof raw.clientSecretRef === "string" ? raw.clientSecretRef.trim() : DEFAULT_CONFIG.clientSecretRef,
    refreshTokenSecretRef: typeof raw.refreshTokenSecretRef === "string" ? raw.refreshTokenSecretRef.trim() : DEFAULT_CONFIG.refreshTokenSecretRef,
    connectedCompanyId: typeof raw.connectedCompanyId === "string" ? raw.connectedCompanyId.trim() : DEFAULT_CONFIG.connectedCompanyId,
    connectedAt: typeof raw.connectedAt === "string" ? raw.connectedAt.trim() : DEFAULT_CONFIG.connectedAt,
    connectedUserId: typeof raw.connectedUserId === "string" ? raw.connectedUserId.trim() : DEFAULT_CONFIG.connectedUserId,
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

  if (!config.clientId) warnings.push("Canva Client ID is not configured.");
  if (!config.clientSecretRef) warnings.push("Canva Client Secret Reference is not configured.");
  if (!config.refreshTokenSecretRef) warnings.push("Canva is not connected yet.");
  if (!config.redirectUri) warnings.push("Redirect URI is not configured; the settings page can infer one from the current browser URL.");
  if (config.dryRun) warnings.push("Dry Run is enabled. Mutating Canva tools will return planned requests without changing Canva.");
  if (config.refreshTokenSecretRef && (!config.clientId || !config.clientSecretRef)) {
    errors.push("Canva refresh token is configured but client ID or client secret is missing.");
  }

  return { config, errors, warnings };
}

export function isConnected(config: CanvaConfig) {
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
    if (typeof record.message === "string") return record.message;
    if (typeof record.error_description === "string") return record.error_description;
    if (typeof record.error === "string") return record.error;
    const nested = record.error;
    if (nested && typeof nested === "object" && typeof (nested as { message?: unknown }).message === "string") {
      return (nested as { message: string }).message;
    }
  }
  return fallback;
}

export class CanvaClient {
  constructor(
    private readonly ctx: PluginContext,
    private readonly config: CanvaConfig,
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
      code_verifier: input.codeVerifier,
      redirect_uri: input.redirectUri,
    }, clientSecret);
  }

  async refreshAccessToken(): Promise<TokenResponse> {
    if (!isConnected(this.config)) throw new Error("Canva is not connected.");
    const [clientSecret, refreshToken] = await Promise.all([
      this.ctx.secrets.resolve(this.config.clientSecretRef),
      this.ctx.secrets.resolve(this.config.refreshTokenSecretRef),
    ]);
    return this.tokenRequest({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }, clientSecret);
  }

  async request(plan: CanvaRequestPlan): Promise<RawResponse> {
    const token = await this.refreshAccessToken();
    const accessToken = token.access_token;
    if (!accessToken) throw new Error("Canva did not return an access token.");
    const url = new URL(`${API_BASE_URL}${plan.path}`);
    for (const [key, value] of Object.entries(plan.query ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) {
        for (const item of value) url.searchParams.append(key, String(item));
      } else {
        url.searchParams.set(key, String(value));
      }
    }

    const isBinary = plan.body instanceof Uint8Array || plan.body instanceof ArrayBuffer || Buffer.isBuffer(plan.body);
    const response = await this.ctx.http.fetch(url.toString(), {
      method: plan.method,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        ...(plan.body === undefined || isBinary ? {} : { "content-type": "application/json" }),
        ...plan.headers,
      },
      body: plan.body === undefined || isBinary ? plan.body as BodyInit | undefined : JSON.stringify(plan.body),
      signal: AbortSignal.timeout(this.config.requestTimeoutMs),
    });
    const payload = await safeJson(response);
    if (!response.ok) {
      throw new Error(`Canva ${plan.operation} failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return { status: response.status, statusText: response.statusText, payload };
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
      throw new Error(`Canva OAuth token request failed (${response.status}): ${errorMessage(payload, response.statusText)}`);
    }
    return payload as TokenResponse;
  }
}

export function summarizeResult(response: RawResponse) {
  return {
    status: response.status,
    payload: response.payload,
  };
}
