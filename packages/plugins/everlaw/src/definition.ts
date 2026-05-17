import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.everlaw",
  packageName: "@kesarcloud/plugin-everlaw",
  version: "0.1.0",
  displayName: "Everlaw",
  routePath: "everlaw",
  description: "Connects PaperClaw agents to Everlaw for organizations, projects, documents, binders, productions, searches, and users.",
  apiBaseUrl: "https://api.everlaw.com",
  tokenLabel: "Everlaw Organization API Key",
  oauthLabel: "Everlaw OAuth",
  connectedLabel: "Organization ID",
  apiBaseUrlLabel: "Everlaw Regional API Base URL",
  defaultScopes: [
    "organization"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "projectsList",
      displayName: "List Everlaw Projects",
      description: "List organization projects.",
      method: "GET",
      path: "/organizations/{organizationId}/projects",
      mutating: false,
      required: [
        "organizationId"
      ],
      queryParams: []
    },
    {
      key: "projectGet",
      displayName: "Get Everlaw Project",
      description: "Get a project.",
      method: "GET",
      path: "/projects/{projectId}",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    },
    {
      key: "documentsList",
      displayName: "List Everlaw Documents",
      description: "List project documents.",
      method: "GET",
      path: "/projects/{projectId}/documents",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: [
        "limit",
        "offset",
        "query"
      ]
    },
    {
      key: "documentGet",
      displayName: "Get Everlaw Document",
      description: "Get document metadata.",
      method: "GET",
      path: "/projects/{projectId}/documents/{documentId}",
      mutating: false,
      required: [
        "projectId",
        "documentId"
      ],
      queryParams: []
    },
    {
      key: "bindersList",
      displayName: "List Everlaw Binders",
      description: "List binders.",
      method: "GET",
      path: "/projects/{projectId}/binders",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    },
    {
      key: "binderCreate",
      displayName: "Create Everlaw Binder",
      description: "Create a binder.",
      method: "POST",
      path: "/projects/{projectId}/binders",
      mutating: true,
      required: [
        "projectId"
      ],
      queryParams: [],
      bodyParam: "binder"
    },
    {
      key: "productionsList",
      displayName: "List Everlaw Productions",
      description: "List productions.",
      method: "GET",
      path: "/projects/{projectId}/productions",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    },
    {
      key: "searchesList",
      displayName: "List Everlaw Searches",
      description: "List saved searches.",
      method: "GET",
      path: "/projects/{projectId}/searches",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    },
    {
      key: "usersList",
      displayName: "List Everlaw Users",
      description: "List project users.",
      method: "GET",
      path: "/projects/{projectId}/users",
      mutating: false,
      required: [
        "projectId"
      ],
      queryParams: []
    }
  ]
};
