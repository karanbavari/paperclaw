export type DeveloperAuthMode = "token" | "oauth";

export type DeveloperEndpoint = {
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

export type DeveloperDefinition = {
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
  authScheme?: "bearer" | "api-key" | "basic" | "body";
  accessTokenHeaderName?: string;
  accessTokenBodyName?: string;
  connectedAccountHeaderName?: string;
  connectedAccountBodyName?: string;
  defaultScopes: string[];
  rawPathPrefixes: string[];
  endpoints: DeveloperEndpoint[];
};

export const developerDataKeys = {
  status: "status",
  recentCommands: "recent-commands",
} as const;

export const developerActionKeys = {
  saveAccessToken: "save-access-token",
  saveClientSecret: "save-client-secret",
  startOauth: "start-oauth",
  completeOauth: "complete-oauth",
  disconnect: "disconnect",
} as const;
