import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.adobe-sign",
  packageName: "@kesarcloud/plugin-adobe-sign",
  version: "0.1.0",
  displayName: "Adobe Sign",
  routePath: "adobe-sign",
  description: "Connects PaperClaw agents to Adobe Acrobat Sign for agreements, transient documents, templates, users, and reminders.",
  apiBaseUrl: "https://api.na1.adobesign.com/api/rest/v6",
  authUrl: "https://secure.na1.adobesign.com/public/oauth/v2",
  tokenUrl: "https://api.na1.adobesign.com/oauth/v2/token",
  tokenLabel: "Adobe Sign Access Token",
  oauthLabel: "Adobe Sign OAuth",
  connectedLabel: "Connected Adobe Sign Account",
  apiBaseUrlLabel: "Adobe Sign Regional API Base URL",
  defaultScopes: [
    "agreement_read",
    "agreement_write",
    "user_read",
    "library_read"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "agreementsList",
      displayName: "List Adobe Sign Agreements",
      description: "List agreements.",
      method: "GET",
      path: "/agreements",
      mutating: false,
      required: [],
      queryParams: [
        "pageSize",
        "pageCursor",
        "query"
      ]
    },
    {
      key: "agreementGet",
      displayName: "Get Adobe Sign Agreement",
      description: "Get agreement details.",
      method: "GET",
      path: "/agreements/{agreementId}",
      mutating: false,
      required: [
        "agreementId"
      ],
      queryParams: []
    },
    {
      key: "agreementCreate",
      displayName: "Create Adobe Sign Agreement",
      description: "Create an agreement.",
      method: "POST",
      path: "/agreements",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "agreement"
    },
    {
      key: "transientDocumentCreate",
      displayName: "Create Adobe Sign Transient Document",
      description: "Upload a transient document metadata request.",
      method: "POST",
      path: "/transientDocuments",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "document"
    },
    {
      key: "libraryDocumentsList",
      displayName: "List Adobe Sign Library Documents",
      description: "List reusable library documents.",
      method: "GET",
      path: "/libraryDocuments",
      mutating: false,
      required: [],
      queryParams: [
        "pageSize",
        "pageCursor"
      ]
    },
    {
      key: "usersList",
      displayName: "List Adobe Sign Users",
      description: "List users.",
      method: "GET",
      path: "/users",
      mutating: false,
      required: [],
      queryParams: [
        "pageSize",
        "pageCursor"
      ]
    },
    {
      key: "meGet",
      displayName: "Get Adobe Sign Current User",
      description: "Get current user.",
      method: "GET",
      path: "/users/me",
      mutating: false,
      required: [],
      queryParams: []
    },
    {
      key: "reminderCreate",
      displayName: "Create Adobe Sign Reminder",
      description: "Create an agreement reminder.",
      method: "POST",
      path: "/agreements/{agreementId}/reminders",
      mutating: true,
      required: [
        "agreementId"
      ],
      queryParams: [],
      bodyParam: "reminder"
    }
  ]
};
