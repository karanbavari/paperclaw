import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.pandadoc",
  packageName: "@kesarcloud/plugin-pandadoc",
  version: "0.1.0",
  displayName: "PandaDoc",
  routePath: "pandadoc",
  description: "Connects PaperClaw agents to PandaDoc for documents, templates, contacts, recipients, folders, sends, and status tracking.",
  apiBaseUrl: "https://api.pandadoc.com/public/v1",
  authUrl: "https://app.pandadoc.com/oauth2/authorize",
  tokenUrl: "https://api.pandadoc.com/oauth2/access_token",
  tokenLabel: "PandaDoc API Key",
  oauthLabel: "PandaDoc OAuth",
  connectedLabel: "Connected Workspace",
  defaultScopes: [
    "read+write"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "documentsList",
      displayName: "List PandaDoc Documents",
      description: "List documents.",
      method: "GET",
      path: "/documents",
      mutating: false,
      required: [],
      queryParams: [
        "count",
        "page",
        "status",
        "q"
      ]
    },
    {
      key: "documentGet",
      displayName: "Get PandaDoc Document",
      description: "Get a document.",
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
      displayName: "Create PandaDoc Document",
      description: "Create a document.",
      method: "POST",
      path: "/documents",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "document"
    },
    {
      key: "documentSend",
      displayName: "Send PandaDoc Document",
      description: "Send a document.",
      method: "POST",
      path: "/documents/{documentId}/send",
      mutating: true,
      required: [
        "documentId"
      ],
      queryParams: [],
      bodyParam: "send"
    },
    {
      key: "templatesList",
      displayName: "List PandaDoc Templates",
      description: "List templates.",
      method: "GET",
      path: "/templates",
      mutating: false,
      required: [],
      queryParams: [
        "count",
        "page",
        "q"
      ]
    },
    {
      key: "contactsList",
      displayName: "List PandaDoc Contacts",
      description: "List contacts.",
      method: "GET",
      path: "/contacts",
      mutating: false,
      required: [],
      queryParams: [
        "count",
        "page",
        "email"
      ]
    },
    {
      key: "contactCreate",
      displayName: "Create PandaDoc Contact",
      description: "Create a contact.",
      method: "POST",
      path: "/contacts",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "contact"
    },
    {
      key: "foldersList",
      displayName: "List PandaDoc Folders",
      description: "List folders.",
      method: "GET",
      path: "/folders",
      mutating: false,
      required: [],
      queryParams: [
        "count",
        "page"
      ]
    }
  ]
};
