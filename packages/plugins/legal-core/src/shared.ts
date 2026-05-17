export type LegalAuthMode = "token" | "oauth";

export type LegalEndpoint = {
  key: string;
  displayName: string;
  description: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  mutating?: boolean;
  required?: string[];
  queryParams?: string[];
  bodyParam?: string;
};

export type LegalDefinition = {
  id: string;
  packageName: string;
  version: string;
  displayName: string;
  routePath: string;
  description: string;
  apiBaseUrl: string;
  authUrl?: string;
  tokenUrl?: string;
  tokenAuthStyle?: "body" | "basic";
  tokenLabel: string;
  oauthLabel: string;
  connectedLabel: string;
  apiBaseUrlLabel?: string;
  authScheme?: "bearer" | "api-key";
  accessTokenHeaderName?: string;
  connectedAccountHeaderName?: string;
  defaultScopes: string[];
  rawPathPrefixes: string[];
  endpoints: LegalEndpoint[];
};

export const legalDataKeys = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const legalActionKeys = {
  saveAccessToken: "save-access-token",
  saveClientSecret: "save-client-secret",
  startOauth: "start-oauth",
  completeOauth: "complete-oauth",
  disconnect: "disconnect",
} as const;
