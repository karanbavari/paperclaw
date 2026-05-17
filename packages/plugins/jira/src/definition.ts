import type { ProductivityDefinition } from "@kesarcloud/plugin-productivity-core";

export const definition: ProductivityDefinition = {
  id: "paperclaw.jira",
  packageName: "@kesarcloud/plugin-jira",
  version: "0.1.0",
  displayName: "Jira",
  routePath: "jira",
  description: "Connects PaperClaw agents to Jira Cloud for sites, projects, issues, JQL search, comments, transitions, and users.",
  apiBaseUrl: "https://api.atlassian.com",
  authUrl: "https://auth.atlassian.com/authorize",
  tokenUrl: "https://auth.atlassian.com/oauth/token",
  tokenAuthStyle: "body",
  tokenLabel: "Jira API Token",
  oauthLabel: "Atlassian OAuth",
  connectedLabel: "Cloud ID",
  defaultScopes: ["read:jira-work","write:jira-work","read:jira-user","offline_access"],
  rawPathPrefixes: ["/ex/jira/"],
  endpoints: [
    { key: "accessibleResources", displayName: "List Atlassian Resources", description: "List accessible Jira resources.", method: "GET", path: "/oauth/token/accessible-resources", mutating: false, required: [], queryParams: [] },
    { key: "projectsList", displayName: "List Jira Projects", description: "List projects.", method: "GET", path: "/ex/jira/{cloudId}/rest/api/3/project/search", mutating: false, required: ["cloudId"], queryParams: ["maxResults","startAt","query"] },
    { key: "issueGet", displayName: "Get Jira Issue", description: "Get an issue.", method: "GET", path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}", mutating: false, required: ["cloudId","issueIdOrKey"], queryParams: ["fields"] },
    { key: "issueSearch", displayName: "Search Jira Issues", description: "Search with JQL.", method: "POST", path: "/ex/jira/{cloudId}/rest/api/3/search", mutating: false, required: ["cloudId"], queryParams: [], bodyParam: "body" },
    { key: "issueCreate", displayName: "Create Jira Issue", description: "Create an issue.", method: "POST", path: "/ex/jira/{cloudId}/rest/api/3/issue", mutating: true, required: ["cloudId"], queryParams: [], bodyParam: "issue" },
    { key: "issueUpdate", displayName: "Update Jira Issue", description: "Update an issue.", method: "PUT", path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}", mutating: true, required: ["cloudId","issueIdOrKey"], queryParams: [], bodyParam: "issue" },
    { key: "commentCreate", displayName: "Create Jira Comment", description: "Create an issue comment.", method: "POST", path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/comment", mutating: true, required: ["cloudId","issueIdOrKey"], queryParams: [], bodyParam: "comment" },
    { key: "transitionIssue", displayName: "Transition Jira Issue", description: "Transition an issue.", method: "POST", path: "/ex/jira/{cloudId}/rest/api/3/issue/{issueIdOrKey}/transitions", mutating: true, required: ["cloudId","issueIdOrKey"], queryParams: [], bodyParam: "transition" },
  ],
};
