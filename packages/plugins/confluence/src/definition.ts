import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.confluence",
  packageName: "@kesarcloud/plugin-confluence",
  version: "0.1.0",
  displayName: "Confluence",
  routePath: "confluence",
  description: "Connects PaperClaw agents to Confluence Cloud for spaces, pages, blog posts, comments, and search.",
  apiBaseUrl: "https://api.atlassian.com",
  authUrl: "https://auth.atlassian.com/authorize",
  tokenUrl: "https://auth.atlassian.com/oauth/token",
  tokenAuthStyle: "body",
  tokenLabel: "Confluence API Token",
  oauthLabel: "Atlassian OAuth",
  connectedLabel: "Cloud ID",
  defaultScopes: ["read:confluence-content.all","write:confluence-content","read:confluence-space.summary","offline_access"],
  rawPathPrefixes: ["/ex/confluence/"],
  endpoints: [
    { key: "accessibleResources", displayName: "List Atlassian Resources", description: "List accessible Confluence resources.", method: "GET", path: "/oauth/token/accessible-resources", mutating: false, required: [], queryParams: [] },
    { key: "spacesList", displayName: "List Confluence Spaces", description: "List spaces.", method: "GET", path: "/ex/confluence/{cloudId}/wiki/api/v2/spaces", mutating: false, required: ["cloudId"], queryParams: ["limit","cursor"] },
    { key: "pagesList", displayName: "List Confluence Pages", description: "List pages.", method: "GET", path: "/ex/confluence/{cloudId}/wiki/api/v2/pages", mutating: false, required: ["cloudId"], queryParams: ["space-id","limit","cursor"] },
    { key: "pageGet", displayName: "Get Confluence Page", description: "Get a page.", method: "GET", path: "/ex/confluence/{cloudId}/wiki/api/v2/pages/{pageId}", mutating: false, required: ["cloudId","pageId"], queryParams: ["body-format"] },
    { key: "pageCreate", displayName: "Create Confluence Page", description: "Create a page.", method: "POST", path: "/ex/confluence/{cloudId}/wiki/api/v2/pages", mutating: true, required: ["cloudId"], queryParams: [], bodyParam: "page" },
    { key: "pageUpdate", displayName: "Update Confluence Page", description: "Update a page.", method: "PUT", path: "/ex/confluence/{cloudId}/wiki/api/v2/pages/{pageId}", mutating: true, required: ["cloudId","pageId"], queryParams: [], bodyParam: "page" },
    { key: "search", displayName: "Search Confluence", description: "Search with CQL.", method: "GET", path: "/ex/confluence/{cloudId}/wiki/rest/api/search", mutating: false, required: ["cloudId"], queryParams: ["cql","limit","start"] },
    { key: "commentCreate", displayName: "Create Confluence Comment", description: "Create a comment.", method: "POST", path: "/ex/confluence/{cloudId}/wiki/api/v2/footer-comments", mutating: true, required: ["cloudId"], queryParams: [], bodyParam: "comment" },
  ],
};
