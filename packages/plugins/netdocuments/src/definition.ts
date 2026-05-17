import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.netdocuments",
  packageName: "@kesarcloud/plugin-netdocuments",
  version: "0.1.0",
  displayName: "NetDocuments",
  routePath: "netdocuments",
  description: "Connects PaperClaw agents to NetDocuments for cabinets, workspaces, folders, documents, metadata profiles, and search.",
  apiBaseUrl: "https://api.vault.netvoyage.com/v1",
  authUrl: "https://api.vault.netvoyage.com/oauth/authorize",
  tokenUrl: "https://api.vault.netvoyage.com/oauth/token",
  tokenLabel: "NetDocuments Access Token",
  oauthLabel: "NetDocuments OAuth",
  connectedLabel: "Repository/Cabinet",
  apiBaseUrlLabel: "NetDocuments API Base URL",
  defaultScopes: [
    "full"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "cabinetsList",
      displayName: "List NetDocuments Cabinets",
      description: "List cabinets.",
      method: "GET",
      path: "/cabinets",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "workspacesList",
      displayName: "List NetDocuments Workspaces",
      description: "List workspaces.",
      method: "GET",
      path: "/workspaces",
      mutating: false,
      required: [],
      queryParams: [
        "q",
        "limit",
        "offset"
      ]
    },
    {
      key: "workspaceGet",
      displayName: "Get NetDocuments Workspace",
      description: "Get workspace details.",
      method: "GET",
      path: "/workspaces/{workspaceId}",
      mutating: false,
      required: [
        "workspaceId"
      ],
      queryParams: []
    },
    {
      key: "foldersList",
      displayName: "List NetDocuments Folder Contents",
      description: "List folder contents.",
      method: "GET",
      path: "/folders/{folderId}/contents",
      mutating: false,
      required: [
        "folderId"
      ],
      queryParams: [
        "limit",
        "offset"
      ]
    },
    {
      key: "documentGet",
      displayName: "Get NetDocuments Document",
      description: "Get document metadata.",
      method: "GET",
      path: "/documents/{documentId}",
      mutating: false,
      required: [
        "documentId"
      ],
      queryParams: []
    },
    {
      key: "documentCreate",
      displayName: "Create NetDocuments Document",
      description: "Create document metadata/upload request.",
      method: "POST",
      path: "/documents",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "document"
    },
    {
      key: "profileUpdate",
      displayName: "Update NetDocuments Profile",
      description: "Update document profile metadata.",
      method: "PATCH",
      path: "/documents/{documentId}/profile",
      mutating: true,
      required: [
        "documentId"
      ],
      queryParams: [],
      bodyParam: "profile"
    },
    {
      key: "search",
      displayName: "Search NetDocuments",
      description: "Search documents and workspaces.",
      method: "POST",
      path: "/search",
      mutating: false,
      required: [],
      queryParams: [],
      bodyParam: "body"
    }
  ]
};
