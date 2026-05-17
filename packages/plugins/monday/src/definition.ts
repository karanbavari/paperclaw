import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.monday",
  packageName: "@kesarcloud/plugin-monday",
  version: "0.1.0",
  displayName: "monday.com",
  routePath: "monday",
  description: "Connects PaperClaw agents to monday.com for boards, groups, items, columns, updates, and docs through GraphQL.",
  apiBaseUrl: "https://api.monday.com/v2",
  authUrl: "https://auth.monday.com/oauth2/authorize",
  tokenUrl: "https://auth.monday.com/oauth2/token",
  tokenAuthStyle: "body",
  tokenLabel: "monday.com API Token",
  oauthLabel: "monday.com OAuth",
  connectedLabel: "Connected Account",
  defaultScopes: ["boards:read","boards:write","users:read","updates:read","updates:write"],
  rawPathPrefixes: ["/"],
  endpoints: [
    { key: "graphqlQuery", displayName: "Run monday.com GraphQL Query", description: "Run a read GraphQL query.", method: "POST", path: "/", mutating: false, required: [], queryParams: [], bodyParam: "body" },
    { key: "graphqlMutation", displayName: "Run monday.com GraphQL Mutation", description: "Run a GraphQL mutation.", method: "POST", path: "/", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "boardsList", displayName: "List monday.com Boards", description: "List boards.", method: "POST", path: "/", mutating: false, required: [], queryParams: [], bodyParam: "body" },
    { key: "itemCreate", displayName: "Create monday.com Item", description: "Create an item.", method: "POST", path: "/", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "itemUpdate", displayName: "Update monday.com Item", description: "Update item column values.", method: "POST", path: "/", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "updateCreate", displayName: "Create monday.com Update", description: "Create an item update.", method: "POST", path: "/", mutating: true, required: [], queryParams: [], bodyParam: "body" },
  ],
};
