import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.imanage",
  packageName: "@kesarcloud/plugin-imanage",
  version: "0.1.0",
  displayName: "iManage",
  routePath: "imanage",
  description: "Connects PaperClaw agents to iManage Work for libraries, workspaces, folders, documents, users, and profile metadata.",
  apiBaseUrl: "https://example.imanage.work/api/v2",
  authUrl: "https://example.imanage.work/auth/oauth2/authorize",
  tokenUrl: "https://example.imanage.work/auth/oauth2/token",
  tokenLabel: "iManage Access Token",
  oauthLabel: "iManage OAuth",
  connectedLabel: "Customer/Library",
  apiBaseUrlLabel: "iManage Work API Base URL",
  defaultScopes: [
    "user",
    "work"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "librariesList",
      displayName: "List iManage Libraries",
      description: "List customer libraries.",
      method: "GET",
      path: "/customers/{customerId}/libraries",
      mutating: false,
      required: [
        "customerId"
      ],
      queryParams: []
    },
    {
      key: "workspacesList",
      displayName: "List iManage Workspaces",
      description: "List workspaces.",
      method: "GET",
      path: "/customers/{customerId}/libraries/{libraryId}/workspaces",
      mutating: false,
      required: [
        "customerId",
        "libraryId"
      ],
      queryParams: [
        "q",
        "limit",
        "offset"
      ]
    },
    {
      key: "workspaceGet",
      displayName: "Get iManage Workspace",
      description: "Get a workspace.",
      method: "GET",
      path: "/customers/{customerId}/libraries/{libraryId}/workspaces/{workspaceId}",
      mutating: false,
      required: [
        "customerId",
        "libraryId",
        "workspaceId"
      ],
      queryParams: []
    },
    {
      key: "foldersList",
      displayName: "List iManage Folders",
      description: "List folders.",
      method: "GET",
      path: "/customers/{customerId}/libraries/{libraryId}/workspaces/{workspaceId}/folders",
      mutating: false,
      required: [
        "customerId",
        "libraryId",
        "workspaceId"
      ],
      queryParams: []
    },
    {
      key: "documentsList",
      displayName: "List iManage Documents",
      description: "List documents.",
      method: "GET",
      path: "/customers/{customerId}/libraries/{libraryId}/folders/{folderId}/documents",
      mutating: false,
      required: [
        "customerId",
        "libraryId",
        "folderId"
      ],
      queryParams: [
        "limit",
        "offset"
      ]
    },
    {
      key: "documentGet",
      displayName: "Get iManage Document",
      description: "Get document metadata.",
      method: "GET",
      path: "/customers/{customerId}/libraries/{libraryId}/documents/{documentId}",
      mutating: false,
      required: [
        "customerId",
        "libraryId",
        "documentId"
      ],
      queryParams: []
    },
    {
      key: "documentCreate",
      displayName: "Create iManage Document",
      description: "Create document metadata/upload request.",
      method: "POST",
      path: "/customers/{customerId}/libraries/{libraryId}/documents",
      mutating: true,
      required: [
        "customerId",
        "libraryId"
      ],
      queryParams: [],
      bodyParam: "document"
    },
    {
      key: "search",
      displayName: "Search iManage",
      description: "Search workspaces and documents.",
      method: "POST",
      path: "/customers/{customerId}/libraries/{libraryId}/search",
      mutating: false,
      required: [
        "customerId",
        "libraryId"
      ],
      queryParams: [],
      bodyParam: "body"
    }
  ]
};
