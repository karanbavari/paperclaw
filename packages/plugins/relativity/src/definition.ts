import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.relativity",
  packageName: "@kesarcloud/plugin-relativity",
  version: "0.1.0",
  displayName: "Relativity",
  routePath: "relativity",
  description: "Connects PaperClaw agents to Relativity for workspaces, matters/cases, documents, saved searches, and job/export status.",
  apiBaseUrl: "https://your-relativity.example.com/Relativity.REST/api",
  tokenLabel: "Relativity Access Token",
  oauthLabel: "Relativity OAuth",
  connectedLabel: "Relativity Instance/Workspace",
  apiBaseUrlLabel: "Relativity REST API Base URL",
  defaultScopes: [
    "SystemUserInfo",
    "Workspace"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "workspacesList",
      displayName: "List Relativity Workspaces",
      description: "List workspaces.",
      method: "GET",
      path: "/Relativity.Services.Workspace.IWorkspaceModule/Workspace%20Manager/GetWorkspacesAsync",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "workspaceObjectsQuery",
      displayName: "Query Relativity Objects",
      description: "Query workspace objects.",
      method: "POST",
      path: "/Relativity.Objects/workspace/{workspaceId}/object/query",
      mutating: false,
      required: [
        "workspaceId"
      ],
      queryParams: [],
      bodyParam: "query"
    },
    {
      key: "documentGet",
      displayName: "Get Relativity Document",
      description: "Get document object details.",
      method: "GET",
      path: "/Relativity.Objects/workspace/{workspaceId}/object/{documentArtifactId}",
      mutating: false,
      required: [
        "workspaceId",
        "documentArtifactId"
      ],
      queryParams: []
    },
    {
      key: "documentUpdate",
      displayName: "Update Relativity Document",
      description: "Update document fields.",
      method: "POST",
      path: "/Relativity.Objects/workspace/{workspaceId}/object/update",
      mutating: true,
      required: [
        "workspaceId"
      ],
      queryParams: [],
      bodyParam: "document"
    },
    {
      key: "savedSearchesQuery",
      displayName: "Query Relativity Saved Searches",
      description: "Query saved searches.",
      method: "POST",
      path: "/Relativity.Objects/workspace/{workspaceId}/object/query",
      mutating: false,
      required: [
        "workspaceId"
      ],
      queryParams: [],
      bodyParam: "query"
    },
    {
      key: "jobsList",
      displayName: "List Relativity Jobs",
      description: "List import/export job status.",
      method: "GET",
      path: "/Relativity.Services.Job.IJobModule/workspace/{workspaceId}/jobs",
      mutating: false,
      required: [
        "workspaceId"
      ],
      queryParams: []
    }
  ]
};
