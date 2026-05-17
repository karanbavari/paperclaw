import type { LegalDefinition } from "@kesarcloud/plugin-legal-core";

export const definition: LegalDefinition = {
  id: "paperclaw.legal-tracker",
  packageName: "@kesarcloud/plugin-legal-tracker",
  version: "0.1.0",
  displayName: "Legal Tracker",
  routePath: "legal-tracker",
  description: "Connects PaperClaw agents to Thomson Reuters Legal Tracker for matters, invoices, firms, budgets, accruals, documents, and users.",
  apiBaseUrl: "https://api.legaltracker.thomsonreuters.com",
  tokenLabel: "Legal Tracker Access Token",
  oauthLabel: "Legal Tracker OAuth",
  connectedLabel: "Company/Tenant ID",
  apiBaseUrlLabel: "Legal Tracker Regional API Base URL",
  defaultScopes: [
    "matters",
    "invoices",
    "documents"
  ],
  rawPathPrefixes: [
    "/"
  ],
  endpoints: [
    {
      key: "mattersList",
      displayName: "List Legal Tracker Matters",
      description: "List matters.",
      method: "GET",
      path: "/matters",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "offset",
        "status",
        "query"
      ]
    },
    {
      key: "matterGet",
      displayName: "Get Legal Tracker Matter",
      description: "Get a matter.",
      method: "GET",
      path: "/matters/{matterId}",
      mutating: false,
      required: [
        "matterId"
      ],
      queryParams: []
    },
    {
      key: "matterCreate",
      displayName: "Create Legal Tracker Matter",
      description: "Create a matter.",
      method: "POST",
      path: "/matters",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "matter"
    },
    {
      key: "invoicesList",
      displayName: "List Legal Tracker Invoices",
      description: "List invoices.",
      method: "GET",
      path: "/invoices",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "offset",
        "status",
        "matterId"
      ]
    },
    {
      key: "invoiceGet",
      displayName: "Get Legal Tracker Invoice",
      description: "Get an invoice.",
      method: "GET",
      path: "/invoices/{invoiceId}",
      mutating: false,
      required: [
        "invoiceId"
      ],
      queryParams: []
    },
    {
      key: "firmsList",
      displayName: "List Legal Tracker Firms",
      description: "List vendors/firms.",
      method: "GET",
      path: "/firms",
      mutating: false,
      required: [],
      queryParams: [
        "limit",
        "offset",
        "query"
      ]
    },
    {
      key: "budgetsList",
      displayName: "List Legal Tracker Budgets",
      description: "List budgets.",
      method: "GET",
      path: "/budgets",
      mutating: false,
      required: [],
      queryParams: [
        "matterId"
      ]
    },
    {
      key: "accrualsList",
      displayName: "List Legal Tracker Accruals",
      description: "List accruals.",
      method: "GET",
      path: "/accruals",
      mutating: false,
      required: [],
      queryParams: [
        "matterId",
        "period"
      ]
    },
    {
      key: "documentsList",
      displayName: "List Legal Tracker Documents",
      description: "List documents.",
      method: "GET",
      path: "/documents",
      mutating: false,
      required: [],
      queryParams: [
        "matterId",
        "limit",
        "offset"
      ]
    },
    {
      key: "documentCreate",
      displayName: "Create Legal Tracker Document",
      description: "Create document metadata/upload association.",
      method: "POST",
      path: "/documents",
      mutating: true,
      required: [],
      queryParams: [],
      bodyParam: "document"
    }
  ]
};
