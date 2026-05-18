export type RealEstateAuthMode = "token" | "oauth";

export type RealEstateEndpoint = {
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

export type RealEstateDefinition = {
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
  authScheme?: "bearer" | "api-key" | "basic-token";
  accessTokenHeaderName?: string;
  connectedAccountHeaderName?: string;
  defaultScopes: string[];
  rawPathPrefixes: string[];
  endpoints: RealEstateEndpoint[];
};

export const realEstateDataKeys = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const realEstateActionKeys = {
  saveAccessToken: "save-access-token",
  saveClientSecret: "save-client-secret",
  startOauth: "start-oauth",
  completeOauth: "complete-oauth",
  disconnect: "disconnect",
} as const;
