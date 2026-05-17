import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.linear",
  packageName: "@kesarcloud/plugin-linear",
  version: "0.1.0",
  displayName: "Linear",
  routePath: "linear",
  description: "Connects PaperClaw agents to Linear through GraphQL for teams, users, projects, issues, comments, cycles, and labels.",
  apiBaseUrl: "https://api.linear.app",
  authUrl: "https://linear.app/oauth/authorize",
  tokenUrl: "https://api.linear.app/oauth/token",
  tokenAuthStyle: "body",
  tokenLabel: "Linear API Key",
  oauthLabel: "Linear OAuth",
  connectedLabel: "Connected Workspace",
  defaultScopes: ["read","write"],
  rawPathPrefixes: ["/graphql"],
  endpoints: [
    { key: "graphqlQuery", displayName: "Run Linear GraphQL Query", description: "Run a read GraphQL query.", method: "POST", path: "/graphql", mutating: false, required: [], queryParams: [], bodyParam: "body" },
    { key: "graphqlMutation", displayName: "Run Linear GraphQL Mutation", description: "Run a GraphQL mutation.", method: "POST", path: "/graphql", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "teamsList", displayName: "List Linear Teams", description: "List teams.", method: "POST", path: "/graphql", mutating: false, required: [], queryParams: [], bodyParam: "body" },
    { key: "issuesList", displayName: "List Linear Issues", description: "List issues.", method: "POST", path: "/graphql", mutating: false, required: [], queryParams: [], bodyParam: "body" },
    { key: "issueCreate", displayName: "Create Linear Issue", description: "Create an issue.", method: "POST", path: "/graphql", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "issueUpdate", displayName: "Update Linear Issue", description: "Update an issue.", method: "POST", path: "/graphql", mutating: true, required: [], queryParams: [], bodyParam: "body" },
    { key: "commentCreate", displayName: "Create Linear Comment", description: "Create a comment.", method: "POST", path: "/graphql", mutating: true, required: [], queryParams: [], bodyParam: "body" },
  ],
};
